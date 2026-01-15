#!/bin/bash
# v0-fetch.sh - v0生成コードを取得して_v0_dropに整理
# Usage: ./scripts/v0-fetch.sh <v0_url> <context>/<feature>

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 引数チェック
if [ $# -lt 2 ]; then
  echo -e "${RED}Error: Missing arguments${NC}"
  echo ""
  echo "Usage: ./scripts/v0-fetch.sh <v0_url> <context>/<feature>"
  echo ""
  echo "Example:"
  echo "  ./scripts/v0-fetch.sh 'https://v0.dev/chat/abc123' master-data/employee-master"
  echo ""
  exit 1
fi

V0_URL="$1"
FEATURE_PATH="$2"
CONTEXT=$(echo "$FEATURE_PATH" | cut -d'/' -f1)
FEATURE=$(echo "$FEATURE_PATH" | cut -d'/' -f2)

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📦 v0 Component Fetch & Integration Script${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Source:${NC}    $V0_URL"
echo -e "${YELLOW}Target:${NC}    $FEATURE_PATH"
echo -e "${YELLOW}Context:${NC}   $CONTEXT"
echo -e "${YELLOW}Feature:${NC}   $FEATURE"
echo ""

# apps/web ディレクトリに移動
cd "$(dirname "$0")/../apps/web" || exit 1

echo -e "${BLUE}[1/6]${NC} Fetching component from v0.dev..."
# v0 CLI でコンポーネント追加
if npx v0 add "$V0_URL"; then
  echo -e "${GREEN}✅ Component fetched successfully${NC}"
else
  echo -e "${RED}❌ Failed to fetch component${NC}"
  echo -e "${YELLOW}Hint: Try running 'npx v0 login' first${NC}"
  exit 1
fi

echo ""
echo -e "${BLUE}[2/6]${NC} Creating _v0_drop directory structure..."
# _v0_drop ディレクトリ作成
TARGET_DIR="_v0_drop/$FEATURE_PATH/src"
mkdir -p "$TARGET_DIR"/{components,api,types}
echo -e "${GREEN}✅ Directory created: $TARGET_DIR${NC}"

echo ""
echo -e "${BLUE}[3/6]${NC} Moving generated files to _v0_drop..."

# 生成されたファイルを移動
# (v0が src/components/ に生成したファイルを特定)
if [ -d "src/components" ]; then
  LATEST_FILES=$(find src/components -type f -name "*.tsx" -mmin -5)

  if [ -n "$LATEST_FILES" ]; then
    for file in $LATEST_FILES; do
      filename=$(basename "$file")
      echo -e "  Moving: ${YELLOW}$filename${NC}"
      mv "$file" "$TARGET_DIR/components/"
    done
    echo -e "${GREEN}✅ Component files moved${NC}"
  else
    echo -e "${YELLOW}⚠️  No recent .tsx files found in src/components${NC}"
  fi
fi

# page.tsx などの関連ファイルも移動 (存在する場合)
if [ -f "src/page.tsx" ]; then
  echo -e "  Moving: ${YELLOW}page.tsx${NC}"
  mv src/page.tsx "$TARGET_DIR/"
fi

if [ -f "src/app/page.tsx" ]; then
  echo -e "  Moving: ${YELLOW}app/page.tsx${NC}"
  mv src/app/page.tsx "$TARGET_DIR/"
fi

# api/ ディレクトリがあれば移動
if [ -d "src/api" ]; then
  echo -e "  Moving: ${YELLOW}api/${NC}"
  mv src/api/* "$TARGET_DIR/api/" 2>/dev/null || true
fi

# types/ ディレクトリがあれば移動
if [ -d "src/types" ]; then
  echo -e "  Moving: ${YELLOW}types/${NC}"
  mv src/types/* "$TARGET_DIR/types/" 2>/dev/null || true
fi

echo ""
echo -e "${BLUE}[4/6]${NC} Generating file tree..."
TREE_OUTPUT=$(cd "$TARGET_DIR" && find . -type f -not -path "*/node_modules/*" | sed 's|^\./||' | sort)

echo ""
echo -e "${BLUE}[5/6]${NC} Creating OUTPUT.md template..."
# OUTPUT.md 作成
cat > "$TARGET_DIR/OUTPUT.md" << EOF
# v0 Generated Output - $FEATURE

## 1) Generated files (tree)

\`\`\`
$TARGET_DIR/
$(echo "$TREE_OUTPUT" | sed 's/^/├── /')
\`\`\`

## 2) Key imports / dependency notes

- **@/shared/ui**: [List which Tier 1 components are used: Button, Table, Card, etc.]
- **@contracts/bff/$CONTEXT/$FEATURE**: [List DTO types imported]
- **BffClient**: Interface for all BFF API calls
- **MockBffClient**: Mock implementation for development
- **HttpBffClient**: Production implementation (not yet connected)

## 3) Missing Shared Component / Pattern (TODO)

Review the generated code and identify any components that should be elevated to shared/ui:

- [ ] [Example: DataTable wrapper] (apps/web/src/shared/ui/components/data-table.tsx)
- [ ] [Example: SearchInput with debounce] (apps/web/src/shared/ui/components/search-input.tsx)
- [ ] @/shared/ui barrel export (apps/web/src/shared/ui/index.ts)

## 4) Migration notes (_v0_drop → features)

1. **Implement missing shared components first** (see TODO above)
2. **Create @/shared/ui barrel export** if not exists
3. **Move src/ to apps/web/src/features/$CONTEXT/$FEATURE**
   \`\`\`bash
   mv apps/web/_v0_drop/$FEATURE_PATH/src \\
      apps/web/src/features/$CONTEXT/$FEATURE
   \`\`\`
4. **Update imports to use @/shared/ui** (Cursor)
   - Replace direct component imports with barrel exports
5. **Replace mock DTOs with @contracts/bff imports**
   - Update all type imports to use actual contracts
6. **Register route** in apps/web/src/app/$CONTEXT/$FEATURE/page.tsx
   \`\`\`typescript
   import Page from '@/features/$CONTEXT/$FEATURE/page'
   export default Page
   \`\`\`
7. **Add menu entry** in apps/web/src/shared/navigation/menu.ts
   \`\`\`typescript
   {
     id: '$FEATURE',
     label: '[Japanese Label]',
     href: '/$CONTEXT/$FEATURE',
     icon: '[IconName]'
   }
   \`\`\`

## 5) Constraint compliance checklist

Review the generated code against CCSDD constraints:

- [ ] Code written ONLY under apps/web/_v0_drop/$CONTEXT/$FEATURE/src
- [ ] UI components imported ONLY from @/shared/ui (or will be after migration)
- [ ] DTO types imported from packages/contracts/src/bff (or will be after migration)
- [ ] No imports from packages/contracts/src/api
- [ ] No Domain API direct calls (/api/)
- [ ] No direct fetch() outside api/HttpBffClient.ts
- [ ] No layout.tsx generated
- [ ] No base UI components created under features
- [ ] No raw color literals (bg-[#...], text-[#...], etc.)
- [ ] No new sidebar/header/shell created inside the feature

## 6) Next Steps

1. Review this OUTPUT.md and update TODOs
2. Open in Cursor and implement missing shared components:
   \`\`\`bash
   cursor apps/web/$TARGET_DIR
   \`\`\`
3. Follow migration notes (section 4) to integrate into features/
4. Test with mock data:
   \`\`\`bash
   pnpm dev
   # Navigate to: http://localhost:3000/$CONTEXT/$FEATURE
   \`\`\`
5. Connect to BFF API (after BFF implementation complete)

---

**Generated by**: v0-fetch.sh
**Source URL**: $V0_URL
**Generated at**: $(date '+%Y-%m-%d %H:%M:%S')
EOF

echo -e "${GREEN}✅ OUTPUT.md created${NC}"

echo ""
echo -e "${BLUE}[6/6]${NC} Generating summary..."

# ファイル数をカウント
COMPONENT_COUNT=$(find "$TARGET_DIR/components" -type f -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')
API_COUNT=$(find "$TARGET_DIR/api" -type f 2>/dev/null | wc -l | tr -d ' ')
TYPE_COUNT=$(find "$TARGET_DIR/types" -type f 2>/dev/null | wc -l | tr -d ' ')

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ v0 Component Successfully Fetched!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📂 Location:${NC}      apps/web/$TARGET_DIR"
echo -e "${BLUE}📄 Components:${NC}    $COMPONENT_COUNT file(s)"
echo -e "${BLUE}🔌 API:${NC}           $API_COUNT file(s)"
echo -e "${BLUE}📐 Types:${NC}         $TYPE_COUNT file(s)"
echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo ""
echo -e "  1. Review OUTPUT.md:"
echo -e "     ${BLUE}cat apps/web/$TARGET_DIR/OUTPUT.md${NC}"
echo ""
echo -e "  2. Open in Cursor:"
echo -e "     ${BLUE}cursor apps/web/$TARGET_DIR${NC}"
echo ""
echo -e "  3. Implement missing shared components (see OUTPUT.md section 3)"
echo ""
echo -e "  4. Move to features directory:"
echo -e "     ${BLUE}mv apps/web/$TARGET_DIR apps/web/src/features/$CONTEXT/$FEATURE${NC}"
echo ""
echo -e "  5. Update imports and integrate with BFF (Cursor)"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 元のディレクトリに戻る
cd ../..

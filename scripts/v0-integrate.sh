#!/bin/bash
# v0-integrate.sh - v0 コンポーネントの完全な統合ワークフロー
# v0-fetch + OUTPUT.md 確認 + Missing Components 実装 + features 移行まで

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${CYAN}$1${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_step() {
  echo ""
  echo -e "${BLUE}[Step $1] $2${NC}"
  echo ""
}

# 引数チェック
if [ $# -lt 2 ]; then
  echo -e "${RED}Error: Missing arguments${NC}"
  echo ""
  echo "Usage: ./scripts/v0-integrate.sh <v0_url> <context>/<feature> [--auto-migrate]"
  echo ""
  echo "Options:"
  echo "  --auto-migrate    Automatically migrate to features/ without confirmation"
  echo ""
  echo "Example:"
  echo "  ./scripts/v0-integrate.sh 'https://v0.dev/chat/abc123' master-data/employee-master"
  echo ""
  exit 1
fi

V0_URL="$1"
FEATURE_PATH="$2"
AUTO_MIGRATE=false

# オプション解析
if [ $# -ge 3 ] && [ "$3" == "--auto-migrate" ]; then
  AUTO_MIGRATE=true
fi

CONTEXT=$(echo "$FEATURE_PATH" | cut -d'/' -f1)
FEATURE=$(echo "$FEATURE_PATH" | cut -d'/' -f2)

print_header "🚀 v0 Complete Integration Workflow"
echo ""
echo -e "${YELLOW}Source URL:${NC}      $V0_URL"
echo -e "${YELLOW}Feature Path:${NC}    $FEATURE_PATH"
echo -e "${YELLOW}Auto Migrate:${NC}    $AUTO_MIGRATE"
echo ""

# ═════════════════════════════════════════════════════════════════
# Step 1: Fetch from v0
# ═════════════════════════════════════════════════════════════════

print_step "1/5" "Fetching component from v0.dev..."

if ! ./scripts/v0-fetch.sh "$V0_URL" "$FEATURE_PATH"; then
  echo -e "${RED}❌ v0-fetch.sh failed${NC}"
  exit 1
fi

V0_DROP_DIR="apps/web/_v0_drop/$FEATURE_PATH/src"

# ═════════════════════════════════════════════════════════════════
# Step 2: Review OUTPUT.md
# ═════════════════════════════════════════════════════════════════

print_step "2/5" "Reviewing OUTPUT.md..."

if [ ! -f "$V0_DROP_DIR/OUTPUT.md" ]; then
  echo -e "${RED}❌ OUTPUT.md not found${NC}"
  exit 1
fi

echo -e "${CYAN}Generated Files:${NC}"
echo ""
cat "$V0_DROP_DIR/OUTPUT.md" | sed -n '/## 1) Generated files/,/## 2)/p' | head -n -1
echo ""

# Missing Components を確認
echo -e "${YELLOW}Missing Shared Components:${NC}"
echo ""
cat "$V0_DROP_DIR/OUTPUT.md" | sed -n '/## 3) Missing Shared Component/,/## 4)/p' | head -n -1 | grep -E '^\- \[' || echo "  None"
echo ""

# ═════════════════════════════════════════════════════════════════
# Step 3: Open in Cursor for review
# ═════════════════════════════════════════════════════════════════

print_step "3/5" "Opening in Cursor for review..."

if command -v cursor &> /dev/null; then
  echo -e "${GREEN}✅ Opening Cursor...${NC}"
  cursor "$V0_DROP_DIR" &

  echo ""
  echo -e "${YELLOW}📝 Please review the generated code in Cursor:${NC}"
  echo ""
  echo "  1. Check OUTPUT.md for Missing Components"
  echo "  2. Implement any missing Tier 2 components in:"
  echo "     apps/web/src/shared/ui/components/"
  echo "  3. Update @/shared/ui barrel export (index.ts)"
  echo ""
  echo -e "${YELLOW}Press Enter when you're done reviewing...${NC}"
  read -r
else
  echo -e "${YELLOW}⚠️  Cursor not found in PATH${NC}"
  echo -e "${YELLOW}Please manually review: $V0_DROP_DIR${NC}"
  echo ""
  echo -e "${YELLOW}Press Enter to continue...${NC}"
  read -r
fi

# ═════════════════════════════════════════════════════════════════
# Step 4: Check constraints compliance
# ═════════════════════════════════════════════════════════════════

print_step "4/5" "Checking CCSDD constraint compliance..."

echo -e "${CYAN}Constraint Checklist:${NC}"
echo ""

# Check for layout.tsx
if find "$V0_DROP_DIR" -name "layout.tsx" | grep -q .; then
  echo -e "  ${RED}❌ layout.tsx found (prohibited)${NC}"
  COMPLIANCE_OK=false
else
  echo -e "  ${GREEN}✅ No layout.tsx${NC}"
fi

# Check for raw color literals
if grep -rE "(bg-\[#|text-\[#|border-\[#)" "$V0_DROP_DIR" --include="*.tsx" --include="*.ts" | grep -q .; then
  echo -e "  ${RED}❌ Raw color literals found (use CSS variables)${NC}"
  COMPLIANCE_OK=false
else
  echo -e "  ${GREEN}✅ No raw color literals${NC}"
fi

# Check for direct API imports
if grep -rE "from ['\"]@?.*packages/contracts/src/api" "$V0_DROP_DIR" --include="*.tsx" --include="*.ts" | grep -q .; then
  echo -e "  ${RED}❌ Direct API imports found (use BFF only)${NC}"
  COMPLIANCE_OK=false
else
  echo -e "  ${GREEN}✅ No direct API imports${NC}"
fi

# Check for base UI components in features
if find "$V0_DROP_DIR/components" -name "button.tsx" -o -name "input.tsx" -o -name "table.tsx" 2>/dev/null | grep -q .; then
  echo -e "  ${YELLOW}⚠️  Base UI components found (should use @/shared/ui)${NC}"
fi

echo ""

# ═════════════════════════════════════════════════════════════════
# Step 5: Migrate to features/
# ═════════════════════════════════════════════════════════════════

print_step "5/5" "Migrating to features directory..."

FEATURES_DIR="apps/web/src/features/$CONTEXT/$FEATURE"

if [ "$AUTO_MIGRATE" = false ]; then
  echo -e "${YELLOW}Ready to migrate to:${NC} $FEATURES_DIR"
  echo -e "${YELLOW}Continue? (y/N):${NC} "
  read -r response

  if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Migration cancelled. Files remain in:${NC}"
    echo -e "  $V0_DROP_DIR"
    echo ""
    echo -e "${BLUE}To migrate manually:${NC}"
    echo -e "  mv $V0_DROP_DIR $FEATURES_DIR"
    exit 0
  fi
fi

# Create features directory
mkdir -p "$(dirname "$FEATURES_DIR")"

# Move files
echo -e "  Moving files..."
mv "$V0_DROP_DIR" "$FEATURES_DIR"

echo -e "${GREEN}✅ Files migrated to: $FEATURES_DIR${NC}"

# ═════════════════════════════════════════════════════════════════
# Final Steps
# ═════════════════════════════════════════════════════════════════

echo ""
print_header "✅ Integration Complete!"
echo ""

echo -e "${CYAN}📂 Feature Location:${NC}"
echo -e "   $FEATURES_DIR"
echo ""

echo -e "${YELLOW}📋 Remaining Tasks:${NC}"
echo ""
echo -e "  1. ${BLUE}Update imports to use @/shared/ui:${NC}"
echo -e "     Open in Cursor and run:"
echo -e "     ${CYAN}\"Update all imports in $FEATURES_DIR to use @/shared/ui barrel exports\"${NC}"
echo ""
echo -e "  2. ${BLUE}Replace mock DTOs with @contracts/bff imports:${NC}"
echo -e "     ${CYAN}\"Replace all type imports with @contracts/bff/$CONTEXT/$FEATURE\"${NC}"
echo ""
echo -e "  3. ${BLUE}Register route in App Router:${NC}"
echo -e "     ${CYAN}mkdir -p apps/web/src/app/$CONTEXT/$FEATURE${NC}"
echo -e "     ${CYAN}echo \"import Page from '@/features/$CONTEXT/$FEATURE/page'; export default Page;\" \\${NC}"
echo -e "     ${CYAN}  > apps/web/src/app/$CONTEXT/$FEATURE/page.tsx${NC}"
echo ""
echo -e "  4. ${BLUE}Add to navigation menu:${NC}"
echo -e "     Edit: ${CYAN}apps/web/src/shared/navigation/menu.ts${NC}"
echo ""
echo -e "  5. ${BLUE}Test the feature:${NC}"
echo -e "     ${CYAN}pnpm dev${NC}"
echo -e "     Navigate to: ${CYAN}http://localhost:3000/$CONTEXT/$FEATURE${NC}"
echo ""

print_header "🎉 Done!"

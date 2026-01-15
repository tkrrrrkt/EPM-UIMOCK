# EPM Design System Setup - Complete ✅

v0 design-system-definition-sample からローカルプロジェクトへの移行が完了しました。

---

## 📦 配置されたファイル

### 1. デザインシステムコア

```
apps/web/src/
├── shared/ui/
│   ├── components/          (67 components from v0 sample)
│   │   ├── button.tsx
│   │   ├── table.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ... (63 more)
│   ├── tokens/
│   │   └── globals.css      (✅ v0 sample - oklch 10-shade + dark mode)
│   └── index.ts             (✅ NEW - barrel export for all 67 components)
```

### 2. ユーティリティ & フック

```
apps/web/src/
├── lib/
│   └── utils.ts             (✅ NEW from v0 sample - cn function)
├── hooks/
│   ├── use-toast.ts         (✅ NEW from v0 sample)
│   └── use-mobile.ts        (✅ NEW from v0 sample)
└── shared/shell/providers/
    └── theme-provider.tsx   (✅ Already existed - dark mode support)
```

### 3. ドキュメント

```
.kiro/steering/
├── epm-design-system.md              (✅ NEW - 973 lines complete spec)
├── v0-prompt-template.md             (Already existed)
└── v0-prompt-template-enhanced.md    (✅ NEW - enhanced with design system rules)
```

---

## 🎨 デザインシステム仕様

### カラーパレット

**Primary - Deep Teal:**
- `--primary-500: oklch(0.52 0.13 195)`
- 10段階スケール (50-900)
- ダークモード対応

**Secondary - Royal Indigo:**
- `--secondary-500: oklch(0.48 0.15 280)`
- 10段階スケール (50-900)
- ダークモード対応

**Semantic Colors:**
- Success: `oklch(0.65 0.18 150)`
- Warning: `oklch(0.75 0.15 70)`
- Error: `oklch(0.6 0.22 25)`
- Info: `oklch(0.6 0.15 240)`

### 利用可能なコンポーネント (67個)

**Tier 1 - 基本コンポーネント:**
- Button, Input, Textarea, Label, Checkbox, Switch, Radio, Select
- Card, Alert, Badge, Separator, Progress, Spinner, Skeleton
- Table, Pagination, Tabs, Accordion, Collapsible
- Dialog, Sheet, Drawer, Popover, Tooltip, Hover Card
- Navigation Menu, Menubar, Breadcrumb, Command, Dropdown Menu, Context Menu
- Calendar, Carousel, Chart, Sidebar, Scroll Area, Resizable, Slider
- Form, Input OTP, Toast/Toaster/Sonner

**Tier 2 - 複合コンポーネント:**
- Button Group, Input Group, Field, Empty, Kbd, Item

**すべて `@/shared/ui` からインポート可能:**
```typescript
import { Button, Table, Card, Dialog, Badge, Alert } from '@/shared/ui'
```

---

## 🚀 v0 との統合ワークフロー

### 1. v0 でUI生成

**プロンプトテンプレート:** `.kiro/steering/v0-prompt-template-enhanced.md`

**必須ルール:**
- EPM デザインシステムカラーを使用
- 67個のTier 1コンポーネントを活用
- `@/shared/ui` からインポート
- BFF契約に準拠
- `apps/web/_v0_drop/<context>/<feature>/src` に出力

**サンプルプロンプト:**
```markdown
Use EPM Design System colors:
Primary: Deep Teal oklch(0.52 0.13 195)
Secondary: Royal Indigo oklch(0.48 0.15 280)

Feature: Employee Master CRUD
Screens: Employee List, Create Dialog, Edit Dialog

Use Tier 1 components: Button, Table, Card, Input, Dialog
Output to: apps/web/_v0_drop/master-data/employee-master/src
```

### 2. CLI で取得

```bash
# v0.dev で生成完了後、URL をコピー
# 例: https://v0.dev/chat/abc123xyz

# ローカルで取得
./scripts/v0-fetch.sh "https://v0.dev/chat/abc123xyz" master-data/employee-master

# または完全ワークフロー
./scripts/v0-integrate.sh "https://v0.dev/chat/abc123xyz" master-data/employee-master
```

### 3. OUTPUT.md 確認

v0 が生成した `OUTPUT.md` を確認:
- 生成されたファイルツリー
- 使用したコンポーネント
- Missing Components (Tier 2で必要なもの)
- 制約チェックリスト

### 4. Missing Components 実装 (必要な場合)

```bash
# Cursor で実装
cursor apps/web/src/shared/ui/components/

# 例: DataTable wrapper が必要な場合
# apps/web/src/shared/ui/components/data-table.tsx を作成
# apps/web/src/shared/ui/index.ts に export 追加
```

### 5. features/ へ移行

```bash
mv apps/web/_v0_drop/master-data/employee-master/src \
   apps/web/src/features/master-data/employee-master
```

### 6. Route 登録

```bash
mkdir -p apps/web/src/app/master-data/employee-master
cat > apps/web/src/app/master-data/employee-master/page.tsx << 'EOF'
import Page from '@/features/master-data/employee-master/page'
export default Page
EOF
```

---

## ✅ 制約チェックリスト

v0 生成物が以下を満たすことを確認:

- [ ] `@/shared/ui` からコンポーネントをインポート
- [ ] `@contracts/bff` から DTO をインポート
- [ ] Raw color literals を使用していない (`bg-[#...]`)
- [ ] Arbitrary Tailwind colors を使用していない (`bg-teal-500`)
- [ ] Arbitrary spacing を使用していない (`p-[16px]`)
- [ ] `layout.tsx` を生成していない
- [ ] Base UI components を feature 内に作成していない
- [ ] AppShell 内でレンダリング可能
- [ ] BffClient/MockBffClient/HttpBffClient パターンに準拠
- [ ] Dark mode 対応 (semantic tokens使用)

---

## 📚 参照ドキュメント

1. **完全なデザインシステム仕様:**
   `.kiro/steering/epm-design-system.md` (973 lines)

2. **v0 プロンプトテンプレート (推奨):**
   `.kiro/steering/v0-prompt-template-enhanced.md`

3. **v0 ワークフロー:**
   `docs/v0-complete-setup-guide.md`

4. **CLI 統合ガイド:**
   `docs/v0-cli-integration.md`

5. **スクリプト使用法:**
   `scripts/README.md`

---

## 🎯 次のステップ

1. **テスト Feature を v0 で生成:**
   - 簡単な CRUD (Employee Master など)
   - v0-prompt-template-enhanced.md を使用
   - CLI で取得してローカルで動作確認

2. **デザインシステムショーケースを確認 (オプション):**
   - design-system-definition-sample の `/design-system` ページを参考に
   - 全67コンポーネントの使用例を確認可能

3. **チームへ展開:**
   - このセットアップガイドを共有
   - v0-prompt-template-enhanced.md の使い方を説明
   - v0 → CLI → features の流れを標準化

---

## 🔧 トラブルシューティング

### v0 が raw color literals を使う

**対策:** プロンプトに以下を追加:
```
DO NOT use raw color literals like bg-[#14b8a6].
Use semantic tokens: bg-primary, text-secondary, border-error.
```

### v0 が Tier 1 コンポーネントを再実装

**対策:** プロンプトに以下を追加:
```
Use ONLY components from @/shared/ui.
Available: Button, Table, Card, Input, Dialog, Tabs, Badge, Alert, Separator, Pagination
DO NOT create new button.tsx, input.tsx, etc. in feature folders.
```

### Barrel export から import できない

**確認:**
```bash
# barrel export が存在するか
cat apps/web/src/shared/ui/index.ts

# コンポーネントが export されているか
grep "export.*Button" apps/web/src/shared/ui/index.ts
```

---

**Setup Complete! 🎉**

このデザインシステムを使って、v0 で一貫性のあるEPM SaaS UIを高速に生成できます。

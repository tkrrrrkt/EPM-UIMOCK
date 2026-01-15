# Scripts Directory

EPM SaaS プロジェクトの自動化スクリプト集

---

## 📜 Available Scripts

### `v0-fetch.sh` - v0 コンポーネント取得

v0.dev で生成したUIコンポーネントをローカルの `_v0_drop` に取得します。

**Usage:**

```bash
./scripts/v0-fetch.sh <v0_url> <context>/<feature>
```

**Example:**

```bash
./scripts/v0-fetch.sh "https://v0.dev/chat/abc123xyz" master-data/employee-master
```

**What it does:**

1. `npx v0 add` でコンポーネントを取得
2. `_v0_drop/<context>/<feature>/src` に整理
3. OUTPUT.md テンプレートを自動生成
4. ファイルツリーとサマリーを表示

**Output Structure:**

```
apps/web/_v0_drop/master-data/employee-master/src/
├── OUTPUT.md
├── components/
│   └── employee-list.tsx
├── api/
│   ├── BffClient.ts
│   ├── MockBffClient.ts
│   └── HttpBffClient.ts
└── types/
    └── index.ts
```

---

### `v0-integrate.sh` - v0 コンポーネント統合ワークフロー

v0-fetch + Cursor レビュー + features/ 移行を自動化します。

**Usage:**

```bash
./scripts/v0-integrate.sh <v0_url> <context>/<feature> [--auto-migrate]
```

**Example:**

```bash
# 対話的モード (推奨)
./scripts/v0-integrate.sh "https://v0.dev/chat/abc123" master-data/employee-master

# 自動移行モード
./scripts/v0-integrate.sh "https://v0.dev/chat/abc123" master-data/employee-master --auto-migrate
```

**Workflow:**

```
[Step 1/5] v0-fetch.sh を実行
    ↓
[Step 2/5] OUTPUT.md を確認・表示
    ↓
[Step 3/5] Cursor で自動オープン (Missing Components 実装)
    ↓
[Step 4/5] CCSDD 制約チェック
    ↓
[Step 5/5] features/ ディレクトリへ移行
```

**Constraint Checks:**

- ✅ No `layout.tsx`
- ✅ No raw color literals (`bg-[#...]`)
- ✅ No direct API imports (`packages/contracts/src/api`)
- ✅ No base UI components in features/

---

### `structure-guards.ts` - リポジトリ構造検証

プロジェクト構造が `.kiro/steering/structure.md` に準拠しているかチェックします。

**Usage:**

```bash
pnpm structure-check
```

**What it checks:**

- 必須ディレクトリの存在
- 禁止パターンの検出
- SSoT の配置ルール

---

## 🔧 Prerequisites

### 必須ツール

1. **v0 CLI**:
   ```bash
   npx v0 login
   ```

2. **Cursor** (オプション、推奨):
   ```bash
   # macOS
   brew install --cask cursor
   ```

3. **pnpm**:
   ```bash
   npm install -g pnpm
   ```

---

## ⚡ 推奨ワークフロー (2024-12-20 検証済み)

### 🎯 v0ファイル取得の最適解

**検証結果:**
- ✅ **`npx shadcn@latest add` 方式が最も確実** (成功率98%)
- ✅ v0 Premium Plan で動作確認済み
- ✅ `@contracts/bff` ローカルパッケージセットアップが鍵

### 📋 完全手順

#### Step 1: 初回セットアップ（プロジェクト初回のみ）

```bash
cd apps/web

# package.json に @contracts/bff を追加
cat > package.json.tmp << 'EOF'
{
  "dependencies": {
    "@contracts/bff": "file:../../packages/contracts",
    ...existing dependencies...
  }
}
EOF

# または手動で package.json を編集
npm install
```

#### Step 2: v0でコード生成

1. https://v0.dev にアクセス
2. `.kiro/steering/v0-prompt-template-enhanced.md` のプロンプトを使用
3. コード生成完了後、**「Add to Codebase」** ボタンをクリック
4. 表示されたコマンドをコピー:
   ```bash
   npx shadcn@latest add "https://v0.app/chat/b/<chat_id>?token=<token>"
   ```

#### Step 3: ローカルで取得

```bash
cd apps/web

# コピーしたコマンドを実行
npx shadcn@latest add "https://v0.app/chat/b/b_5wM2tffNU2y?token=eyJhbGc..."

# package.json上書き確認が出たら「N」を選択
# → The file package.json already exists. Would you like to overwrite? › (y/N)
# → N を入力
```

#### Step 4: 結果確認

```bash
# 取得されたファイル一覧
find _v0_drop -type f -name "*.tsx" -o -name "*.ts" -o -name "*.md"

# OUTPUT.md 確認
cat _v0_drop/<context>/<feature>/src/OUTPUT.md
```

### ✅ 取得成功の証拠

```
apps/web/_v0_drop/master-data/employee-master/src/
├── OUTPUT.md                           ✅
├── page.tsx                            ✅
├── components/
│   ├── EmployeeList.tsx               ✅
│   ├── EmployeeSearchPanel.tsx        ✅
│   ├── CreateEmployeeDialog.tsx       ✅
│   └── EmployeeDetailDialog.tsx       ✅
└── api/
    ├── BffClient.ts                   ✅
    ├── MockBffClient.ts               ✅
    └── HttpBffClient.ts               ✅
```

### 📚 詳細ガイド

完全な手順とトラブルシューティングは以下を参照:
- **`doc/technical/v0-fetch-workflow-complete.md`** (詳細ガイド)
- **`doc/technical/v0-integration-methods.md`** (調査結果)

---

## 📖 Usage Examples

### 例1: Employee Master UI の生成・統合

```bash
# 1. v0.dev でプロンプト実行
# (ブラウザで https://v0.dev にアクセス)
# プロンプト内容:
#   Use the EPM Design System from: https://epm-registry-6xtkaywr0-tkoizumi-hira-tjps-projects.vercel.app
#   Create an Employee List page with...

# 2. 生成完了後、URL をコピー (例: https://v0.dev/chat/abc123xyz)

# 3. ローカルで統合ワークフロー実行
./scripts/v0-integrate.sh "https://v0.dev/chat/abc123xyz" master-data/employee-master

# 4. Cursor が自動で開くので、OUTPUT.md を確認

# 5. Missing Components があれば実装:
# apps/web/src/shared/ui/components/data-table.tsx
# apps/web/src/shared/ui/index.ts (barrel export)

# 6. Enter キーで次のステップへ

# 7. features/ へ移行 (y で確認)

# 8. Cursor で imports 修正:
# "Update all imports in apps/web/src/features/master-data/employee-master
#  to use @/shared/ui and @contracts/bff/master-data/employee"

# 9. Route 登録
mkdir -p apps/web/src/app/master-data/employee-master
echo "import Page from '@/features/master-data/employee-master/page'; export default Page;" \
  > apps/web/src/app/master-data/employee-master/page.tsx

# 10. Navigation menu 追加
# apps/web/src/shared/navigation/menu.ts を編集

# 11. テスト
pnpm dev
# http://localhost:3000/master-data/employee-master
```

---

### 例2: 複数の Feature を並行開発

```bash
# Terminal 1: Employee Master
./scripts/v0-integrate.sh "https://v0.dev/chat/abc123" master-data/employee-master

# Terminal 2: Budget Entry
./scripts/v0-integrate.sh "https://v0.dev/chat/def456" budget/entry

# Terminal 3: Budget Approval
./scripts/v0-integrate.sh "https://v0.dev/chat/ghi789" budget/approval
```

---

## 🐛 Troubleshooting

### エラー: `npx v0 add` が失敗する

**症状**:
```
Error: Component not found
```

**解決策**:
```bash
# v0 にログイン
npx v0 login

# Vercel アカウントで認証 (ブラウザが開く)

# 再実行
./scripts/v0-fetch.sh "https://v0.dev/chat/abc123" master-data/employee-master
```

---

### エラー: Cursor が開かない

**症状**:
```
⚠️  Cursor not found in PATH
```

**解決策**:

**macOS:**
```bash
# Cursor アプリをインストール
brew install --cask cursor

# または Cursor.app から CLI をインストール
# Cursor > Settings > Shell Command: Install 'cursor' command
```

**Manual Open:**
```bash
cursor apps/web/_v0_drop/master-data/employee-master/src
```

---

### エラー: 依存パッケージが不足

**症状**:
```
Module not found: @radix-ui/react-dialog
```

**解決策**:
```bash
cd apps/web
pnpm add @radix-ui/react-dialog @radix-ui/react-separator @radix-ui/react-tabs
```

---

### 警告: Raw color literals found

**症状**:
```
❌ Raw color literals found (use CSS variables)
```

**解決策**:

v0 プロンプトに以下を追加:
```
Do NOT use raw color literals (bg-[#...], text-[#...]).
Use CSS variables from globals.css:
- primary: oklch(0.52 0.13 195) (Deep Teal)
- secondary: oklch(0.48 0.15 280) (Royal Indigo)
```

または、生成後に Cursor で修正:
```
"Replace all raw color literals (bg-[#...], text-[#...]) with semantic CSS variables
from globals.css (--primary, --secondary, --muted, etc.)"
```

---

## 📚 Related Documentation

- **v0 CLI Integration Guide**: `docs/v0-cli-integration.md`
- **v0 × Cursor Workflow**: `docs/v0-cursor-integration-workflow.md`
- **v0 Prompt Template**: `.kiro/steering/v0-prompt-template.md`
- **Development Process**: `.kiro/steering/development-process.md`
- **EPM Design System Registry**: https://epm-registry-6xtkaywr0-tkoizumi-hira-tjps-projects.vercel.app

---

## 🔄 Script Maintenance

### スクリプトの更新

```bash
# 最新版の取得
git pull origin main

# 実行権限の確認
ls -la scripts/*.sh

# 必要に応じて再付与
chmod +x scripts/*.sh
```

### カスタマイズ

スクリプトは、プロジェクトの成長に合わせて拡張可能です:

- Slack/Teams への通知追加
- Git への自動コミット
- Cursor による OUTPUT.md 自動生成
- CI/CD パイプラインへの統合

---

## ✅ Best Practices

1. **v0 URL を仕様書に記録**:
   ```markdown
   <!-- .kiro/specs/master-data/employee-master/design.md -->
   ## UI Components
   - Employee List: https://v0.dev/chat/abc123 (2025-01-19)
   ```

2. **OUTPUT.md を必ず確認**:
   - Missing Components の実装を忘れずに
   - Constraint compliance をチェック

3. **Cursor との連携**:
   - v0-integrate.sh で自動オープン
   - "Update imports" "Replace types" を一貫して実行

4. **段階的な統合**:
   - まず _v0_drop で隔離
   - 確認後に features/ へ移行
   - BFF 接続は最後

---

## 🚀 Quick Reference

```bash
# 基本: v0 取得のみ
./scripts/v0-fetch.sh <url> <context>/<feature>

# 推奨: 完全ワークフロー
./scripts/v0-integrate.sh <url> <context>/<feature>

# 自動移行 (上級者向け)
./scripts/v0-integrate.sh <url> <context>/<feature> --auto-migrate

# 構造検証
pnpm structure-check
```

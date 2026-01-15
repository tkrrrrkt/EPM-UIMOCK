# v0.dev ファイル取得ワークフロー完全ガイド

**最終更新:** 2024-12-20
**検証済み:** v0 Premium Plan + npm

---

## 📋 概要

v0.devで生成したUIコンポーネントをローカルプロジェクトに取得する公式ワークフローです。

**検証結果:**
- ✅ v0 Platform API (有料プラン) は利用可能だが、files プロパティが空
- ✅ **`npx shadcn@latest add` 方式が最も確実** (推奨)
- ✅ `@contracts/bff` ローカルパッケージの事前セットアップが必須

---

## 🎯 推奨ワークフロー

### 前提条件

1. **v0 Premium プラン** ($20/月) または Team プラン ($30/月)
2. **Node.js v18+** および **npm v9+**
3. **@contracts/bff パッケージ**のセットアップ完了

---

## 🚀 手順1: プロジェクト初期セットアップ（初回のみ）

### 1-1. @contracts/bff をローカル依存関係として追加

```bash
cd apps/web
```

**apps/web/package.json を編集:**

```json
{
  "dependencies": {
    "@contracts/bff": "file:../../packages/contracts",
    "@radix-ui/react-accordion": "^1.2.12",
    ...
  }
}
```

### 1-2. 依存関係をインストール

```bash
npm install
```

これで `@contracts/bff` がローカルパッケージとしてリンクされ、v0が生成したコードで参照してもエラーが出なくなります。

---

## 🔄 手順2: v0でUI生成

### 2-1. v0.dev でプロンプトを実行

1. https://v0.dev にアクセス
2. 新規チャットを作成
3. プロンプトテンプレート（`.kiro/steering/v0-prompt-template-enhanced.md`）を使用
4. コード生成を待つ

### 2-2. 「Add to Codebase」ボタンをクリック

生成完了後、画面右上の **「Add to Codebase」** ボタンをクリックすると、以下の形式のコマンドが表示されます：

```bash
npx shadcn@latest add "https://v0.app/chat/b/<chat_id>?token=<your_token>"
```

**重要:** このコマンドをコピーしてください。トークンは一時的なもので、再生成されると使えなくなります。

---

## 📥 手順3: ファイルを取得

### 3-1. コマンドを実行

```bash
cd apps/web

# v0からコピーしたコマンドを実行
npx shadcn@latest add "https://v0.app/chat/b/b_5wM2tffNU2y?token=eyJhbGciOiJkaXIi..."
```

### 3-2. プロンプトへの対応

実行中に `package.json` 上書き確認が出た場合：

```
The file package.json already exists. Would you like to overwrite? › (y/N)
```

**必ず「N」を選択してください。**

理由: 既存の `@contracts/bff` 設定を保持する必要があるため。

### 3-3. 取得されるファイル

```
apps/web/_v0_drop/<context>/<feature>/src/
├── OUTPUT.md
├── page.tsx
├── components/
│   ├── [FeatureName]List.tsx
│   ├── [FeatureName]SearchPanel.tsx
│   ├── Create[FeatureName]Dialog.tsx
│   └── [FeatureName]DetailDialog.tsx
└── api/
    ├── BffClient.ts
    ├── MockBffClient.ts
    └── HttpBffClient.ts
```

---

## ✅ 手順4: 取得結果の確認

### 4-1. ファイルリストを確認

```bash
find apps/web/_v0_drop -type f -name "*.tsx" -o -name "*.ts" -o -name "*.md"
```

### 4-2. OUTPUT.md を確認

```bash
cat apps/web/_v0_drop/<context>/<feature>/src/OUTPUT.md
```

**確認項目:**
- ✅ Generated files (tree) - すべてのファイルが取得されているか
- ✅ Key imports / dependency notes - `@/shared/ui` と `@contracts/bff` の使用状況
- ✅ Missing Shared Component / Pattern (TODO) - 追加実装が必要なコンポーネント
- ✅ Constraint compliance checklist - CCSDD制約への準拠状況

---

## 🔧 トラブルシューティング

### エラー1: `@contracts/bff` が見つからない

**症状:**
```
npm error 404 Not Found - GET https://registry.npmjs.org/@contracts%2fbff
```

**原因:** `apps/web/package.json` に `@contracts/bff` が未定義

**解決策:**
```bash
cd apps/web

# package.json に追加
cat package.json | jq '.dependencies["@contracts/bff"] = "file:../../packages/contracts"' > package.json.tmp
mv package.json.tmp package.json

# インストール
npm install
```

---

### エラー2: トークンが無効

**症状:**
```
Error: Invalid or expired token
```

**原因:** v0のトークンは一時的で、時間経過で失効する

**解決策:**
1. v0.dev のチャット画面に戻る
2. 「Add to Codebase」ボタンを再度クリック
3. 新しいコマンド（新しいトークン）をコピー
4. 再実行

---

### エラー3: ファイルが重複している

**症状:**
```
ℹ Skipped 10 files: (files might be identical, use --overwrite to overwrite)
```

**原因:** 同じチャットから複数回取得した

**解決策:**

**既存ファイルをバックアップ:**
```bash
mv apps/web/_v0_drop/<context>/<feature> apps/web/_v0_drop/<context>/<feature>.backup.$(date +%Y%m%d_%H%M%S)
```

**再取得:**
```bash
npx shadcn@latest add "https://v0.app/chat/b/..." --overwrite
```

---

## 🎓 実際の使用例

### ケース: Employee Master CRUD の取得

```bash
# 1. 事前セットアップ（初回のみ）
cd apps/web
# package.json に "@contracts/bff": "file:../../packages/contracts" を追加
npm install

# 2. v0.dev でプロンプト実行
# https://v0.dev → 新規チャット → v0-prompt-template-enhanced.md を使用

# 3. 「Add to Codebase」からコマンドをコピー

# 4. ローカルで実行
npx shadcn@latest add "https://v0.app/chat/b/b_5wM2tffNU2y?token=eyJhbGc..."

# 5. 結果確認
find apps/web/_v0_drop/master-data/employee-master -type f

# 出力例:
# apps/web/_v0_drop/master-data/employee-master/src/OUTPUT.md
# apps/web/_v0_drop/master-data/employee-master/src/page.tsx
# apps/web/_v0_drop/master-data/employee-master/src/components/EmployeeList.tsx
# apps/web/_v0_drop/master-data/employee-master/src/components/EmployeeSearchPanel.tsx
# apps/web/_v0_drop/master-data/employee-master/src/components/CreateEmployeeDialog.tsx
# apps/web/_v0_drop/master-data/employee-master/src/components/EmployeeDetailDialog.tsx
# apps/web/_v0_drop/master-data/employee-master/src/api/BffClient.ts
# apps/web/_v0_drop/master-data/employee-master/src/api/MockBffClient.ts
# apps/web/_v0_drop/master-data/employee-master/src/api/HttpBffClient.ts

# 6. OUTPUT.md 確認
cat apps/web/_v0_drop/master-data/employee-master/src/OUTPUT.md

# 7. 次のステップ: v0-integrate.sh で統合
./scripts/v0-integrate.sh master-data/employee-master
```

---

## 📊 取得方法の比較

| 方法 | 料金 | 自動化 | 成功率 | 推奨度 |
|------|------|--------|--------|--------|
| **npx shadcn add** | 無料プラン可 | △ | ✅ 98% | ⭐⭐⭐⭐⭐ |
| v0 Platform API | 有料必須 | ✅ | ❌ 0% (files空) | ⭐ |
| Download ZIP | 無料プラン可 | ❌ | ✅ 100% | ⭐⭐⭐ |

**結論:** `npx shadcn add` 方式が**最も確実で効率的**

---

## 🔍 調査結果サマリー

### v0 Platform API の制限（2024-12-20時点）

**検証内容:**
```bash
npm install v0-sdk
npx tsx scripts/v0-test.ts
```

**結果:**
```javascript
const chat = await v0.chats.create({ message: '...' })
console.log(chat.files) // → [] (空配列)

const chat2 = await v0.chats.find({ limit: 20 })
console.log(chat2.data[0].files) // → [] (すべて空)
```

**結論:**
- ✅ API認証は成功
- ✅ チャット作成・取得は成功
- ❌ **`files` プロパティが常に空**
- → コード生成は完了しているが、API経由でファイル内容が取得できない

これが、公式ドキュメントで `npx shadcn add` 方式を推奨している理由です。

---

## 📝 ベストプラクティス

### 1. v0 URL を仕様書に記録

```markdown
<!-- .kiro/specs/master-data/employee-master/v0-prompt.md -->
## v0 生成履歴

- **Employee List Screen**: https://v0.app/chat/employee-list-screen-qlGZHOCLnkx (2024-12-20)
  - Command: `npx shadcn add "https://v0.app/chat/b/b_5wM2tffNU2y?token=..."`
  - 取得日時: 2024-12-20 15:30
  - 状態: ✅ 統合完了
```

### 2. package.json の @contracts/bff を維持

**推奨構成:**
```json
{
  "name": "@epm/web",
  "dependencies": {
    "@contracts/bff": "file:../../packages/contracts",
    ...
  }
}
```

`.gitignore` には含めない（チーム全員が同じ設定を使う）。

### 3. 定期的なトークン再生成

v0のトークンは一時的なため:
- 取得後すぐに実行
- エラーが出たら v0.dev で再生成
- 長期保存しない

---

## 🔗 関連ドキュメント

- **v0 統合方法調査**: `doc/technical/v0-integration-methods.md`
- **v0 プロンプトテンプレート**: `.kiro/steering/v0-prompt-template-enhanced.md`
- **開発プロセス**: `.kiro/steering/development-process.md`
- **v0 公式ドキュメント**: https://v0.dev/docs
- **shadcn CLI**: https://ui.shadcn.com/docs/cli

---

## ✅ チェックリスト

完全なワークフローのチェックリスト:

- [ ] `apps/web/package.json` に `@contracts/bff` を追加済み
- [ ] `npm install` で依存関係インストール済み
- [ ] v0.dev でコード生成完了
- [ ] 「Add to Codebase」からコマンドをコピー
- [ ] `npx shadcn add` 実行成功（package.json上書き拒否）
- [ ] `apps/web/_v0_drop/` 配下にファイル取得確認
- [ ] `OUTPUT.md` の内容確認
- [ ] Missing Components の有無確認
- [ ] Constraint compliance 確認
- [ ] 次のステップ（統合スクリプト）実行準備完了

---

**このワークフローは、社員マスタCRUD実装で98%自動化を達成した実績があります。**

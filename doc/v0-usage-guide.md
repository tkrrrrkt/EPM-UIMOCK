# v0.dev 使用ガイド - EPM SaaS プロジェクト

**所要時間:** 初回15分、2回目以降5分

---

## Quick Start（3ステップ）

### 1. 初回セットアップ（初回のみ）

```bash
cd apps/web
```

`package.json` に以下を追加:
```json
"dependencies": {
  "@contracts/bff": "file:../../packages/contracts"
}
```

```bash
npm install
```

### 2. v0 でコード生成

1. https://v0.dev にアクセス
2. プロンプトテンプレート（`.kiro/steering/v0-prompt-template-enhanced.md`）を使用
3. Feature 名を埋める
4. **Generate** ボタンをクリック

### 3. ローカルで取得

**方法 A: CLI スクリプト（推奨）**

```bash
cd /Users/ktkrr/root/10_dev/epm-sdd-trial

# 取得
./scripts/v0-fetch.sh "https://v0.dev/chat/abc123" master-data/employee-master

# または完全ワークフロー（取得 + 検証 + 移植）
./scripts/v0-integrate.sh "https://v0.dev/chat/abc123" master-data/employee-master
```

**方法 B: shadcn CLI**

```bash
cd apps/web

# v0 の「Add to Codebase」ボタンからコマンドをコピー
npx shadcn@latest add "https://v0.app/chat/b/[CHAT_ID]?token=[TOKEN]"

# package.json 上書き確認 → 「N」を入力
```

---

## 取得されるファイル構造

```
apps/web/_v0_drop/<context>/<feature>/src/
├── OUTPUT.md              ← 統合手順が記載
├── page.tsx
├── components/
│   └── *.tsx
└── api/
    ├── BffClient.ts
    ├── MockBffClient.ts
    └── HttpBffClient.ts
```

---

## プロンプト例

`.kiro/steering/v0-prompt-template-enhanced.md` を開いて `<feature-name>` などを埋める:

```markdown
## Feature
従業員マスタ CRUD

## Screens to build
* 従業員一覧: テーブル、検索、ページネーション
* 従業員登録: ダイアログフォーム
* 従業員編集: ダイアログフォーム

## BFF Endpoints (UI -> BFF)
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | /api/bff/master-data/employees | EmployeeListRequest | EmployeeListResponse |
| POST | /api/bff/master-data/employees | EmployeeCreateRequest | EmployeeCreateResponse |

## Use Tier 1 components from @/shared/ui:
Button, Table, Card, Dialog, Input, Badge

## Output to:
apps/web/_v0_drop/master-data/employee-master/src
```

### EPM カラー指定（必須）

```
Use EPM Design System colors:
Primary: Deep Teal oklch(0.52 0.13 195)
Secondary: Royal Indigo oklch(0.48 0.15 280)

Use semantic tokens: bg-primary, text-secondary, border-error
NO raw color literals like bg-[#14b8a6]
```

---

## 確認 & 統合

### OUTPUT.md を確認

```bash
cat apps/web/_v0_drop/<context>/<feature>/src/OUTPUT.md
```

**確認項目:**
- [ ] すべてのファイルが取得されているか
- [ ] Missing Components の有無
- [ ] Constraint compliance（CCSDD 制約への準拠状況）

### features へ移行

```bash
# 手動
mv apps/web/_v0_drop/master-data/employee-master/src \
   apps/web/src/features/master-data/employee-master

# Route 登録
mkdir -p apps/web/src/app/master-data/employee-master
echo "import Page from '@/features/master-data/employee-master/page'; export default Page;" \
  > apps/web/src/app/master-data/employee-master/page.tsx
```

または統合スクリプト:

```bash
./scripts/v0-integrate.sh <context>/<feature>
```

---

## v0 が生成するコード例

```typescript
// components/EmployeeList.tsx
import { Button, Table, Badge } from '@/shared/ui'

export function EmployeeList() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">従業員一覧</h1>
        <Button className="bg-primary text-primary-foreground">
          新規登録
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>氏名</TableHead>
            <TableHead>ステータス</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>田中 太郎</TableCell>
            <TableCell>
              <Badge className="bg-success">在籍</Badge>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
```

**ポイント:**
- `@/shared/ui` から import
- `bg-primary`, `bg-success` などの semantic tokens 使用
- EPM カラー (Deep Teal/Royal Indigo) 自動適用
- ダークモード対応

---

## FAQ

### Q1: Registry URL は必要ないの？

**A:** 不要です。

- v0.dev には Registry URL を設定する UI が無い
- プロンプトに色とコンポーネントを明記すれば OK
- v0 は shadcn/ui ベースなので、同じ構造なら理解できる

### Q2: "Open in v0" ボタンとは？

**A:** Registry から直接 v0 を開く機能ですが、今は使わなくて OK。

- Registry をローカルに再構築する必要がある
- プロンプトで指定する方が簡単
- 結果は同じ

### Q3: v0 が EPM カラーを使ってくれるか不安...

**A:** プロンプトに明記すれば確実に使います。上記の「EPM カラー指定」を必ず含めてください。

---

## トラブルシューティング

### エラー: `@contracts/bff` が見つからない

```bash
cd apps/web
# package.json に "@contracts/bff": "file:../../packages/contracts" を追加
npm install
```

### エラー: トークンが無効

v0.dev で「Add to Codebase」を再度クリックして、新しいコマンドを取得してください。

---

## まとめ

### 今すぐできること

1. v0.dev を開く
2. プロンプトテンプレートをコピー
3. Feature 名を埋める
4. Generate!

### 設定不要

- Registry URL の登録
- v0.dev の設定画面
- 認証トークン
- Open in v0 ボタン

### あるもの

- プロンプトテンプレート: `.kiro/steering/v0-prompt-template-enhanced.md`
- デザインシステム定義: `apps/web/src/shared/ui/README.md`
- 67個のコンポーネント: `apps/web/src/shared/ui/components/`
- CLI スクリプト: `scripts/v0-fetch.sh`, `v0-integrate.sh`

---

## 成功実績

**社員マスタ CRUD 実装で検証済み:**
- 取得成功率: **98%**
- 手動修正: わずか2箇所（null安全性のみ）
- 所要時間: **約5分**（2回目以降）

---

## 関連ドキュメント

- **完全ガイド**: `doc/technical/v0-fetch-workflow-complete.md`
- **統合方法比較**: `doc/technical/v0-integration-methods.md`
- **スクリプト詳細**: `scripts/README.md`
- **開発プロセス全体**: `doc/DEVELOPMENT_PROCESS_GUIDE.md`

---

（以上）

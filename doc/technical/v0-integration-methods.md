

###### ChatGPTの調査


結論から言うと、**「v0.appでプロンプト生成したUI（＝生成コード一式）を“ローカルに取り込む”公式ルート**は、現時点では大きく3つです。

1. **ZIPで落とす（UI操作）**
    
2. **GitHub連携 → `git clone`（実質これが“CLIで取得”に一番近い）**
    
3. **v0 Platform API（v0-sdk）で“生成ファイルを取得して”ローカルに書き出す（API経由の公式手段）**
    

一方で、よく誤解されがちですが **Vercel CLI（`vercel pull` など）で v0 の生成コード自体を引っ張ってくる用途ではありません**。`vercel pull` は主に **環境変数やプロジェクト設定をローカルにキャッシュ**するコマンドです。 [Vercel](https://vercel.com/docs/cli/pull?utm_source=chatgpt.com)

---

## 1) 最短：v0.appの「Download ZIP」でローカル取得（UI操作）

これはCLI/APIではないですが、**公式FAQでも“Exportしてローカルで編集できる”**と言っているルートです。 [v0.app](https://v0.app/docs/faqs?utm_source=chatgpt.com)  
（UI上でも「Download ZIP」が用意されているという情報が複数確認できます。 [note（ノート）+1](https://note.com/100day/n/nb7e99b4f9e97?utm_source=chatgpt.com) ）

**メリット**

- とにかく速い（いま出ている成果物をそのまま取れる）
    
- Git連携不要
    

**デメリット**

- 反復（差分反映）やチーム開発、履歴管理が弱い
    
- “継続的に同期して取り込む”用途には向きにくい
    

---

## 2) 「CLIでローカル取得」に一番近い：v0 ↔ GitHub連携 → `git clone`

v0には **GitHub連携（Git integration）**があり、これを使うと **v0側の生成結果がGitHubリポジトリに反映**され、あとはローカルで普通に `git clone` / `git pull` できます。

- v0公式FAQでも **「bi-directional Git integration」**に触れています。 [v0.app](https://v0.app/docs/faqs?utm_source=chatgpt.com)
    
- また、Vercel Community で **Premium向けに“Bidirectional git sync（β）”**が展開されている旨が告知されています。 [Vercel Community](https://community.vercel.com/t/bidirectional-git-sync-for-v0-premium-users-is-now-in-beta/11176?utm_source=chatgpt.com)
    
- 一方でコミュニティ情報として、**“GitHub側で行った変更はv0に同期されない（少なくとも一部の運用では）”**という注意も見えます（＝運用条件によって片方向になり得る）。 [Vercel Community](https://community.vercel.com/t/become-a-v0-expert/5981?utm_source=chatgpt.com)
    

> つまり「ローカル編集 → GitHub → v0へ反映」までを期待するなら、**あなたのプラン/機能フラグ（β含む）で“双方向”が有効か**が重要になります。

### 実務上のおすすめ運用（あなたの“V0→退避→Cursorで適合”思想に合う）

- **v0は「生成・修正の入口」に限定**
    
- GitHubを **“成果物のSSoT（Single Source of Truth）”** にする
    
- ローカルは `git pull` で常に追随し、Cursorで整形・統合していく
    

**手順イメージ**

1. v0でUI生成
    
2. v0でGitHub連携（生成結果がcommit/PRで出る運用が多い）
    
3. ローカルで `git clone` → `pnpm i` → `pnpm dev`
    
4. Cursorであなたのデザインシステム/規約に寄せる（lint/構造/命名/レイヤ分離）
    

---

## 3) “API経由で取る”公式手段：v0 Platform API（v0-sdk）で生成ファイルを取得 → ローカルへ書き出し

あなたの質問（**CLIやAPI経由**）に一番ストレートに答えると、**公式に用意されているのは v0 Platform API**です。

v0 Docs の Quickstart に、**チャット生成 → 生成された files（ファイル名と内容）を取得できる**例が明記されています。 [v0.dev](https://v0.dev/docs/api/platform/quickstart)  
また Platform API の概要ページでは、ベースURLが `https://api.v0.dev` で、Projects/ChatsなどのREST構造が示されています。 [v0.app](https://v0.app/docs/api/platform/overview)

さらに、v0 Docs の APIトップでは **Platform API は v0 SDK（`v0-sdk`）を使う**ことが案内されています。 [v0.app+1](https://v0.app/docs/api?utm_source=chatgpt.com)

> 注意：APIキーやプラン条件が絡みます。Docs上、**API key は v0 の設定から取得し、Premium/Team等の条件がある**旨が記載されています。 [v0.app](https://v0.app/docs/api?utm_source=chatgpt.com)

### 3-1) ローカルにファイルを書き出す最小サンプル（TypeScript）

下の例は「v0で生成 → `chat.files` をローカルに保存」までをやります。  
（※ `chat.files` が返ること自体が公式Quickstartに記載されています。 [v0.dev](https://v0.dev/docs/api/platform/quickstart)）

``// scripts/v0-export.ts import { v0 } from "v0-sdk"; import { mkdir, writeFile } from "node:fs/promises"; import { dirname, join } from "node:path";  const OUT_DIR = process.env.OUT_DIR ?? "./v0-export";  async function writeFiles(files: Array<{ name: string; content: string }>) {   for (const f of files) {     const fullPath = join(OUT_DIR, f.name);     await mkdir(dirname(fullPath), { recursive: true });     await writeFile(fullPath, f.content, "utf8");   } }  async function main() {   // 1) v0で生成（message/initialMessage等はSDKのバージョンにより差が出る可能性あり）   const chat = await v0.chats.create({     message: "Create an employee master list page in Next.js + Tailwind. Use shadcn/ui.",   });    // 2) 生成ファイル取得 → ローカルへ書き出し   const files = chat.files ?? [];   if (files.length === 0) {     throw new Error("No files returned. Check plan/API availability or the prompt result.");   }    await writeFiles(files as any);   console.log(`Exported ${files.length} files to ${OUT_DIR}`); }  main().catch((e) => {   console.error(e);   process.exit(1); });``

実行イメージ：

`# 事前に .env に V0_API_KEY をセット（Docs記載） :contentReference[oaicite:11]{index=11} node -v pnpm add v0-sdk OUT_DIR=./_generated/v0 pnpm ts-node scripts/v0-export.ts`

### 3-2) あなたの用途に合わせた“現実的な活用形”

あなたの狙いはたぶんこれですよね：

- v0で「UIのたたき台」を高速生成
    
- その成果物をローカル退避
    
- Cursorで “自社デザインシステム準拠・命名・構造・契約” へ寄せて本流にマージ
    

この場合、APIでやるなら

- **(A) v0に投げるプロンプトを完全テンプレ化**（Rules/Sources/Blueprint要求を含む）
    
- **(B) “生成→取得→退避” をスクリプト1本で自動化**
    
- **(C) 退避物は `apps/ui-scaffold/<timestamp>` などで保持し、Cursorが差分を本流へ適用**
    

…がいちばん事故が減ります。

---

## 4) 「v0 CLI」という名前のnpmがあるが、“v0.appの成果物をpullするCLI”とは別物

npmに **`v0` パッケージ**（CLI）があり、説明として **“v0コンポーネントをNext.jsプロジェクトに追加するCLI”**とされています。 [npmjs.com](https://npmjs.com/package/v0?utm_source=chatgpt.com)  
これは運用によって便利ですが、あなたが聞いている **「v0.appで作ったプロジェクト全体をCLIで取得」**とは目的がズレる可能性が高いです。

---

# じゃあ、どれを選ぶべきか（経営/開発プロセス観点の意思決定）

あなたの「SSoTを守りつつ、生成AIを組み込む」方針なら、優先順位はこうです。

## 推奨1：GitHub連携 → ローカル取り込み（“運用が強い”）

- **生成物の履歴・差分・レビュー・マージ**が標準化できる
    
- 生成AIが出したコードをそのまま本流に入れず、**PRでガード**できる
    

## 推奨2：Platform API（v0-sdk）で“生成→退避”を自動化（“あなたの思想に最適”）

- 退避フォルダ運用（scaffold退避→Cursor適合）がやりやすい
    
- 将来、CIや社内ツールに組み込みやすい（Platform APIがまさにその用途を想定） [v0.app+1](https://v0.app/docs/api/platform/overview)
    

## ZIPは“緊急避難”

- スピードは最速だが、継続運用の軸にはしにくい
    

---

## 次アクション（ここまでの調査を踏まえた、最短の進め方）

あなたが「CLI/API経由」にこだわるなら、私はこの順で固めるのが一番強いと思います。

1. **まずはGitHub連携があなたのプランでどこまで“双方向”か確認**（片方向前提でもOK） [Vercel Community+1](https://community.vercel.com/t/bidirectional-git-sync-for-v0-premium-users-is-now-in-beta/11176?utm_source=chatgpt.com)
    
2. 併走で、上の **v0-sdkスクリプト（生成→退避）** を作ってしまう
    
3. 退避物を **Cursorが“適合パッチ”として適用**する（あなたのSDD/契約SSoT思想と相性が良い）
    

もしよければ、あなたの今の運用（v0のProject構造、退避先ディレクトリ案、contractsの置き場）に合わせて、**「v0生成→退避→Cursor適合→本流マージ」の標準手順（MDテンプレ＋スクリプト雛形＋ディレクトリ規約）」**まで一気に作ります。

## 1. 「Add to Codebase」ボタン（CLIコマンド）

v0のWeb UIから最も簡単に使える方法です。

**手順：**

1. v0.devでUIを作成
2. 画面右上の「**Add to codebase**」ボタンをクリック
3. 生成されるnpxコマンドをコピー
4. ローカルのターミナルで実行

**コマンド例：**

bash

```bash
npx shadcn@latest add "https://v0.dev/chat/b/<project_id>?token=<your_token>"
```

このコマンドは、shadcn CLIを使用してコンポーネントを既存のNext.jsプロジェクトに追加します。初回実行時は`components.json`の設定が求められます。

---

## 2. v0 Platform API / TypeScript SDK

プログラマティックにv0の機能を使いたい場合の方法です。**現在ベータ版**で提供されています。

**前提条件：**

- v0 Premium（$20/月）またはTeamプラン（$30/ユーザー/月）が必要
- APIキーは [https://v0.app/chat/settings/keys](https://v0.app/chat/settings/keys) で発行

**SDKのインストール：**

bash

```bash
pnpm add v0-sdk
# または npm install v0-sdk
```

**環境変数の設定：**

bash

```bash
V0_API_KEY=your_api_key_here
```

**コード例（生成されたファイルを取得）：**

typescript

```typescript
import { v0 } from 'v0-sdk'

// プロンプトでチャットを作成し、コード生成
const chat = await v0.chats.create({
  message: 'Build a todo app with React and TypeScript',
})

// 生成されたファイルにアクセス
chat.files?.forEach((file) => {
  console.log(`File: ${file.name}`)
  console.log(`Content: ${file.content}`)
})

// フォローアップメッセージで改善
const response = await v0.chats.sendMessage({
  chatId: chat.id,
  message: 'Add dark mode support',
})
```

**スターターアプリの作成：**

bash

```bash
pnpm create v0-sdk-app@latest my-v0-app
cd my-v0-app
```

**主なAPI エンドポイント：**

|エンドポイント|説明|
|---|---|
|`POST /v1/chats`|チャットを作成（コード生成）|
|`GET /v1/chats/:id/messages`|メッセージを取得|
|`POST /v1/chats/:id/messages`|フォローアップメッセージ送信|
|`GET /v1/projects`|プロジェクト一覧|
|`POST /v1/projects`|プロジェクト作成|

---

## 3. Download ZIP（手動ダウンロード）

v0のインターフェースから「Share」メニュー経由でZIPファイルとしてプロジェクト全体をダウンロードすることも可能です。

---

## 比較まとめ

|方法|用途|料金|自動化|
|---|---|---|---|
|Add to Codebase|個別コンポーネントの追加|無料プラン可|△|
|Platform API/SDK|大量生成、ワークフロー統合|有料プラン必須|◎|
|ZIP Download|プロジェクト全体の取得|無料プラン可|×|

---

## 公式ドキュメント

- **Platform API概要**: [https://v0.dev/docs/api/platform/overview](https://v0.dev/docs/api/platform/overview)
- **Quickstart**: [https://v0.dev/docs/api/platform/quickstart](https://v0.dev/docs/api/platform/quickstart)
- **GitHub (v0-sdk)**: [https://github.com/vercel/v0-sdk](https://github.com/vercel/v0-sdk)



###### Claudeの調査
## 1. 「Add to Codebase」ボタン（CLIコマンド）

v0のWeb UIから最も簡単に使える方法です。

**手順：**

1. v0.devでUIを作成
2. 画面右上の「**Add to codebase**」ボタンをクリック
3. 生成されるnpxコマンドをコピー
4. ローカルのターミナルで実行

**コマンド例：**

bash

```bash
npx shadcn@latest add "https://v0.dev/chat/b/<project_id>?token=<your_token>"
```

このコマンドは、shadcn CLIを使用してコンポーネントを既存のNext.jsプロジェクトに追加します。初回実行時は`components.json`の設定が求められます。

---

## 2. v0 Platform API / TypeScript SDK

プログラマティックにv0の機能を使いたい場合の方法です。**現在ベータ版**で提供されています。

**前提条件：**

- v0 Premium（$20/月）またはTeamプラン（$30/ユーザー/月）が必要
- APIキーは [https://v0.app/chat/settings/keys](https://v0.app/chat/settings/keys) で発行

**SDKのインストール：**

bash

```bash
pnpm add v0-sdk
# または npm install v0-sdk
```

**環境変数の設定：**

bash

```bash
V0_API_KEY=your_api_key_here
```

**コード例（生成されたファイルを取得）：**

typescript

```typescript
import { v0 } from 'v0-sdk'

// プロンプトでチャットを作成し、コード生成
const chat = await v0.chats.create({
  message: 'Build a todo app with React and TypeScript',
})

// 生成されたファイルにアクセス
chat.files?.forEach((file) => {
  console.log(`File: ${file.name}`)
  console.log(`Content: ${file.content}`)
})

// フォローアップメッセージで改善
const response = await v0.chats.sendMessage({
  chatId: chat.id,
  message: 'Add dark mode support',
})
```

**スターターアプリの作成：**

bash

```bash
pnpm create v0-sdk-app@latest my-v0-app
cd my-v0-app
```

**主なAPI エンドポイント：**

|エンドポイント|説明|
|---|---|
|`POST /v1/chats`|チャットを作成（コード生成）|
|`GET /v1/chats/:id/messages`|メッセージを取得|
|`POST /v1/chats/:id/messages`|フォローアップメッセージ送信|
|`GET /v1/projects`|プロジェクト一覧|
|`POST /v1/projects`|プロジェクト作成|

---

## 3. Download ZIP（手動ダウンロード）

v0のインターフェースから「Share」メニュー経由でZIPファイルとしてプロジェクト全体をダウンロードすることも可能です。

---

## 比較まとめ

|方法|用途|料金|自動化|
|---|---|---|---|
|Add to Codebase|個別コンポーネントの追加|無料プラン可|△|
|Platform API/SDK|大量生成、ワークフロー統合|有料プラン必須|◎|
|ZIP Download|プロジェクト全体の取得|無料プラン可|×|

---

## 公式ドキュメント

- **Platform API概要**: [https://v0.dev/docs/api/platform/overview](https://v0.dev/docs/api/platform/overview)
- **Quickstart**: [https://v0.dev/docs/api/platform/quickstart](https://v0.dev/docs/api/platform/quickstart)
- **GitHub (v0-sdk)**: [https://github.com/vercel/v0-sdk](https://github.com/vercel/v0-sdk)
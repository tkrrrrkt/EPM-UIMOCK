# development-process.md

## CCSDD × v0 × Cursor 開発プロセス定義書（完全版）

---

## 0. 本ドキュメントの位置づけ

本ドキュメントは、**業務系SaaS（EPM想定）を CCSDD（Contract-Centered Specification Driven Development）前提で、v0 と Cursor を組み合わせて破綻なく開発するための「開発プロセス憲法」**である。

* 本書は `.kiro/steering/` 配下に配置される**正本（SSoT）**である
* すべての Feature 開発・AI実装・レビューは本書に従う
* **仕様（Spec）が常に正**であり、実装は従属物とする
* 人・AI・ツールが混在しても構造と責務が崩れないことを最優先とする

## 0.1 Principles（MUST）

本プロジェクトにおける開発順序・責務境界は、すべてのFeature・すべてのAI/実装者に対して拘束力を持つ。

### Core Ordering（Contracts-first）

- すべてのfeatureは **contracts（bff → api → shared）を先に確定**してから DB/実装に進む。
- tasks.md は必ず以下の順で並べる：
  1) Decisions
  2) Contracts（bff → api → shared）
  3) DB/Migration/RLS
  4) Domain API
  5) BFF
  6) UI（最後）

### v0 UI Generation（Two-Phase）

- Phase 1（統制テスト）：
  - 目的：境界/契約/Design System準拠の検証（見た目完成は目的外）
  - 出力先：`apps/web/_v0_drop/<context>/<feature>/src`
  - MockBffClientで動作確認（BFF未接続）
  - structure-guards を必ず通す
- Phase 2（本実装）：
  - v0出力を features に移植
  - HttpBffClient 実装・実BFF接続
  - URL state / debounce / E2E などを追加

---

## 1. 開発思想（合意済み原則）

### 1.1 基本思想

* **Spec（仕様）が Single Source of Truth（SSoT）**
* 実装は Spec に従属し、逆転を許さない
* AIは「判断主体」ではなく「開発を加速する道具」
* 壊れやすい部分（境界・構造・契約）は**コードとスクリプトで強制**する
* 壊れにくい部分（方針・思想・誘導）は**ルール文書で定義**する

### 1.2 採用する開発モデル（CCSDD）

```
Requirements
  ↓
Design（Architecture / Responsibilities / Contracts）
  ↓
Design Review（GO/NO-GO判定）
  ↓
Tasks（Gate + 手順）
  ↓
Contracts 実装
  ↓
Scaffold（構造を先に固定）
  ↓
v0 Prompt 作成
  ↓
v0 UI生成（隔離）
  ↓
受入チェック（Structure Guard）
  ↓
移植（Migration）
  ↓
Backend 実装（API / BFF）
  ↓
統合テスト
```

* Contracts-first（UIより先に契約を確定）
* v0は「実装」ではなく「生成素材」として扱う

---

## 2. 全体STEPサマリ（IN / TOOL / OUT）

| STEP | 名称              | 主なIN                | 主なツール            | 主なOUT                       |
| ---- | ----------------- | --------------------- | -------------------- | ----------------------------- |
| 0    | プロジェクト憲法定義 | 事業構想・思想         | 手動 / AI            | steering/*.md                 |
| 1    | 要求定義           | 業務要求              | Kiro / Cursor        | requirements.md               |
| 2    | 設計              | requirements.md       | Kiro / Cursor        | design.md                     |
| 3    | 設計レビュー       | design.md             | Cursor / 人間        | design-review.md (GO/NO-GO)   |
| 4    | タスク分解         | design.md (GO判定済)  | Kiro / Cursor        | tasks.md                      |
| 5    | Contracts実装     | design.md             | Cursor               | packages/contracts/           |
| 6    | 構造固定           | design.md             | scaffold-feature.ts  | Feature骨格                   |
| 7    | v0 Prompt作成     | design.md, contracts  | Cursor               | v0-prompt.md                  |
| 8    | UI生成            | v0-prompt.md          | v0                   | _v0_drop/.../src              |
| 9    | v0ファイル取得     | v0 URL                | v0-fetch.sh          | _v0_drop/.../src              |
| 10   | 受入検証           | v0出力                | structure-guards.ts  | Guard PASS                    |
| 11   | 移植              | v0出力 (PASS済)       | v0-migrate.ts        | features/                     |
| 12   | Backend実装       | tasks.md, contracts   | Cursor               | apps/api, apps/bff            |
| 13   | 統合テスト         | 実装コード            | Cursor / 人間        | 動作確認完了                   |

---

## 3. STEP別 詳細定義

---

## STEP0：プロジェクト憲法定義（Steering）

### 目的

* 全 Feature 共通の**思想・構造・非交渉ルール**を確定する
* 人・AI・ツールが同一前提で動作できる状態を作る

### 正本ファイル（SSoT）

* `.kiro/steering/product.md`（プロダクト方針・ロードマップ）
* `.kiro/steering/tech.md`（技術憲法・非交渉ルール）
* `.kiro/steering/structure.md`（構造・責務分離ルール）
* `.kiro/steering/v0-workflow.md`（v0隔離・受入・移植ルール）
* `.kiro/steering/v0-prompt-template.md`（v0プロンプト雛形）
* `.kiro/steering/development-process.md`（本書）

### 完了条件（DoD）

* 上記ファイルが存在し、相互に矛盾がない
* Feature 開発時の参照先が明確

---

## STEP1：要求定義（Requirements）

### 目的

* 「何を実現するか」を曖昧さなく定義する

### INPUT情報（必須確認）

要件作成前に、以下の情報を必ず確認し、requirements.md に参照元を明記する：

| 優先度 | 参照先 | 確認内容 |
|-------|-------|---------|
| **必須** | `.kiro/specs/仕様概要/<機能名>.md` | 確定済み仕様のサマリ。要件の基盤となる |
| **必須** | `.kiro/specs/entities/*.md` | 対象エンティティのカラム・制約・ビジネスルール |
| 参考 | `.kiro/specs/仕様検討/<YYYYMMDD>_<テーマ>.md` | 仕様決定に至った経緯・背景・議論内容 |

#### INPUT確認手順

1. **仕様概要を確認**: 対象機能の確定済み仕様を把握する
2. **エンティティを確認**: 使用するテーブルのカラム・型・制約を把握する
3. **仕様検討を参考確認**: なぜその仕様になったかの背景を理解する（任意だが推奨）
4. **requirements.md の Spec Reference セクションに参照元を記載**

### ルール

* EARS / Given-When-Then 形式で記述
* UIや技術都合は書かない
* ビジネス要求に集中する
* 各要件に一意のID（1.1, 1.2, 2.1, 2.2...）を付与
* **INPUT情報と矛盾する要件は書かない**（矛盾がある場合は仕様概要/entities を先に更新）

### エンティティ整合性チェック（必須）

* 要件作成前に `.kiro/specs/entities/*.md` を必ず確認する
* 対象エンティティのカラム・制約・ビジネスルールを把握する
* 要件がエンティティ定義と矛盾しないことを確認する
* **Out of Scope** にはエンティティ定義で別機能とされた項目を明記する

### 成果物

* `.kiro/specs/<context>/<feature>/requirements.md`

### 参照テンプレート

* `.kiro/settings/templates/specs/requirements.md`

---

## STEP2：設計（Design）

### 目的

* **UIより先に Contract と責務境界を確定する**

### INPUT情報（必須確認）

設計作成前に、以下の情報を必ず確認し、design.md に参照元を明記する：

| 優先度 | 参照先 | 確認内容 |
|-------|-------|---------|
| **必須** | `.kiro/specs/<context>/<feature>/requirements.md` | 本Featureの要件定義（直接のINPUT） |
| **必須** | `.kiro/specs/仕様概要/<機能名>.md` | 確定済み仕様。設計判断の根拠となる |
| **必須** | `.kiro/specs/entities/*.md` | エンティティ定義。Data Model の正本 |
| 参考 | `.kiro/specs/仕様検討/<YYYYMMDD>_<テーマ>.md` | 設計判断の背景・経緯を理解 |

#### INPUT確認手順

1. **requirements.md を確認**: 本Featureで実現すべき要件を把握
2. **仕様概要を確認**: 設計判断に必要な確定済み仕様を把握
3. **エンティティを確認**: Data Model の正本として参照
4. **仕様検討を参考確認**: 設計判断の背景を理解（任意だが推奨）
5. **design.md の Spec Reference セクションに参照元を記載**

### 必須構成（design.md）

* Architecture Overview
* Architecture Responsibilities（Mandatory）
  * BFF Specification（Endpoints, Paging正規化, Error Policy）
  * Service Specification（Transaction境界, 監査ポイント）
  * Repository Specification（tenant_id double-guard）
* Contracts Summary（BFF / API / Enum / Error）
* **Data Model（エンティティ定義との整合性確認済み）**
* トランザクション境界
* 監査・RLS前提
* Requirements Traceability

### エンティティ整合性チェック（必須）

設計作成時に以下を検証し、**design.md の Data Model セクションに整合性確認結果を記載する**：

| チェック項目 | 確認内容 |
|-------------|---------|
| カラム網羅性 | エンティティ定義の全カラムがDTO/Prismaに反映されている |
| 型の一致 | varchar(50) → String, numeric(9,4) → Decimal 等の型変換が正確 |
| 制約の反映 | UNIQUE/CHECK制約がPrisma @@unique/アプリ検証に反映 |
| ビジネスルール | エンティティ補足のルール（例: AGGREGATE→posting_allowed=false）が Service に反映 |
| NULL許可 | NULL/NOT NULL がPrisma?/必須に正しく対応 |

### 必須記載事項（省略禁止）

* DTO 命名: camelCase
* DB カラム: snake_case
* sortBy: DTO キー名を使用
* Error Policy: Pass-through または Minimal shaping を選択
* Paging 正規化: BFF で page/pageSize → offset/limit 変換

### 成果物

* `.kiro/specs/<context>/<feature>/design.md`

### 参照テンプレート

* `.kiro/settings/templates/specs/design.md`

---

## STEP3：設計レビュー（Design Review）

### 目的

* 設計品質を確認し、実装可否（GO/NO-GO）を判断する

### レビュー観点

* 既存アーキテクチャとの整合性
* 設計の一貫性と標準準拠
* 拡張性と保守性
* 型安全性とインターフェース設計

### ルール

* Critical Issues は最大 3 件に絞る
* 各 Issue に Traceability（要件ID）と Evidence（design.md のセクション）を記載
* GO 判定の場合のみ次 STEP へ進む
* NO-GO の場合は STEP 2 へ戻り design.md を修正

### 成果物

* `.kiro/specs/<context>/<feature>/design-review.md`

### 参照ルール

* `.kiro/settings/rules/design-review.md`

---

## STEP4：タスク分解（Tasks）

### 目的

* 実装手順を明確化し、Gate を設定する

### ルール

* Design Review で GO 判定後のみ作成可
* 必ず Contracts-first 順序で記載：
  1) Design Completeness Gate
  2) Decisions
  3) Contracts（bff → api → shared）
  4) DB / Migration / RLS
  5) Domain API（apps/api）
  6) BFF（apps/bff）
  7) UI（apps/web）
* 各タスクに `_Requirements: X.X_` でトレーサビリティを記載
* 並列可能なタスクには `(P)` マーカーを付与

### 成果物

* `.kiro/specs/<context>/<feature>/tasks.md`

### 参照テンプレート

* `.kiro/settings/templates/specs/tasks.md`

---

## STEP5：Contracts 実装

### 目的

* UI/BFF/API 間の契約を先に確定する

### 実装順序（必須）

1. `packages/contracts/src/bff/<feature>/index.ts`（最初）
2. `packages/contracts/src/api/<feature>/index.ts`
3. `packages/contracts/src/api/errors/<feature>-error.ts`
4. `packages/contracts/src/api/errors/index.ts`（export 追加）

### ルール

* BFF DTO: page/pageSize（1-based）
* API DTO: offset/limit（0-based）
* Error Codes を定義

### 成果物

* `packages/contracts/src/bff/<feature>/index.ts`
* `packages/contracts/src/api/<feature>/index.ts`
* `packages/contracts/src/api/errors/<feature>-error.ts`

---

## STEP6：構造固定（Scaffold）

### 目的

* v0 や実装が迷い込む余地を排除する

### 実行コマンド

```bash
npx tsx scripts/scaffold-feature.ts <context> <feature>
```

### 作成される骨格

* `apps/web/src/features/<context>/<feature>/`
* `apps/bff/src/modules/<context>/<feature>/`
* `apps/api/src/modules/<context>/<feature>/`
* `apps/web/_v0_drop/<context>/<feature>/`

---

## STEP7：v0 Prompt 作成

### 目的

* v0 に渡すプロンプトを作成する

### 入力

* `.kiro/specs/<context>/<feature>/design.md`
* `packages/contracts/src/bff/<feature>/index.ts`
* `.kiro/steering/v0-prompt-template.md`

### ルール

* v0-prompt-template.md の `<...>` を埋める
* BFF Specification を完全に記載
* 禁止事項を明記：
  * layout.tsx 生成禁止
  * 生カラーリテラル禁止
  * 直接 fetch 禁止
  * 基盤 UI コンポーネント作成禁止

### 成果物

* `.kiro/specs/<context>/<feature>/v0-prompt.md`

---

## STEP8：UI生成（v0）

### 目的

* Contract準拠のUIを高速生成する

### ルール

* v0.dev で v0-prompt.md の内容を貼り付け
* 生成結果を確認し、必要に応じて修正を依頼
* 完成したら URL を控える

### 出力

* v0 生成コード（v0.dev 上）
* v0 Chat URL

---

## STEP9：v0 ファイル取得

### 目的

* v0 生成物をローカルの隔離ゾーンに取得する

### 実行コマンド

```bash
./scripts/v0-fetch.sh '<v0_url>' '<context>/<feature>'
```

### 出力先（隔離ゾーン）

```
apps/web/_v0_drop/<context>/<feature>/src/
├── components/
├── api/
│   ├── BffClient.ts
│   ├── MockBffClient.ts
│   └── HttpBffClient.ts
├── page.tsx
└── OUTPUT.md
```

### ルール

* `apps/web/src` には直接配置しない
* 必ず `_v0_drop/.../src/` に格納

---

## STEP10：受入チェック（Structure Guard）

### 目的

* ルール違反を人の注意に依存せず検出する

### 実行コマンド

```bash
npx tsx scripts/structure-guards.ts
```

### 主な検出内容

* UI → Domain API 直接呼び出し禁止
* UI direct fetch 禁止
* UI による `contracts/api` 参照禁止
* BFF の DB 直アクセス禁止
* layout.tsx 存在禁止
* 生カラーリテラル禁止
* v0_drop 内の違反検出

### ルール

* 全 Guard が PASS するまで次 STEP に進まない
* 違反発見時は手動修正後、再実行

---

## STEP11：移植（Migration）

### 目的

* v0生成物を安全に本実装へ移植する

### 実行コマンド

```bash
npx tsx scripts/v0-migrate.ts <context> <feature>
```

### 移植先

```
apps/web/src/features/<context>/<feature>/
```

### 移植後の修正（必須）

1. import パス修正（`@/shared/ui` を使用）
2. DTO import 修正（`@contracts/bff/<feature>` を使用）
3. App Router 登録（`apps/web/src/app/<context>/<feature>/page.tsx`）
4. Navigation 登録（`apps/web/src/shared/navigation/menu.ts`）

### ルール

* 上書きは `--force` 明示時のみ許可
* MockBffClient で画面が動作することを確認

---

## STEP12：Backend 実装（API / BFF）

### 目的

* Domain API と BFF を実装し、実データで動作させる

### 実装順序（必須）

1. Prisma Schema 更新
2. Migration 実行
3. Domain API Repository（tenant_id double-guard 必須）
4. Domain API Service
5. Domain API Controller
6. Domain API Module
7. BFF Mapper
8. BFF Domain API Client
9. BFF Service（page/pageSize → offset/limit 変換）
10. BFF Controller
11. BFF Module
12. UI で HttpBffClient に切替

### 成果物

* `apps/api/src/modules/<context>/<feature>/`
* `apps/bff/src/modules/<context>/<feature>/`
* `packages/db/prisma/schema.prisma`（更新）

---

## STEP13：統合テスト

### 目的

* 全レイヤーが正しく連携することを確認する

### 確認項目

* CRUD 全操作が動作する
* tenant_id によるフィルタが効いている
* エラーハンドリングが正しい
* ページネーションが動作する
* ソートが動作する

### 成果物

* tasks.md の全タスク完了

---

## 4. Tasks.md による実装制御（重要）

### 役割

* 実装開始の Gate
* v0 利用可否の判断基準
* Contracts → Scaffold → v0 → Guard → Migrate の順序制御

### Design Completeness Gate

* design.md が未完成の場合、**一切実装不可**
* design-review.md で GO 判定がない場合、**一切実装不可**

---

## 5. Cursor Rule の扱い（結論）

### 方針

* Cursor Rule には**最低限の境界ルールのみ**を記載
* 強制は scripts、誘導は rule

### Rule に含める内容

* UI → BFF ONLY
* `contracts/api` UI参照禁止
* v0隔離ルール
* direct fetch 禁止
* ファイル配置ルール

### 含めない内容

* 実装詳細
* ビジネスロジック
* タスク手順

---

## 6. 本プロセスで得られた成果

* CCSDD / SDD が実運用レベルで定義済み
* v0 を安全に使える仕組みが完成
* Cursor に依存しない再現性
* Feature を同一プロセスで量産可能

---

## 7. 最重要原則（再掲）

1. **Spec が正、コードは従属**
2. **Contracts-first**: UI より先に契約を確定
3. **v0 は隔離**: 直接 src に入れない
4. **境界を守る**: UI → BFF → API → DB
5. **tenant_id double-guard**: Repository + RLS
6. **判断は ADR に残す**
7. **AI は速くする道具であり、設計責任者ではない**
8. **エンティティ定義が DB 設計の正本**: Req/Design はエンティティ定義に従属

---

## 8. エンティティ変更管理

### エンティティ定義の位置づけ

* `.kiro/specs/entities/*.md` は **DB設計の SSoT（Single Source of Truth）**
* すべての Feature の design.md はエンティティ定義に従属する
* エンティティ定義と design.md が矛盾する場合、**エンティティ定義が正**

### エンティティ変更時の運用フロー

```
エンティティ変更要求
  ↓
1. entities/*.md を更新（変更理由・日付をコメント）
  ↓
2. 影響範囲特定（どの Feature の design.md が影響を受けるか）
  ↓
3. 影響を受ける design.md を更新
  ↓
4. 影響を受ける contracts を更新
  ↓
5. Prisma Schema を更新
  ↓
6. Migration 実行
  ↓
7. 実装コード修正
```

### 影響範囲特定の方法

エンティティ名で以下を検索：

```bash
# design.md での参照を検索
grep -r "<entity_name>" .kiro/specs/*/design.md

# contracts での参照を検索
grep -r "<entity_name>" packages/contracts/

# Prisma での参照を検索
grep -r "<entity_name>" packages/db/prisma/
```

### 変更履歴の記録（必須）

各エンティティファイル（`.kiro/specs/entities/*.md`）の **末尾** に変更履歴セクションを設ける。

#### フォーマット

```markdown
---

# 変更履歴

| 日付 | エンティティ | 変更種別 | 変更内容 | 影響 Feature | 理由 | 担当 |
|------|-------------|---------|---------|-------------|------|------|
| 2026-01-04 | subjects | ALTER | coefficient: numeric(5,2) → numeric(9,4) | subject-master | 小数点以下4桁の精度が必要 | @username |
| 2026-01-03 | subjects | ADD | direction カラム追加 | subject-master | KPI方向性の表現が必要 | @username |
```

#### 変更種別

| 種別 | 説明 | 例 |
|------|------|-----|
| ADD | 新規エンティティ追加 | 新テーブル定義 |
| ALTER | 既存カラムの型・制約変更 | varchar(50)→varchar(100) |
| ADD_COL | カラム追加 | 新カラム追加 |
| DROP_COL | カラム削除 | 不要カラム削除 |
| RENAME | 名称変更 | カラム名・テーブル名変更 |
| RULE | ビジネスルール変更 | 制約・補足ルール変更 |

#### 記録タイミング

* エンティティ定義を変更した **直後** に記録する
* 変更者本人が記録する（レビュアーではない）
* コミット前に必ず履歴を追加する

#### 記録しなくてよい変更

* typo 修正（意味に影響しない誤字修正）
* コメント・補足説明の追加
* フォーマット調整

### 禁止事項

* エンティティ定義を更新せずに design.md や Prisma を先に変更すること
* Feature 固有の都合でエンティティ定義を歪めること（全体最適を優先）
* 変更理由を記録せずにエンティティを変更すること
* 変更履歴を後付けで追加すること（変更と同時に記録）

---

## 9. 関連ドキュメント

* **詳細な実践ガイド**: `doc/DEVELOPMENT_PROCESS_GUIDE.md`
  * 各 STEP の詳細手順
  * Cursor / Kiro への指示プロンプト集
  * コマンド一覧
  * ファイル配置早見表

---

## 10. 仕様検討・仕様概要の管理

### 目的

* QA やチャットでの仕様検討経過を資産として蓄積する
* 確定した仕様を機能単位で整理し、チーム全体で参照可能にする
* AI（Claude Code / Cursor / Kiro）が仕様コンテキストを把握できるようにする

### フォルダ構成

```
.kiro/specs/
├── 仕様検討/          # QA・議論の経過記録
│   ├── <検討テーマ>.md
│   └── ...
├── 仕様概要/          # 確定した仕様のサマリ
│   ├── <機能名>.md
│   └── ...
├── entities/          # エンティティ定義（既存）
├── <context>/<feature>/  # Feature 仕様（既存）
└── ...
```

### 仕様検討（`.kiro/specs/仕様検討/`）

#### 役割

* チャット・QA での議論経過を時系列で記録
* 「なぜその仕様になったか」の意思決定根拠を残す
* 後からの仕様変更時に過去の議論を参照可能にする

#### ファイル命名規則

* `<YYYYMMDD>_<検討テーマ>.md`（例: `20260109_ディメンション構造.md`）
* 日付を先頭にすることでファイル一覧が時系列順にソートされる
* 同一テーマで複数回検討する場合は日付で区別

#### 記載内容

```markdown
# <検討テーマ>

## 検討日
YYYY-MM-DD

## 参加者
- （人名 / AI名）

## 検討背景
（なぜこの検討が必要になったか）

## 議論内容
（QA 形式または時系列で記録）

### Q1: ...
A1: ...

### Q2: ...
A2: ...

## 決定事項
- （確定した内容を箇条書き）

## 未決事項・次回検討
- （残った課題があれば記載）

## 関連ドキュメント
- （参照した entities/*.md, design.md など）
```

### 仕様概要（`.kiro/specs/仕様概要/`）

#### 役割

* 確定した仕様を機能単位で簡潔にまとめる
* 新規参加者や AI が全体像を把握するためのエントリーポイント
* design.md より上位の概念レベルで整理

#### ファイル命名規則

* `<機能名>.md`（日本語可、例: `ディメンション管理.md`）
* 機能グループ単位でまとめる場合は `<グループ名>_概要.md`

#### 記載内容

```markdown
# <機能名> 仕様概要

## 概要
（この機能が何をするか、1-2 文で）

## 対象エンティティ
- （関連する entities/*.md のファイル名とエンティティ名）

## 主要な仕様
### <仕様項目1>
- ...

### <仕様項目2>
- ...

## 関連 Feature
- `.kiro/specs/<context>/<feature>/` へのリンク

## 検討経緯
- `.kiro/specs/仕様検討/<関連ファイル>.md` へのリンク

## 変更履歴
| 日付 | 変更内容 | 担当 |
|------|---------|------|
| YYYY-MM-DD | 初版作成 | @xxx |
```

### 運用ルール

#### 記録タイミング

| 状況 | 記録先 |
|-----|-------|
| QA・チャットで仕様について議論した | `仕様検討/<YYYYMMDD>_<テーマ>.md` |
| 議論の結果、仕様が確定した | `仕様概要/<機能名>.md` を新規作成または更新 |
| 既存仕様を変更する議論をした | `仕様検討/` に新規ファイル追加 → `仕様概要/` を更新 |

#### 必須事項

* 仕様に関する重要な議論は必ず `仕様検討/` に記録する
* 確定した仕様は `仕様概要/` に反映する
* AI との対話で決まった仕様も同様に記録する

#### 禁止事項

* チャット上の決定を記録せずに実装に進むこと
* `仕様概要/` を `仕様検討/` の記録なしに更新すること（軽微な修正を除く）

### AI への指示

生成 AI（Claude Code / Cursor / Kiro）は以下を遵守する：

1. **仕様に関する質問を受けた場合**
   - まず `仕様概要/` を確認
   - 詳細が必要な場合は `仕様検討/` を参照
   - さらに詳細は `entities/*.md` や `design.md` を参照

2. **仕様検討の会話が発生した場合**
   - 議論終了時に「この内容を `仕様検討/` に記録しますか？」と提案
   - ユーザーの承認を得て記録を作成

3. **仕様が確定した場合**
   - `仕様概要/` の更新または新規作成を提案
   - 変更履歴への追記を忘れない

---

（以上）

# Structure Steering

Enterprise Performance Management (EPM) SaaS

---

## 1. 本ファイルの位置づけ

本 structure.md は、本EPM SaaSにおける **リポジトリ構造・責務分離・Single Source of Truth（SSoT）の配置ルール** を定義する。

* tech.md が「技術憲法」であるのに対し、本ファイルは「構造憲法」である
* すべての仕様（Spec）・設計（Design）・実装（Code）は、本構造定義に従う
* SSoTの重複・分散を禁止し、仕様駆動開発（SDD / CCSDD）を成立させることを目的とする

---

## 2. 全体構造の基本思想Iはcontr

* SSoT（正本）は必ず **1か所** に存在させる
* 仕様（Spec）と実装（Code）を厳密に分離する
* ドメイン知識はコードではなく仕様に集約する
* Trial開発であっても、本番EPM SaaSへスケール可能な構造を前提とする
* AI活用は構造上“安全に制限”できる形で組み込む

---

## 3. リポジトリ全体構成（論理）

> **NOTE**: v0生成物は「一次格納（隔離）」→「受入チェック」→「移植して採用」の3段階。
> いきなり apps/web/src へ混入させない。

repo/                                 # ← プロジェクトルート（Git Repository Root）
├─ .kiro/                             # SDD / CCSDD 中枢（仕様SSoT）
│  ├─ steering/                       # プロジェクト憲法（全AI・全人が従う）
│  │  ├─ tech.md                      # 技術憲法（非交渉ルール）
│  │  ├─ product.md                   # プロダクト方針・ロードマップ
│  │  ├─ structure.md                 # 構造・責務分離ルール（本ファイル）
│  │  ├─ v0-workflow.md               # v0運用憲法（生成 / 隔離 / 受入 / 移植）
│  │  └─ v0-prompt-template.md        # v0プロンプト雛形（<...>埋めて貼る）
│  │
│  └─ specs/                          # Feature単位の仕様（SSoT）
│     └─ <context>/<feature-name>/    # 例: master-data/employee-master
│        ├─ spec.json                 # Featureメタ情報
│        ├─ requirements.md           # 要求仕様（EARS / Given-When-Then）
│        ├─ design.md                 # 設計仕様（Architecture Responsibilities）
│        └─ tasks.md                  # 実装計画（Gate / 手順 / チェック）
│        # ※ design.md では DTO=camelCase / DB=snake_case / sortByはDTOキー / Error Policy選択 / Paging正規化（BFF責務）を必ず明記する（省略禁止）
│
├─ packages/
│  ├─ contracts/                      # API / UI / AI 共通の契約SSoT（境界の正本）
│  │  ├─ src/
│  │  │  ├─ api/                      # Domain API 契約（BFF → API）※ UI参照禁止
│  │  │  │  ├─ dto/
│  │  │  │  ├─ enums/
│  │  │  │  └─ errors/
│  │  │  ├─ bff/                      # BFF 契約（UI → BFF）※ UI参照OK（唯一の契約）
│  │  │  │  ├─ dto/
│  │  │  │  ├─ enums/
│  │  │  │  └─ errors/
│  │  │  ├─ read-models/              # AI入力・参照専用モデル（SSoT補助）
│  │  │  └─ shared/                   # 共通定義（最小限・慎重に追加）
│  │  └─ index.ts
│  │
│  └─ db/                             # DBスキーマ・RLS・Migration（正本）
│     ├─ prisma/
│     └─ migrations/
│
├─ apps/
│  ├─ api/                            # Backend Domain API（NestJS）
│  │  └─ src/
│  │     └─ modules/<context>/<feature>/
│  │        ├─ service/               # Usecase / Business Rules
│  │        ├─ repository/            # DBアクセス（tenant_id必須）
│  │        └─ controller/            # API I/F（contracts/api）
│  │
│  ├─ bff/                            # BFF（UI最適化API / 集約・変換のみ）
│  │  └─ src/
│  │     └─ modules/<context>/<feature>/
│  │        ├─ controller/            # UI向けI/F（contracts/bff）
│  │        └─ mapper/                # API DTO → BFF DTO 変換
│  │
│  └─ web/                            # Frontend Web（Next.js）
│     ├─ _v0_drop/                    # ★ v0一次格納（隔離ゾーン）
│     │  ├─ <context>/<feature>/
│     │  │  ├─ PROMPT.md              # v0投入プロンプト
│     │  │  ├─ OUTPUT.md              # v0出力メモ
│     │  │  └─ src/                   # v0生成物（未採用）
│     │  └─ shared/                   # ★ 横串（Shell/UI/Navigation）用のv0隔離ゾーン
│     │     ├─ shell/<name>/
│     │     │  ├─ PROMPT.md
│     │     │  ├─ OUTPUT.md
│     │     │  └─ src/
│     │     ├─ ui/<name>/
│     │     │  ├─ PROMPT.md
│     │     │  ├─ OUTPUT.md
│     │     │  └─ src/
│     │     └─ navigation/<name>/
│     │        ├─ PROMPT.md
│     │        ├─ OUTPUT.md
│     │        └─ src/
│     │
│     └─ src/
│        ├─ app/                      # ルーティング（薄い）
│        ├─ features/                 # Feature単位の実装本体
│        │  └─ <context>/<feature>/
│        │     ├─ ui/                 # 画面・部品（Feature固有）
│        │     ├─ api/                # BffClient / Mock / Http（差し替え点）
│        │     ├─ hooks/              # server state
│        │     ├─ validators/         # 入力制約
│        │     └─ state/              # 入力系状態（必要な場合のみ）
│        │
│        └─ shared/                   # ★ 横串SSoT（共通UI基盤の正本）
│           ├─ ui/                    # Design System SSoT（tokens/components/patterns）
│           │  ├─ tokens/
│           │  ├─ components/
│           │  ├─ patterns/
│           │  └─ README.md
│           ├─ shell/                 # App Shell SSoT（Layout/Header/Sidebar/Providers）
│           │  ├─ AppShell.tsx
│           │  ├─ providers/
│           │  └─ layout/
│           ├─ navigation/            # Navigation/Menu SSoT（IA/Route/Permission）
│           │  ├─ menu.ts
│           │  ├─ routes.ts
│           │  └─ permissions.ts
│           ├─ api/                   # fetch基盤 / エラー表示
│           ├─ auth/                  # Clerk薄い連携
│           └─ utils/
│
├─ scripts/                           # ★ 運用・仕組み化スクリプト（非SSoT）
│  ├─ scaffold-feature.ts             # Feature骨格生成
│  ├─ structure-guards.ts             # 構造・境界違反検出
│  └─ v0-migrate.ts                   # v0生成物の移植（任意）
│
├─ docs/
│  ├─ adr/                            # Architecture Decision Record
│  └─ diagrams/                       # アーキテクチャ・ER図等
│
└─ infra/                             # CI/CD・デプロイ・環境定義

---

## 4. SSoT（Single Source of Truth）マップ

| 対象                                | 正本の置き場所                                                                  |
| --------------------------------- | ------------------------------------------------------------------------ |
| 技術方針・非交渉ルール                       | `.kiro/steering/tech.md`                                                 |
| プロダクト方針・ロードマップ                    | `.kiro/steering/product.md`                                              |
| 構造・責務分離                           | `.kiro/steering/structure.md`                                            |
| Feature仕様（WHAT / HOW / TASK）      | `.kiro/specs/<context>/<feature>/`                                       |
| Domain API 契約（DTO / Enum / Error） | `packages/contracts/src/api`                                             |
| BFF 契約（DTO / Enum / Error）        | `packages/contracts/src/bff`                                             |
| 共通定義（最小限）                         | `packages/contracts/src/shared`                                          |
| AI入力用 Read Model                  | `packages/contracts/src/read-models`                                     |
| DBスキーマ・RLS                        | `packages/db`                                                            |
| 意思決定履歴（ADR）                       | `docs/adr`                                                               |
| v0運用ルール/雛形                        | `.kiro/steering/v0-workflow.md` / `.kiro/steering/v0-prompt-template.md` |
| **Design System（横串）**             | `apps/web/src/shared/ui`                                                 |
| **App Shell（横串）**                 | `apps/web/src/shared/shell`                                              |
| **Navigation/Menu（横串）**           | `apps/web/src/shared/navigation`                                         |

SSoTを複製・再定義することは禁止する。
**正本は常に仕様側にあり、実装は従属する。**

---

## 5. EPMドメイン構造（Contextの考え方）

Contextとは、EPMにおける **業務的・意味的な境界** である。

> 本トライアルでは、まず以下3系統を代表として扱う：
>
> * master-data（マスタ系）
> * transactions（入力・トランザクション系）
> * reporting（照会・レポート系）
>
> 将来スケール時は planning/actuals/kpi-analytics/close-control/integration などへ拡張する。

### 想定Context（代表）

* **core-platform**

  * tenant / user / role / permission / audit
  * 認証（Clerk）との境界管理

* **master-data**

  * Organization / Account / Segment / Period / Scenario / Employee

* **transactions**

  * Budget入力 / 予算配賦 / 調整（保存・確定などの状態遷移を含む）

* **reporting**

  * Budget vs Actual / Variance / Drilldown / Export

横断的関心事（マルチテナント、権限、監査、数値精度、AI境界）は Steering（tech.md）に集約する。

---

## 6. Featureの定義方針（Spec単位）

Featureは **ユーザー価値単位（Vertical Slice）** で定義する。

* 1 Feature = 1つの業務目的
* 複数Contextをまたいでもよい
* 技術的CRUD単位では切らない

### Feature例（本トライアルの代表）

* `master-data/employee-master`
* `planning/budget-entry`
* `reporting/budget-vs-actual`

---

## 7. Specs（.kiro/specs）の運用ルール

* feature-name は kebab-case とする
* requirements → design → tasks の順序を厳守する
* design.md 無しでの実装は禁止する
* tasks は requirements へのトレーサビリティを必ず持つ

Specは **実装より先に存在する**。
Specが存在しないコードは原則として許可しない。

## 7.1 tasks.md の章順ルール（Contracts-first / MUST）

tasks.md は必ず以下の順で構成する（逸脱禁止）：

1) Decisions（意思決定）
2) Contracts（bff → api → shared）
3) DB / Migration / RLS
4) Domain API（apps/api）
5) BFF（apps/bff）
6) UI（apps/web：最後）

目的：DBや実装が先行して契約と不整合になる事故を防止する。

---

## 8. Contracts（packages/contracts）の役割

contracts は、**API・UI・AIを接続する唯一の契約SSoT**である。

### 含めるもの

* DTO（Request / Response）
* Enum（状態・種別）
* Error定義（業務エラー / 技術エラー）
* Read Model（AI入力・参照専用）

### 含めないもの

* ビジネスロジック
* DB構造
* UIコンポーネント

### contracts の分割（必須）

* `src/api`：Domain API 契約（BFF → API）
* `src/bff`：BFF 契約（UI → BFF）
* `src/read-models`：AI入力・参照専用
* `src/shared`：共通定義（最小限）

**UI は api 契約を直接参照してはならない。**

---

## 9. 設計原則 / アーキテクチャ原則（境界の強制）

* UI は Domain API を直接呼び出してはならず、必ず BFF を経由する
* BFF は Read Model / View Model の責務を持つ（ページング/整形/集約）
* BFF はドメイン権限の最終判断を行わない（最終判断は Domain API）
* BFF の Error Policy は feature の design.md で **明示的に選択**する（テンプレに従う）
  - Option A: Pass-through（推奨）= Domain API エラーを原則透過
  - Option B: Minimal shaping = UI表示に必要な最小整形のみ許可（整形結果は contracts/bff/errors に定義）

---

## 10. Backend（apps/api）の構造方針（Domain API）

* NestJS によるモジュラーモノリス構成
* Repositoryは原則ORM経由で実装する

### apps/api 推奨構造

apps/api/src/
├─ common/                   # 横断（authz/audit/db/errors）
└─ modules/
└─ <context>/<feature>/
├─ <feature>.controller.ts
├─ <feature>.service.ts
└─ <feature>.repository.ts

### Repository原則の例外

* 大量データの一括取込・更新（バルク処理）
* 集計・分析用途の参照処理

これらは **Infrastructure Adapter** に閉じ込める。

---

## 11. BFF（apps/bff）の構造方針

* NestJS
* UI向けの集約・変換・整形のみ
* DBへ直接接続しない（Domain API経由）

### apps/bff 推奨構造

apps/bff/src/
├─ common/                   # 横断（tenant解決/エラー正規化/http client）
└─ modules/
└─ <context>/<feature>/
├─ <feature>.controller.ts
├─ <feature>.service.ts
└─ mappers/<feature>.mapper.ts

---

## 12. Frontend（apps/web）の構造方針

* Next.js App Router 前提
* Feature単位で画面構成を行う
* ドメインロジックは保持しない
* contracts を唯一の型定義として利用する
* v0 は UI叩き台用途に限定し、SSoTとはしない

### Web状態管理（採用スタック）

* Server State（API由来）：TanStack Query
* Form State（入力/dirty/検証）：React Hook Form + Zod
* UI State（表示制御）：原則ローカル（useState/useReducer）
* URL State（Period/Version/Org等）：searchParams + Zod
* グローバル状態（例外）：Zustand（必要最小限）

---

## 13. 横串SSoT（App Shell / Navigation / Design System）

EPM SaaSは Feature（機能画面）単体では成立しない。
「製品として一貫した体験」を担保する横串要素を、SSoTとして明示的に管理する。

### 13.1 正本（SSoT）の置き場（非交渉）

apps/web/src/shared/ は “横串の正本” であり、Featureは必ずこれを参照する。
Feature内で独自のUI規約・ナビ規約を定義してはならない。

* `apps/web/src/shared/ui` … Design System SSoT（tokens/components/patterns）
* `apps/web/src/shared/shell` … App Shell SSoT（Layout/Header/Sidebar/Providers）
* `apps/web/src/shared/navigation` … Navigation/Menu SSoT（IA/Route/Permission）

### 13.2 Featureとの接続点（必須）

* Featureの入口（画面遷移）は必ず `shared/navigation/menu.ts` に登録されること
* Featureのページは App Shell 上でレンダリングされること
* Feature UIは `shared/ui` の components/patterns を優先して利用すること

### 13.3 v0生成物の扱い（横串も同じ）

v0生成は Feature と同様に隔離ゾーンへ一次格納し、受入チェック（Guard）後に shared/ へ移植して採用する。

* `apps/web/_v0_drop/shared/shell/...`
* `apps/web/_v0_drop/shared/ui/...`
* `apps/web/_v0_drop/shared/navigation/...`

---

## 14. v0一次格納（隔離）と受入チェック（必須）

### v0 二段階運用（Two-Phase / MUST）

- Phase 1（統制テスト）：
  - 目的：境界/契約/Design System準拠の検証（見た目完成は目的外）
  - 出力先：`apps/web/_v0_drop/<context>/<feature>/src`
  - MockBffClientで動作確認（BFF未接続）
  - `scripts/structure-guards.ts` を必ず通す
- Phase 2（本実装）：
  - features へ移植して採用
  - HttpBffClient 実装・実BFF接続
  - URL state / debounce / E2E 等はここで追加

### 一次格納ルール

* v0成果物は `apps/web/_v0_drop/...` に格納する
* 直接 `apps/web/src` に投入しない（差分追跡と受入検査のため）

### 受入チェック（最低限）

* UIが Domain API を直接呼ばない（BFFのみ）
* UIが `packages/contracts/src/api` を参照しない（bffのみ参照）
* fetch直書きを禁止し、`HttpBffClient` 経由に集約する
* `BffClient / MockBffClient / HttpBffClient` が存在し、Mockで起動可能

### 移植ルール

* Feature: `_v0_drop/<context>/<feature>/src` → `apps/web/src/features/<context>/<feature>/...` へ移植して採用
* Shared: `_v0_drop/shared/.../src` → `apps/web/src/shared/...` へ移植して採用
* 移植後に不要なv0固有設定は除去し、プロジェクト標準へ整形する

---

## 15. ADR（Architecture Decision Record）

* 構造・例外・技術選定の理由を記録する
* 「なぜそうしたか」を将来に残す
* tech.md / structure.md に影響する変更は必ずADRを残す

---

## 16. 禁止事項

* SSoTをコード側に複製すること
* Specを経由しない設計・実装
* 技術都合で構造原則を破ること
* AIに正本データを書き換えさせること

---

構造は目的ではない。
**EPMという経営判断基盤を、安全に進化させ続けるための前提条件である。**

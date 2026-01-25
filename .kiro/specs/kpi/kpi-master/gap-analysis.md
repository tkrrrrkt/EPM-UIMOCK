# Implementation Gap Analysis: KPI管理マスタ

## 分析日
2026-01-25

## 分析対象
- **Feature**: kpi/kpi-master
- **Requirements**: `.kiro/specs/kpi/kpi-master/requirements.md`
- **対象要件数**: 11要件、73受入基準

---

## 1. 現状調査（Current State Investigation）

### 1.1 既存資産の概要

#### データベース層
- **Prisma Schema**: `/packages/db/prisma/schema.prisma`
  - **現状**: 基本設定のみ、モデル定義なし（空の状態）
  - **影響**: 5つの新規エンティティ + 3つの既存エンティティ修正が必要

#### Contracts層（BFF）
- **既存パターン**: `/packages/contracts/src/bff/action-plan-core/index.ts`
  - BffClient interfaceパターン確立済み
  - Request/Response DTO、Enum、ErrorCode の標準構造
  - `subjectId`参照の既存実装（新仕様では`kpi_master_item_id`に移行必要）
- **GAP**: `bff/kpi-master`契約が未作成

#### Domain API層
- **検索結果**: apps/api 配下にKPI管理マスタ関連モジュールなし
- **GAP**: Controller/Service/Repository 全層の実装が必要

#### BFF層
- **検索結果**: apps/bff 配下にKPI管理マスタ関連モジュールなし
- **GAP**: Controller/Service/Mapper 全層の実装が必要

#### UI層
- **既存KPI機能**: `/apps/web/src/features/kpi/`
  - `action-plan-core`: アクションプラン一覧・CRUD
  - `action-plan-dashboard`: KPIダッシュボード（旧仕様）
  - `action-plan-gantt`: ガントチャート
  - `action-plan-kanban`: カンバンボード
- **共通UIコンポーネント**: `/apps/web/src/shared/ui/components/`
  - Accordion, Collapsible, Dialog, Table 等すべて利用可能
- **GAP**:
  - KPI管理マスタ画面（イベント登録）未実装
  - KPI一覧画面（パネル開閉式）未実装
  - 既存action-plan-*機能は`subjectId`ベースで実装されており、`kpi_master_item_id`への移行が必要

### 1.2 確立されたアーキテクチャパターン

#### Contracts-firstフロー
1. `packages/contracts/src/bff/` にBFF契約を定義
2. `packages/contracts/src/api/` にDomain API契約を定義
3. `packages/db/prisma/schema.prisma` にPrismaモデルを定義
4. Domain API → BFF → UIの順で実装

#### UI開発パターン
- **ファイル構成**:
  ```
  features/<context>/<feature>/
  ├── api/
  │   ├── BffClient.ts (interface re-export)
  │   ├── MockBffClient.ts (開発用)
  │   └── HttpBffClient.ts (本番用)
  ├── ui/
  │   ├── XxxPage.tsx (メインページ)
  │   ├── XxxTable.tsx (テーブル)
  │   ├── XxxDialog.tsx (モーダル)
  │   └── ...
  ├── types/index.ts (contracts re-export)
  └── lib/error-messages.ts
  ```
- **状態管理**: useState/useEffect（TanStack Query未使用）
- **通知**: useToast()
- **権限**: permissions state（現在はハードコード）

#### 命名規則
- **DTO**: camelCase（例: `planCode`, `ownerEmployeeId`）
- **DB**: snake_case（例: `plan_code`, `owner_employee_id`）
- **ファイル名**: kebab-case（例: `action-plan-core`）
- **コンポーネント**: PascalCase（例: `ActionPlanListPage`）

---

## 2. 要件実現性分析（Requirements Feasibility Analysis）

### 2.1 要件ごとの技術的ニーズ

| 要件ID | 主要技術的ニーズ | 既存資産活用 | 新規実装 |
|--------|----------------|------------|---------|
| Req 1 | kpi_master_events CRUD、ステータス管理 | Dialog, Table | 全層実装 |
| Req 2 | 3種別KPI項目登録、参照先制約 | Dialog, Select | 全層実装、種別別UI |
| Req 3 | 階層構造表示（Level 1/2/3）、ツリーUI | Collapsible | 階層レンダリングロジック |
| Req 4 | 部門フィルタ（複数選択）、権限制御 | Checkbox | control_department_stable_ids検証 |
| Req 5 | fact_amounts参照、月次表示 | Table | Read-only display |
| Req 6 | kpi_fact_amounts CRUD、インライン編集 | Table + inline edit | 期間コード管理UI |
| Req 7 | kpi_target_values CRUD、自動計算 | Table | 指標計算ロジック |
| Req 8 | action_plans更新、kpi_master_item_id紐付け | Dialog | 既存AP機能の移行 |
| Req 9 | 論理削除、復元機能 | Dialog, Alert | is_active制御 |
| Req 10 | control_department_stable_ids権限制御 | - | RLS + UseCase検証 |
| Req 11 | tenant_id RLS、監査ログ | - | Repository/RLS設定 |

### 2.2 ギャップと制約

#### Missing Capabilities（欠落機能）
1. **データベース**: 全エンティティ未定義（5新規 + 3修正）
2. **Contracts**: bff/kpi-master 未作成
3. **Domain API**: kpi-masterモジュール全層未実装
4. **BFF**: kpi-masterモジュール全層未実装
5. **UI**: KPI管理マスタ画面、KPI一覧画面未実装

#### Unknowns（要調査事項）
1. **指標の自動計算ロジック**: metricsの計算式定義方法（Research Needed）
2. **部門階層の閲覧権限伝播**: 上位部門が下位部門を自動的に閲覧できるロジック（Research Needed）
3. **期間コードの自由入力検証**: UI/UXベストプラクティス（Research Needed）
4. **パネル開閉式UIのパフォーマンス**: 大量KPI項目での描画性能（Research Needed）

#### Constraints（制約）
1. **既存action-plan機能との互換性**: `subjectId` → `kpi_master_item_id`への移行が必要
2. **Prisma制約の実装限界**: CHECK制約はPrisma 5.xで限定的サポート（マイグレーションSQLで直接記述必要）
3. **UI状態管理**: TanStack Query未導入のため、useState/useEffectでの手動管理が必要

#### Complexity Signals（複雑性シグナル）
- **アルゴリズムロジック**: 指標の自動計算、階層集計
- **ワークフロー**: KPI項目のステータス管理（DRAFT/CONFIRMED）、論理削除・復元
- **外部統合**: fact_amounts（予算管理）との連携

---

## 3. 実装アプローチオプション（Implementation Approach Options）

### Option A: 既存コンポーネント拡張

**対象**: 既存action-plan-*機能の拡張

#### 拡張対象ファイル
- `/apps/web/src/features/kpi/action-plan-core/types/index.ts`
  - `BffActionPlanSummary`に`kpiMasterItemId`フィールド追加
- `/apps/web/src/features/kpi/action-plan-core/api/MockBffClient.ts`
  - KPI管理マスタ項目取得メソッド追加
- `/packages/contracts/src/bff/action-plan-core/index.ts`
  - `kpiMasterItemId?: string`フィールド追加（後方互換性維持）

#### 互換性評価
- ✅ `subjectId`を残しつつ`kpiMasterItemId`を追加可能（Nullable）
- ✅ 既存APが動作し続ける
- ❌ 新旧モデルの混在により、ビジネスロジックが複雑化

#### 複雑性・保守性
- **認知負荷**: 中〜高（新旧モデルの両対応が必要）
- **ファイルサイズ**: 影響小（フィールド追加程度）
- **単一責任原則**: やや逸脱（APが2つのKPI参照モデルを持つ）

#### Trade-offs
- ✅ 既存機能との統合が容易
- ✅ 段階的移行が可能
- ❌ 新旧モデルの混在による複雑化
- ❌ 将来的な tech debt 増加

---

### Option B: 新規コンポーネント作成

**対象**: KPI管理マスタ専用の新規Feature作成

#### 新規作成の根拠
- **明確な責務分離**: KPI管理イベント・KPI項目管理はAPとは異なる責務
- **既存の複雑性**: action-plan-*は既に完成した機能群
- **独立したライフサイクル**: KPI管理マスタは独立した業務フロー

#### 統合ポイント
- **action_plans.kpi_master_item_id**: 外部キー経由でのAP連携
- **共有Contracts**: `@epm/contracts/bff/kpi-master` 新規作成
- **共有UIコンポーネント**: Accordion, Dialog 等を活用

#### 責務境界
- **KPI管理マスタ機能**:
  - KPI管理イベントCRUD
  - KPI項目CRUD（3種別）
  - 非財務KPI目標・実績入力
  - 指標目標値管理
- **既存action-plan-*機能**:
  - APのCRUD
  - WBS/タスク管理
  - ガントチャート/カンバンボード

#### Trade-offs
- ✅ 責務分離が明確
- ✅ 既存機能への影響なし
- ✅ テスト容易性向上
- ❌ ファイル数増加（約20-30ファイル）
- ❌ 統合インターフェース設計が必要

---

### Option C: ハイブリッドアプローチ

**戦略**: 新規Feature作成 + 既存Feature連携

#### 組み合わせ戦略
1. **Phase 1**: 新規`features/kpi/kpi-master`作成
   - KPI管理イベント・KPI項目管理
   - 目標・実績入力UI
   - MockBffClient実装（動作確認）
2. **Phase 2**: 既存action-plan-*機能の連携拡張
   - `action_plans`テーブルに`kpi_master_item_id`カラム追加
   - APモーダルにKPI項目選択UIを追加
   - 既存`subjectId`ベースのAPは互換性維持
3. **Phase 3**: Domain API/BFF実装
   - Contracts → Database → API → BFF → UI統合

#### 段階的実装
- **Milestone 1**: KPI管理マスタ画面（UI-MOCK）
- **Milestone 2**: Database + Domain API実装
- **Milestone 3**: BFF実装 + UI-BFF統合
- **Milestone 4**: 既存AP機能との統合

#### リスク緩和
- **増分ロールアウト**: Feature単位でのリリース
- **Feature Flag**: 新KPI管理を段階的に有効化
- **Rollback戦略**: `subjectId`ベースのAPは継続動作

#### Trade-offs
- ✅ 段階的な価値提供
- ✅ リスク分散
- ✅ 既存機能への影響最小化
- ❌ 複数フェーズの計画・調整コスト
- ❌ 一時的な新旧モデル共存期間

---

## 4. 実装複雑性とリスク（Implementation Complexity & Risk）

### 4.1 Effort見積もり

| レイヤー | 工数 | 理由 |
|---------|------|------|
| Contracts（bff + api） | S（2日） | 既存パターン踏襲、DTO定義のみ |
| Database（Prisma + Migration） | M（4日） | 5新規エンティティ + 3修正 + RLS設定 |
| Domain API | L（8日） | UseCase/Repository全層、3種別KPI分岐ロジック |
| BFF | M（5日） | Mapper実装、API DTO → BFF DTO変換 |
| UI（KPI管理マスタ画面） | M（4日） | イベントCRUD、3種別KPI登録モーダル |
| UI（KPI一覧画面） | L（8日） | パネル開閉、インライン編集、階層表示 |
| 既存AP機能連携 | M（4日） | kpi_master_item_id追加、モーダルUI拡張 |
| Testing & Integration | M（5日） | E2E、統合テスト |
| **合計** | **XL（40日）** | フル機能実装の場合 |

### 4.2 Risk評価

| リスク要因 | レベル | 詳細 |
|-----------|-------|------|
| 指標の自動計算ロジック未確定 | **High** | metrics定義から計算式を動的実行する仕組みが未設計 |
| 大量KPI項目でのパネルUI性能 | **Medium** | 仮想化やページング未導入の場合、描画が重くなる可能性 |
| 部門階層の権限伝播ロジック | **Medium** | control_department_stable_idsの伝播ルールが未明確 |
| 既存AP機能との統合 | **Medium** | 既存ユーザーへの影響、データ移行の考慮 |
| Prisma CHECK制約の限界 | **Low** | マイグレーションSQLで対応可能（技術的には既知） |
| 期間コード自由入力のUX | **Low** | プリセット選択肢で緩和可能 |

---

## 5. 推奨実装アプローチ（Recommendations for Design Phase）

### 5.1 推奨アプローチ

**Option C（ハイブリッドアプローチ）** を推奨

#### 理由
1. **段階的価値提供**: Phase 1でKPI管理マスタ単体が使える
2. **リスク分散**: 既存AP機能への影響を最小化しつつ、新機能を独立開発
3. **技術的負債の回避**: 新旧モデル混在を短期間に限定
4. **開発効率**: UI-MOCKで早期に動作確認、仕様フィードバック獲得

### 5.2 Phase 1 実装範囲（優先）

#### MVP（Minimum Viable Product）
- **KPI管理イベントCRUD**（Req 1）
- **KPI項目登録（3種別）**（Req 2）
- **KPI一覧画面（階層表示）**（Req 3）
- **部門フィルタ（複数選択）**（Req 4）
- **非財務KPI目標・実績入力**（Req 6 - 簡易版）
- **MockBffClient実装**（動作確認用）

#### Phase 1で除外（Phase 2へ延期）
- 財務科目KPI予実表示（Req 5）- fact_amounts連携が必要
- 指標KPI自動計算（Req 7）- metrics計算ロジック未確定
- アクションプラン連携（Req 8）- 既存AP機能修正が必要
- 論理削除・復元（Req 9）- 運用安定後に実装
- 権限制御（Req 10）- RLS設定が必要

### 5.3 設計フェーズで決定すべき重要事項

#### 1. 指標の自動計算ロジック（High Priority）
- **課題**: metricsの計算式をどのように定義・実行するか
- **選択肢**:
  - A: 計算式をDSL（文字列）で保存し、ランタイム評価
  - B: TypeScriptで計算関数を定義し、metrics_idでルーティング
  - C: SQLビューで計算（Prisma経由で参照）
- **Research Needed**: パフォーマンス、保守性、拡張性のトレードオフ評価

#### 2. パネル開閉式UIのパフォーマンス最適化（Medium Priority）
- **課題**: 1000件のKPI項目を階層表示した場合のレンダリング性能
- **選択肢**:
  - A: すべてレンダリング（シンプル、1000件まで許容範囲）
  - B: 仮想化リスト（react-window等）導入
  - C: サーバー側ページング（階層表示との相性を検証）
- **Research Needed**: 実際のデータ量での性能測定

#### 3. 部門階層の権限伝播ロジック（Medium Priority）
- **課題**: 上位部門が下位部門のKPIを自動的に閲覧できるか
- **選択肢**:
  - A: control_department_stable_idsに下位部門IDを明示的に登録
  - B: UseCase層で階層をトラバースして自動伝播
  - C: DBビューで権限解決
- **Research Needed**: 組織マスタの階層構造定義方法を確認

#### 4. 期間コードの入力体験（Low Priority）
- **課題**: 自由入力とプリセット選択のバランス
- **推奨**: プリセット選択（Q1/Q2/04月/05月等）+ フリー入力の併用
- **Research Needed**: ユーザビリティテスト

#### 5. 既存action-plan機能の移行戦略（Medium Priority）
- **課題**: 既存APデータを新モデルにどう移行するか
- **選択肢**:
  - A: 既存APはそのまま、新規APのみkpi_master_item_id使用
  - B: マイグレーションスクリプトで既存APを自動変換
  - C: UIで手動紐付け機能を提供
- **Research Needed**: 既存APデータ量、業務影響の確認

---

## 6. 要件-資産マッピング（Requirement-to-Asset Map）

| 要件ID | 必要資産 | 既存資産 | Gap | タグ |
|--------|---------|---------|-----|-----|
| Req 1 | kpi_master_events CRUD | Dialog, Table | DB, API, BFF, UI全層 | **Missing** |
| Req 2 | 3種別KPI登録 | Dialog, Select | 種別別UI、制約検証 | **Missing** |
| Req 3 | 階層表示UI | Collapsible | 階層レンダリングロジック | **Constraint** |
| Req 4 | 部門フィルタ | Checkbox | control_department_stable_ids取得 | **Missing** |
| Req 5 | fact_amounts参照 | - | fact_amounts連携API | **Unknown** |
| Req 6 | kpi_fact_amounts CRUD | Table | インライン編集UI | **Missing** |
| Req 7 | 指標自動計算 | - | metrics計算ロジック | **Unknown** |
| Req 8 | AP連携 | action-plan-*機能 | kpi_master_item_id追加 | **Constraint** |
| Req 9 | 論理削除・復元 | Dialog | is_active制御 | **Missing** |
| Req 10 | 権限制御 | - | RLS設定、権限検証 | **Missing** |
| Req 11 | 監査ログ | - | audit_logs実装 | **Missing** |

---

## 7. 実装ロードマップ（Implementation Roadmap）

### Phase 1: MVP（4-5週間）
1. **Week 1**: Contracts + Database
   - bff/kpi-master契約定義
   - Prismaモデル定義（5新規エンティティ）
   - マイグレーションSQL（CHECK制約含む）
2. **Week 2**: UI-MOCK
   - KPI管理マスタ画面（MockBffClient）
   - KPI一覧画面（MockBffClient）
   - パネル開閉、階層表示
3. **Week 3**: Domain API
   - UseCase/Repository実装
   - 3種別KPI分岐ロジック
   - 単体テスト
4. **Week 4**: BFF + UI統合
   - BFF実装（Mapper）
   - HttpBffClient実装
   - UI-BFF統合テスト
5. **Week 5**: 統合テスト & リファインメント
   - E2Eテスト
   - UI/UX調整
   - ドキュメント整備

### Phase 2: 完全機能（2-3週間）
1. fact_amounts連携（Req 5）
2. 指標自動計算（Req 7）
3. AP連携（Req 8）
4. 論理削除・復元（Req 9）
5. 権限制御・RLS（Req 10-11）

---

## 8. 結論（Conclusions）

### 8.1 実現可能性

**結論**: KPI管理マスタ機能は実現可能。既存アーキテクチャパターンに沿った実装が可能。

### 8.2 主要な課題

1. **指標の自動計算ロジック**（High Risk）: 設計フェーズで方式決定必須
2. **既存AP機能との統合**（Medium Risk）: 段階的移行戦略で緩和可能
3. **部門階層の権限伝播**（Medium Risk）: 組織マスタ仕様確認が必要

### 8.3 Next Steps

1. **設計フェーズへ進む**: `/kiro:spec-design kpi/kpi-master`
2. **設計で決定すべき事項**:
   - 指標自動計算の実装方式
   - パフォーマンス最適化戦略
   - 部門権限伝播ロジック
   - 既存AP機能の移行計画
3. **Research Items**:
   - metricsマスタの計算式定義方法を確認
   - 組織マスタの階層構造仕様を確認
   - fact_amountsの参照API仕様を確認

---

## Appendix: 参照ファイル

### 既存実装（参考）
- `/apps/web/src/features/kpi/action-plan-core/` - APのCRUDパターン
- `/apps/web/src/features/kpi/action-plan-dashboard/` - KPIダッシュボード（旧仕様）
- `/apps/web/src/features/master-data/organization-master/` - 階層表示パターン
- `/packages/contracts/src/bff/action-plan-core/index.ts` - BFF契約パターン

### 仕様ドキュメント
- `.kiro/specs/仕様概要/KPI管理マスタ機能仕様_確定版.md`
- `.kiro/specs/entities/02_KPI管理マスタ.md`
- `.kiro/specs/kpi/kpi-master/requirements.md`

### アーキテクチャ
- `.kiro/steering/tech.md` - 技術憲法
- `.kiro/steering/structure.md` - 構造定義
- `.kiro/steering/product.md` - プロダクト方針

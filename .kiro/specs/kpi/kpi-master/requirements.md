# Requirements Document

## Introduction

KPI管理マスタ機能は、年度単位でKPI管理項目を登録・運用し、目標達成に向けたモニタリングとアクションプラン管理を実現するEPM SaaSの中核機能です。

本機能により、財務科目・非財務KPI・経営指標を統合的に管理し、経営判断に必要なKPI進捗・差異・打ち手を構造化された形で提供します。

---

## 改訂履歴

| 日付 | 変更内容 |
|------|---------|
| 2026-01-25 | 初版作成（壁打ち検討結果を反映） |
| 2026-01-26 | 画面設計をベスト設計（2画面統合型 + サマリカード + スマート動線）に更新 |

---

## Spec Reference（INPUT情報）

本要件を作成するにあたり、以下の情報を確認した：

### 仕様概要（確定済み仕様）
- **参照ファイル**: `.kiro/specs/仕様概要/KPI管理マスタ機能仕様_確定版.md`
- **確認日**: 2026-01-26
- **主要な仕様ポイント**:
  - 年度単位のKPI管理イベントを作成し、DRAFT/CONFIRMEDのステータス管理を行う
  - KPI項目は3種類（財務科目・非財務KPI・指標）から選択し、階層構造（KGI→KPI→AP）で管理する
  - KPI一覧画面はパネル開閉式UIで予実閲覧・入力・アクションプラン管理を行う
  - 部門別閲覧権限により、コントロール部門に基づく権限制御を実現する

### 画面設計改善（2026-01-26決定）
- **設計方針**: 2画面統合型 + サマリカード + スマート動線
- **改善ポイント**:
  - KPI一覧をメイン画面とし、ダッシュボード機能を統合
  - サマリカード（全KPI数、達成率、遅延AP、要対応）で全体把握を支援
  - AP行に[WBS][かんばん]ボタンを直接配置し、動線を明確化
  - KPIマスタ設定は管理者向け画面として分離

### エンティティ定義（Data Model 正本）
- **参照ファイル**: `.kiro/specs/仕様概要/KPI管理_エンティティ変更サマリ.md`
- **対象エンティティ**: kpi_master_events, kpi_master_items, kpi_definitions, kpi_fact_amounts, kpi_target_values, subjects（変更）, metrics（変更）, action_plans（変更）

---

## INPUT整合性チェック

| チェック項目 | 確認結果 |
|-------------|---------|
| 仕様概要との整合性 | 要件が仕様概要の内容と矛盾しない: ✅ |
| エンティティとの整合性 | 要件がエンティティ定義と矛盾しない: ✅ |
| 画面設計との整合性 | ベスト設計の内容を反映: ✅ |

---

## 画面構成（2画面統合型）

### 画面一覧

```
KPI管理
├── /kpi/list      KPI一覧（メイン画面）
│   └─ ダッシュボード + 階層ツリー + AP管理を統合
│
└── /kpi/master    KPIマスタ設定（管理者向け）
    └─ イベント作成・KPI項目登録
```

### 画面別ユーザーストーリー

| 画面 | 主要ユーザー | 目的 | 頻度 |
|------|-------------|------|------|
| KPI一覧 | 経営層・管理職・担当者 | KPI達成状況確認、予実入力、AP管理 | 日次/週次 |
| KPIマスタ設定 | 経営企画担当者 | 年度イベント作成、KPI項目登録 | 年次/四半期 |

---

## Requirements

### Requirement 1: KPI一覧画面のサマリ表示

**Objective:** 経営層・管理職として、KPI全体の達成状況をひと目で把握したい。サマリカードにより、全体像と注目すべき項目を迅速に認識できる。

#### Acceptance Criteria

1. When ユーザーがKPI一覧画面にアクセスした場合、the KPI Management System shall サマリカード（4枚）を画面上部に表示する
2. The サマリカード shall 以下の情報を含む:
   - 全KPI件数（閲覧可能なKPI項目の総数）
   - 全体達成率（全KPIの加重平均達成率）
   - 遅延AP件数（期限超過のアクションプラン数）
   - 要対応件数（達成率80%未満のKPI数）
3. When サマリカードをクリックした場合、the KPI Management System shall 該当するKPI項目をフィルタリングして表示する（オプション、Phase 2）

---

### Requirement 2: KPI階層ツリーの表示

**Objective:** 担当者として、KGI→KPI→APの階層構造を視覚的に把握し、目標達成に必要な施策の紐付きを理解したい。

#### Acceptance Criteria

1. When ユーザーがKPI一覧画面にアクセスした場合、the KPI Management System shall KPI項目を階層ツリー形式で表示する
2. The 階層構造 shall 以下のレベルで構成する:
   - Level 1（KGI）: 全社レベルの重要目標指標
   - Level 2（KPI）: 事業部レベルの重要業績指標
   - Level 3（AP）: アクションプラン（action_plansテーブルから取得）
3. When ユーザーがツリーノードの展開/折りたたみボタンをクリックした場合、the KPI Management System shall 子要素の表示/非表示を切り替える
4. The 各KPI行 shall 以下の情報を表示する:
   - KPI名
   - KPI種別（財務/非財務/指標）バッジ
   - 責任部門
   - 達成率（色分け: 100%以上=緑、80-99%=黄、80%未満=赤）
5. The 各AP行 shall 以下の情報を表示する:
   - プラン名
   - 担当部門
   - 期限
   - 進捗率
   - **[WBS]ボタン**（クリックでWBS画面へ遷移）
   - **[かんばん]ボタン**（クリックでかんばん画面へ遷移）

---

### Requirement 3: APからWBS/かんばんへの直接動線

**Objective:** 担当者として、アクションプランの詳細管理（WBS/かんばん）へ迅速にアクセスしたい。動線を明確にすることで、日常業務の効率を向上させる。

#### Acceptance Criteria

1. When ユーザーがAP行の[WBS]ボタンをクリックした場合、the KPI Management System shall `/kpi/wbs/{actionPlanId}` に遷移する
2. When ユーザーがAP行の[かんばん]ボタンをクリックした場合、the KPI Management System shall `/kpi/kanban/{actionPlanId}` に遷移する
3. The [WBS]と[かんばん]ボタン shall AP行内に直接配置し、パネルを開かなくても操作可能とする
4. The ボタン shall `variant="outline"` + アイコン（GanttChart / KanbanSquare）で表示し、視認性を確保する

---

### Requirement 4: KPIパネル展開による詳細表示

**Objective:** 担当者として、特定のKPI項目の詳細（予実データ、アクションプラン一覧）を確認・編集したい。

#### Acceptance Criteria

1. When ユーザーがKPI行をクリックした場合、the KPI Management System shall パネルを展開して詳細情報を表示する
2. The パネル展開時 shall 以下の情報を表示する:
   - 責任部門・責任者
   - 単位
   - 【目標・実績】テーブル（期間別）
   - 【アクションプラン】リスト
3. When KPI種別が非財務KPIの場合、the KPI Management System shall 目標・実績セルをインライン編集可能とする
4. When KPI種別が財務科目の場合、the KPI Management System shall 予実データを表示のみとし、編集不可とする（予算管理画面へのリンクを提供）
5. When KPI種別が指標の場合、the KPI Management System shall 目標値のみ編集可能とし、実績は自動計算結果を表示する

---

### Requirement 5: KPI管理イベントの作成・管理

**Objective:** 経営企画担当者として、年度単位でKPI管理の枠組みを作成・管理したい。年度開始前や途中でもKPI管理イベントを設定できることで、柔軟な経営管理を実現する。

#### Acceptance Criteria

1. When 経営企画担当者がKPIマスタ設定画面で[新規イベント]ボタンをクリックした場合、the KPI Management System shall イベント作成モーダルを表示する
2. The イベント作成モーダル shall 以下の入力項目を含む:
   - イベントコード（必須、50文字以内）
   - イベント名（必須、200文字以内）
   - 対象年度（必須、数値）
3. When 経営企画担当者がイベントを作成した場合、the KPI Management System shall DRAFTステータスで作成する
4. When KPI管理イベントがDRAFTステータスの場合、the KPI Management System shall KPI項目の追加・編集・削除を許可する
5. When 経営企画担当者がイベントの[確定]ボタンをクリックした場合、the KPI Management System shall ステータスをCONFIRMEDに変更し、KPI項目の削除を禁止する（追加・編集は可能）
6. The KPI Management System shall 同一会社内で同じイベントコードの重複を禁止する

---

### Requirement 6: KPI項目の登録（財務科目・非財務・指標）

**Objective:** 経営企画担当者として、財務科目・非財務KPI・経営指標の3種類からKPI項目を登録したい。KPI種別に応じた適切な参照元を設定することで、統合的なKPI管理を実現する。

#### Acceptance Criteria

1. When 経営企画担当者がKPIマスタ設定画面で[KPI項目追加]ボタンをクリックした場合、the KPI Management System shall KPI項目作成モーダルを表示する
2. The KPI項目作成モーダル shall 以下の入力項目を含む:
   - KPIコード（必須、50文字以内）
   - KPI名（必須、200文字以内）
   - KPI種別（必須、財務科目/非財務KPI/指標から選択）
   - 階層レベル（必須、Level 1: KGI / Level 2: KPI）
   - 親KPI項目（Level 2の場合のみ、Level 1から選択）
   - 参照先（種別に応じて表示、必須）
   - 責任部門（任意）
   - 責任者（任意）
3. When 経営企画担当者が財務科目を選択した場合、the KPI Management System shall kpi_managed=trueの科目のみを選択肢として表示する
4. When 経営企画担当者が非財務KPIを選択した場合、the KPI Management System shall kpi_definitions一覧を表示する
5. When 経営企画担当者が指標を選択した場合、the KPI Management System shall kpi_managed=trueの指標のみを選択肢として表示する
6. If KPI項目のKPI種別が既に登録されている場合、the KPI Management System shall 種別の変更と参照元IDの変更を禁止する

---

### Requirement 7: 非財務KPIの目標・実績入力（インライン編集）

**Objective:** 各部門の担当者として、非財務KPI（CO2削減率、新規顧客訪問数等）の目標と実績を期間ごとに入力・管理したい。インライン編集により、迅速なKPI更新を実現する。

#### Acceptance Criteria

1. When 担当者が非財務KPIのパネルを開いた場合、the KPI Management System shall kpi_fact_amountsから期間別の目標値と実績値を取得して表示する
2. When 担当者が非財務KPIの目標または実績セルをクリックした場合、the KPI Management System shall インライン編集モードに切り替える
3. When 担当者が値を入力して保存ボタンをクリックした場合、the KPI Management System shall kpi_fact_amountsに値を保存する
4. When 担当者が[期間追加]ボタンをクリックした場合、the KPI Management System shall 期間追加モーダルを表示する
5. The 期間追加モーダル shall 以下の入力項目を含む:
   - 期間コード（必須、32文字以内、自由入力）
   - 開始日（任意）
   - 終了日（任意）
   - 目標値（任意）
   - 実績値（任意）
6. The KPI Management System shall 期間コードの推奨フォーマット（2026-Q1、2026-04等）をプリセット選択肢として提供する
7. The KPI Management System shall 達成率を（実績/目標×100）で自動計算して表示する

---

### Requirement 8: アクションプランの追加

**Objective:** 各部門の担当者として、KPI達成のための具体的なアクションプランを登録したい。モーダル形式により、画面遷移なしで迅速に登録できる。

#### Acceptance Criteria

1. When 担当者がKPIパネル内の[AP追加]ボタンをクリックした場合、the KPI Management System shall アクションプラン追加モーダルを表示する（画面遷移なし）
2. The アクションプラン追加モーダル shall 以下の入力項目を含む:
   - プラン名（必須、200文字以内）
   - 担当部門（任意）
   - 担当者（任意）
   - 期限（任意）
3. When 担当者が[登録]ボタンをクリックした場合、the KPI Management System shall action_plansテーブルに新しいアクションプランを登録し、kpi_master_item_idでKPI項目に紐付ける
4. When アクションプランが登録された場合、the KPI Management System shall KPI一覧の該当KPI配下にAPを即座に表示する

---

### Requirement 9: 部門フィルタ（複数選択）

**Objective:** 担当者として、閲覧可能なKPI項目を部門でフィルタリングしたい。複数選択により、関心のある部門のKPIに絞り込める。

#### Acceptance Criteria

1. When ユーザーがKPI一覧画面にアクセスした場合、the KPI Management System shall 部門フィルタ（チェックボックス形式）を表示する
2. When ユーザーがKPI一覧画面を初回表示する場合、the KPI Management System shall デフォルトで閲覧可能なすべての部門をチェック済みで表示する
3. When ユーザーが部門フィルタでチェックボックスを選択/解除した場合、the KPI Management System shall 選択された部門のKPI項目のみを表示する
4. The 部門フィルタ shall ユーザーの control_department_stable_ids に基づき閲覧可能な部門のみを選択肢として表示する

---

### Requirement 10: 部門別閲覧権限制御

**Objective:** システム管理者として、部門ごとに適切な閲覧権限を設定したい。コントロール部門に基づく権限制御により、情報セキュリティと部門自律性を両立する。

#### Acceptance Criteria

1. The KPI Management System shall 社員マスタのcontrol_department_stable_idsに基づき、ユーザーが閲覧可能な部門を決定する
2. When KPI項目のdepartment_stable_idがNULLの場合（全社KPI）、the KPI Management System shall すべてのユーザーに対して閲覧可能とする
3. When ユーザーがepm.kpi.admin権限を持つ場合、the KPI Management System shall 全社のKPI項目を閲覧・編集可能とする
4. When ユーザーがepm.kpi.write権限を持つ場合、the KPI Management System shall 閲覧可能なKPI項目を編集可能とする
5. When ユーザーがepm.kpi.read権限のみを持つ場合、the KPI Management System shall 閲覧可能なKPI項目を閲覧のみ可能とする

---

### Requirement 11: マルチテナント・監査ログ

**Objective:** システム管理者として、すべてのKPI管理操作をテナント隔離された状態で実行し、監査ログを記録したい。

#### Acceptance Criteria

1. The KPI Management System shall すべてのKPI管理エンティティ（kpi_master_events、kpi_master_items、kpi_definitions、kpi_fact_amounts、kpi_target_values）にtenant_idを保持する
2. The KPI Management System shall すべてのDBアクセスでRow Level Security（RLS）を有効化し、tenant_id境界を強制する
3. The KPI Management System shall KPI管理イベントの作成・確定操作を監査ログに記録する
4. The KPI Management System shall KPI項目の登録・変更・削除操作を監査ログに記録する
5. The KPI Management System shall 非財務KPIの目標・実績入力操作を監査ログに記録する

---

## Out of Scope

以下は本機能のスコープ外とし、Phase 2以降または別機能で対応する：

### Phase 2機能
- サマリカードクリックによるフィルタリング
- 前年度からのKPI項目コピー機能
- KPI階層の自動積み上げ集計
- ダッシュボードカスタマイズ
- KPIレポート出力機能（PDF/Excel）
- 部門階層の自動権限伝播（階層トラバース）

### 別機能で対応
- WBS項目の詳細管理（ガントチャート画面で実装）
- カンバンボードのタスク管理（カンバンボード画面で実装）
- 予算・実績データの入力（予算管理機能で実装）
- 指標の実績値自動計算（指標マスタ機能で実装）

---

## Non-Functional Requirements

### Performance
- KPI一覧画面の初期表示（サマリ + ツリー）は3秒以内
- 非財務KPIの目標・実績入力（保存）は1秒以内
- アクションプラン登録（モーダル送信）は2秒以内
- 1000件のKPI項目を階層表示可能

### Security
- Row Level Security（RLS）による厳密なテナント隔離
- 部門別閲覧権限の強制（control_department_stable_ids）
- 権限チェックはUI/BFF/APIで一貫
- 監査ログによる操作追跡

### Usability
- サマリカードによる全体把握の即時性
- パネル開閉式UIによる情報の段階的開示
- AP行への[WBS][かんばん]ボタン直接配置による動線明確化
- インライン編集による迅速な入力
- モーダルによる画面遷移なしのAP登録

### Maintainability
- Contracts-first設計による境界の明確化
- 2画面構成によるシンプルな画面設計
- EARS形式による要件の明確化
- 仕様駆動開発（CCSDD）による一貫性

---

## Glossary

| 用語 | 定義 |
|------|------|
| KGI | Key Goal Indicator - 全社レベルの重要目標指標（Level 1） |
| KPI | Key Performance Indicator - 事業部レベルの重要業績指標（Level 2） |
| アクションプラン（AP） | KPI達成のための具体的施策（Level 3） |
| 財務科目KPI | 科目マスタ（subjects）から参照するKPI項目（kpi_managed=true） |
| 非財務KPI | KPI定義マスタ（kpi_definitions）で定義される非財務指標 |
| 指標KPI | 指標マスタ（metrics）から参照する計算指標（kpi_managed=true） |
| コントロール部門 | 社員マスタで定義される閲覧権限の基準部門（control_department_stable_ids） |
| DRAFT | KPI管理イベントの編集可能ステータス |
| CONFIRMED | KPI管理イベントの確定ステータス（削除禁止、追加・編集は可能） |
| サマリカード | KPI一覧画面上部に表示する統計情報カード |

---

## Traceability Matrix

| 要件ID | 画面 | 主要機能 | エンティティ |
|--------|------|---------|-------------|
| Req 1 | KPI一覧 | サマリ表示 | kpi_master_items, action_plans |
| Req 2 | KPI一覧 | 階層ツリー | kpi_master_items, action_plans |
| Req 3 | KPI一覧 | WBS/かんばん動線 | action_plans |
| Req 4 | KPI一覧 | パネル展開 | kpi_master_items, kpi_fact_amounts, kpi_target_values |
| Req 5 | KPIマスタ設定 | イベント管理 | kpi_master_events |
| Req 6 | KPIマスタ設定 | KPI項目登録 | kpi_master_items, subjects, metrics, kpi_definitions |
| Req 7 | KPI一覧（パネル） | 非財務KPI予実入力 | kpi_fact_amounts |
| Req 8 | KPI一覧（パネル） | AP追加 | action_plans |
| Req 9 | KPI一覧 | 部門フィルタ | employees.control_department_stable_ids |
| Req 10 | 全画面 | 権限制御 | employees.control_department_stable_ids |
| Req 11 | 全機能 | 監査ログ | 全エンティティ.tenant_id |

---

## References

- **機能仕様**: `.kiro/specs/仕様概要/KPI管理マスタ機能仕様_確定版.md`
- **エンティティ定義**: `.kiro/specs/仕様概要/KPI管理_エンティティ変更サマリ.md`
- **仕様検討記録**: `.kiro/specs/仕様検討/20260125_KPI管理マスタ仕様検討.md`
- **技術憲法**: `.kiro/steering/tech.md`
- **プロダクト方針**: `.kiro/steering/product.md`
- **構造定義**: `.kiro/steering/structure.md`

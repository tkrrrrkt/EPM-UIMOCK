# Requirements Document

## Introduction

KPI管理マスタ機能は、年度単位でKPI管理項目を登録・運用し、目標達成に向けたモニタリングとアクションプラン管理を実現するEPM SaaSの中核機能です。

本機能により、財務科目・非財務KPI・経営指標を統合的に管理し、経営判断に必要なKPI進捗・差異・打ち手を構造化された形で提供します。

---

## Spec Reference（INPUT情報）

本要件を作成するにあたり、以下の情報を確認した：

### 仕様概要（確定済み仕様）
- **参照ファイル**: `.kiro/specs/仕様概要/KPI管理マスタ機能仕様_確定版.md`
- **確認日**: 2026-01-25
- **主要な仕様ポイント**:
  - 年度単位のKPI管理イベントを作成し、DRAFT/CONFIRMEDのステータス管理を行う
  - KPI項目は3種類（財務科目・非財務KPI・指標）から選択し、階層構造（KGI→KPI→AP）で管理する
  - KPI一覧画面はパネル開閉式UIで予実閲覧・入力・アクションプラン管理を行う
  - 部門別閲覧権限により、コントロール部門に基づく権限制御を実現する

### 仕様検討（経緯・背景）※参考
- **参照ファイル**: `.kiro/specs/仕様検討/20260125_KPI管理マスタ仕様検討.md`
- **経緯メモ**: 壁打ち検討により、Level 3（アクションプラン）はaction_plansテーブルで管理、指標の目標値は期間別管理、非財務KPIはインライン編集、部門フィルタは複数選択など、12項目のQ&Aを通じて仕様を確定

---

## Entity Reference（必須）

本機能で使用するエンティティ定義を `.kiro/specs/entities/*.md` から確認し、以下を記載する：

### 対象エンティティ
- **kpi_master_events**: `.kiro/specs/entities/02_KPI管理マスタ.md` セクション1
- **kpi_master_items**: `.kiro/specs/entities/02_KPI管理マスタ.md` セクション2
- **kpi_definitions**: `.kiro/specs/entities/02_KPI管理マスタ.md` セクション3
- **kpi_fact_amounts**: `.kiro/specs/entities/02_KPI管理マスタ.md` セクション4
- **kpi_target_values**: `.kiro/specs/entities/02_KPI管理マスタ.md` セクション5
- **subjects（既存）**: `.kiro/specs/entities/02_KPI管理マスタ.md` セクション6.1 - kpi_managedフラグ追加
- **metrics（既存）**: `.kiro/specs/entities/02_KPI管理マスタ.md` セクション6.2 - kpi_managedフラグ追加
- **action_plans（既存）**: `.kiro/specs/entities/02_KPI管理マスタ.md` セクション6.3 - kpi_master_item_id追加

### エンティティ整合性確認
- [x] 対象エンティティのカラム・型・制約を確認した
- [x] エンティティ補足のビジネスルールを要件に反映した
- [x] スコープ外の関連エンティティを Out of Scope に明記した

---

## INPUT整合性チェック

| チェック項目 | 確認結果 |
|-------------|---------|
| 仕様概要との整合性 | 要件が仕様概要の内容と矛盾しない: ✅ |
| エンティティとの整合性 | 要件がエンティティ定義と矛盾しない: ✅ |
| 仕様検討の背景理解 | 必要に応じて経緯を確認した: ✅ |

---

## Requirements

### Requirement 1: KPI管理イベントの作成・管理

**Objective:** 経営企画担当者として、年度単位でKPI管理の枠組みを作成・管理したい。年度開始前や途中でもKPI管理イベントを設定できることで、柔軟な経営管理を実現する。

#### Acceptance Criteria

1. When 経営企画担当者がKPI管理マスタ画面で年度とイベント名を入力して作成ボタンをクリックした場合、the KPI Management System shall 新しいKPI管理イベントをDRAFTステータスで作成する
2. When KPI管理イベントがDRAFTステータスの場合、the KPI Management System shall KPI項目の追加・編集・削除を許可する
3. When 経営企画担当者がKPI管理イベントの確定ボタンをクリックした場合、the KPI Management System shall イベントのステータスをCONFIRMEDに変更し、KPI項目の削除を禁止する（追加・編集は可能）
4. The KPI Management System shall 同一会社内で同じイベントコードの重複を禁止する
5. The KPI Management System shall KPI管理イベントを年度開始前でも作成可能とする
6. The KPI Management System shall KPI管理イベントを年度途中でも作成・変更可能とする

---

### Requirement 2: KPI項目の登録（財務科目・非財務・指標）

**Objective:** 経営企画担当者として、財務科目・非財務KPI・経営指標の3種類からKPI項目を登録したい。KPI種別に応じた適切な参照元を設定することで、統合的なKPI管理を実現する。

#### Acceptance Criteria

1. When 経営企画担当者がKPI項目追加ボタンをクリックした場合、the KPI Management System shall KPI種別（財務科目/非財務KPI/指標）の選択モーダルを表示する
2. When 経営企画担当者が財務科目を選択した場合、the KPI Management System shall kpi_managed=trueの科目のみを選択肢として表示する
3. When 経営企画担当者が非財務KPIを選択した場合、the KPI Management System shall kpi_definitions一覧を表示し、または新規作成を可能とする
4. When 経営企画担当者が指標を選択した場合、the KPI Management System shall kpi_managed=trueの指標のみを選択肢として表示する
5. The KPI Management System shall KPI項目にKPIコード・KPI名・階層レベル（1:KGI/2:KPI）・責任部門・責任者を設定可能とする
6. The KPI Management System shall 登録されたKPI項目に対し、KPI種別に応じた適切な参照ID（ref_subject_id/ref_kpi_definition_id/ref_metric_id）を1つのみ設定する
7. If KPI項目のKPI種別が既に登録されている場合、the KPI Management System shall 種別の変更と参照元IDの変更を禁止する

---

### Requirement 3: KPI階層構造の管理

**Objective:** 経営企画担当者として、KGI（全社レベル）→KPI（事業部レベル）→アクションプラン（部課レベル）の3階層でKPIを管理したい。階層的な目標設定により、全社目標から現場施策への一貫した展開を実現する。

#### Acceptance Criteria

1. When 経営企画担当者がKPI項目を登録する際にLevel 1（KGI）を選択した場合、the KPI Management System shall 親KPI項目なしで全社レベルのKPIとして登録する
2. When 経営企画担当者がKPI項目を登録する際にLevel 2（KPI）を選択した場合、the KPI Management System shall 親KPI項目（Level 1）を選択可能とする
3. The KPI Management System shall Level 1とLevel 2のKPI項目をkpi_master_itemsテーブルで管理する
4. The KPI Management System shall Level 3（アクションプラン）をaction_plansテーブルで管理し、kpi_master_item_idでKPI項目に紐付ける
5. When KPI一覧画面を表示する場合、the KPI Management System shall Level 1→Level 2→Level 3の階層構造をツリー表示する

---

### Requirement 4: KPI一覧画面の表示・フィルタリング

**Objective:** 各部門の担当者として、自分が閲覧可能なKPI項目を階層表示で確認し、必要に応じて部門でフィルタリングしたい。権限に基づく適切な情報提供により、部門別のKPI管理を実現する。

#### Acceptance Criteria

1. When 担当者がKPI一覧画面にアクセスした場合、the KPI Management System shall 社員マスタのcontrol_department_stable_idsに基づき閲覧可能なKPI項目を表示する
2. When 全社KPI（department_stable_id=NULL）が存在する場合、the KPI Management System shall すべてのユーザーに対して閲覧可能とする
3. When 担当者がKPI一覧画面を初回表示する場合、the KPI Management System shall デフォルトで閲覧可能なすべての部門をチェック済みで表示する
4. When 担当者が部門フィルタでチェックボックスを選択/解除した場合、the KPI Management System shall 選択された部門のKPI項目のみを表示する
5. The KPI Management System shall 部門フィルタは複数選択（チェックボックス）方式とする

---

### Requirement 5: 財務科目KPIの予実表示

**Objective:** 経営管理担当者として、財務科目KPIの予算・見込・実績を月次で確認したい。承認済み予算と最新実績を表示することで、財務目標の達成状況を正確に把握する。

#### Acceptance Criteria

1. When 担当者が財務科目KPIのパネルを開いた場合、the KPI Management System shall fact_amountsから最新の承認済み予算（APPROVED or FIXED）を取得して表示する
2. When 担当者が財務科目KPIのパネルを開いた場合、the KPI Management System shall fact_amountsから最新の見込を取得して表示する
3. When 担当者が財務科目KPIのパネルを開いた場合、the KPI Management System shall fact_amountsから最新の実績を取得して表示する
4. The KPI Management System shall 財務科目KPIの期間は会計年度の月次（accounting_periods）とする
5. The KPI Management System shall 財務科目KPIの予実は表示のみとし、入力は予算管理画面へのリンクを提供する
6. The KPI Management System shall 財務科目KPIの達成率を（実績/予算×100）で自動計算して表示する

---

### Requirement 6: 非財務KPIの目標・実績入力

**Objective:** 各部門の担当者として、非財務KPI（CO2削減率、新規顧客訪問数等）の目標と実績を期間ごとに入力・管理したい。インライン編集により、迅速なKPI更新を実現する。

#### Acceptance Criteria

1. When 担当者が非財務KPIのパネルを開いた場合、the KPI Management System shall kpi_fact_amountsから期間別の目標値と実績値を取得して表示する
2. When 担当者が非財務KPIの目標または実績セルをクリックした場合、the KPI Management System shall インライン編集モードに切り替える
3. When 担当者が目標または実績を入力して保存ボタンをクリックした場合、the KPI Management System shall kpi_fact_amountsに値を保存する
4. When 担当者が期間追加ボタンをクリックした場合、the KPI Management System shall 期間コード入力モーダルを表示し、新しい期間を追加可能とする
5. The KPI Management System shall 期間コードは最大32文字のテキスト自由入力とし、フォーマット制限を設けない
6. The KPI Management System shall 期間コードの推奨フォーマット（2026-Q1、2026-04、2026-H1、2026-ANNUAL等）をプリセット選択肢として提供する
7. The KPI Management System shall 期間開始日（period_start_date）と期間終了日（period_end_date）を任意入力項目として提供する
8. The KPI Management System shall 非財務KPIの達成率を（実績/目標×100）で自動計算して表示する
9. If 同一KPI・同一期間コード・同一部門の組み合わせが既に存在する場合、the KPI Management System shall 重複エラーを表示する

---

### Requirement 7: 指標KPIの目標値管理と実績自動計算

**Objective:** 経営企画担当者として、経営指標（営業利益率等）の期間別目標値を設定し、実績を構成要素から自動計算したい。自動計算により、手入力ミスを防止し、信頼性の高いKPI管理を実現する。

#### Acceptance Criteria

1. When 担当者が指標KPIのパネルを開いた場合、the KPI Management System shall kpi_target_valuesから期間別の目標値を取得して表示する
2. When 担当者が指標KPIのパネルを開いた場合、the KPI Management System shall 指標の構成要素（metricsの定義に基づく）から実績値を自動計算して表示する
3. When 担当者が期間追加ボタンをクリックした場合、the KPI Management System shall 期間コード入力モーダルを表示し、目標値のみ入力可能とする（実績は自動計算）
4. The KPI Management System shall 指標KPIの達成率を（実績/目標×100）で自動計算して表示する
5. The KPI Management System shall 指標KPIの実績値は表示のみとし、編集を禁止する（構成要素が更新されたら自動再計算）
6. When 指標の構成要素が更新された場合、the KPI Management System shall 指標KPIの実績値を自動的に再計算する

---

### Requirement 8: アクションプランの登録・管理

**Objective:** 各部門の担当者として、KPI達成のための具体的なアクションプランを登録・管理したい。KPIと施策を紐付けることで、目標達成に向けた実行管理を実現する。

#### Acceptance Criteria

1. When 担当者がKPIパネル内のアクションプラン追加ボタンをクリックした場合、the KPI Management System shall アクションプラン登録モーダルを表示する（画面遷移なし）
2. When 担当者がモーダルでプラン名・担当部門・担当者・期限を入力して登録ボタンをクリックした場合、the KPI Management System shall action_plansテーブルに新しいアクションプランを登録し、kpi_master_item_idでKPI項目に紐付ける
3. When 担当者がアクションプランのWBSボタンをクリックした場合、the KPI Management System shall ガントチャート画面に遷移し、WBS項目の階層管理とスケジュール管理を可能とする
4. When 担当者がアクションプランのかんばんボタンをクリックした場合、the KPI Management System shall カンバンボード画面に遷移し、タスクのステータス管理とドラッグ&ドロップを可能とする
5. The KPI Management System shall アクションプランにプラン名・担当部門・担当者・期限・進捗率を設定可能とする
6. The KPI Management System shall KPIパネル内でアクションプランの一覧を表示する

---

### Requirement 9: KPI項目の変更・削除管理

**Objective:** 経営企画担当者として、KPI項目の情報を変更し、不要になったKPI項目を削除したい。適切な変更制限と論理削除により、データ整合性を維持する。

#### Acceptance Criteria

1. When 経営企画担当者がKPI項目のKPI名・責任者・責任部門を変更した場合、the KPI Management System shall 変更を保存する
2. If KPI項目のKPI種別または参照先IDを変更しようとした場合、the KPI Management System shall 変更を禁止し、エラーメッセージを表示する
3. When 経営企画担当者がDRAFTステータスのKPI管理イベント内のKPI項目を削除した場合、the KPI Management System shall 論理削除（is_active=false）を実行する
4. When 経営企画担当者がCONFIRMEDステータスのKPI管理イベント内のKPI項目を削除しようとした場合、the KPI Management System shall 削除を禁止する
5. When KPI項目が論理削除された場合、the KPI Management System shall 既存の予実データを保持し、閲覧可能とする
6. When KPI項目が論理削除された場合、the KPI Management System shall 紐づくアクションプランに「削除されたKPIに紐付くプラン」として警告を表示する
7. The KPI Management System shall 削除されたKPI項目の復元機能を提供する（is_active=trueに戻す）

---

### Requirement 10: 部門別閲覧権限制御

**Objective:** システム管理者として、部門ごとに適切な閲覧権限を設定したい。コントロール部門に基づく権限制御により、情報セキュリティと部門自律性を両立する。

#### Acceptance Criteria

1. The KPI Management System shall 社員マスタのcontrol_department_stable_idsに基づき、ユーザーが閲覧可能な部門を決定する
2. When ユーザーがepm.kpi.admin権限を持つ場合、the KPI Management System shall 全社のKPI項目を閲覧可能とする
3. When ユーザーがepm.kpi.write権限を持つ場合、the KPI Management System shall 所属部門のKPI項目を編集可能とする
4. When ユーザーがepm.kpi.read権限を持つ場合、the KPI Management System shall 所属部門のKPI項目を閲覧のみ可能とする
5. When 事業部KPI（Level 2）が登録されている場合、the KPI Management System shall 当該事業部・上位部門・管理部門のユーザーに閲覧権限を付与する
6. When 部・課KPI/AP（Level 3）が登録されている場合、the KPI Management System shall 当該部・課・上位部門・管理部門のユーザーに閲覧権限を付与する

---

### Requirement 11: マルチテナント・監査ログ

**Objective:** システム管理者として、すべてのKPI管理操作をテナント隔離された状態で実行し、監査ログを記録したい。マルチテナント対応と監査証跡により、SaaSとしての安全性と説明責任を担保する。

#### Acceptance Criteria

1. The KPI Management System shall すべてのKPI管理エンティティ（kpi_master_events、kpi_master_items、kpi_definitions、kpi_fact_amounts、kpi_target_values）にtenant_idを保持する
2. The KPI Management System shall すべてのDBアクセスでRow Level Security（RLS）を有効化し、tenant_id境界を強制する
3. The KPI Management System shall KPI管理イベントの作成・確定操作を監査ログに記録する（tenant_id、user_id、操作内容、実行日時を含む）
4. The KPI Management System shall KPI項目の登録・変更・削除操作を監査ログに記録する
5. The KPI Management System shall 非財務KPIの目標・実績入力操作を監査ログに記録する
6. The KPI Management System shall アクションプランの登録操作を監査ログに記録する
7. The KPI Management System shall 監査ログにcreated_by、updated_byを記録し、操作者を追跡可能とする

---

## Out of Scope

以下は本機能のスコープ外とし、Phase 2以降または別機能で対応する：

### Phase 2機能
- 前年度からのKPI項目コピー機能
- KPI階層の自動積み上げ集計
- ダッシュボードカスタマイズ
- KPIレポート出力機能（PDF/Excel）

### 別機能で対応
- WBS項目の詳細管理（ガントチャート画面で実装）
- カンバンボードのタスク管理（カンバンボード画面で実装）
- 予算・実績データの入力（予算管理機能で実装）
- 財務指標の計算ロジック管理（指標マスタ機能で実装）

### 将来検討事項
- KPIアラート機能（目標未達時の自動通知）
- KPI達成率のトレンド分析
- AI による差異要因の仮説提示
- KPI間の相関分析

---

## Non-Functional Requirements

### Performance
- KPI一覧画面の初期表示は3秒以内
- 非財務KPIの目標・実績入力（保存）は1秒以内
- アクションプラン登録（モーダル送信）は2秒以内
- 1000件のKPI項目を階層表示可能

### Security
- Row Level Security（RLS）による厳密なテナント隔離
- 部門別閲覧権限の強制（control_department_stable_ids）
- 権限チェックはUI/BFF/APIで一貫
- 監査ログによる操作追跡

### Usability
- パネル開閉式UIによる情報の段階的開示
- インライン編集による迅速な入力
- モーダルによる画面遷移なしのAP登録
- プリセット選択肢による期間コード入力支援

### Maintainability
- Contracts-first設計による境界の明確化
- エンティティ定義の厳密な制約（CHECK制約）
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

---

## Traceability Matrix

| 要件ID | 仕様概要セクション | エンティティ | 画面 |
|--------|------------------|-------------|------|
| Req 1 | 3.2 イベント管理 | kpi_master_events | KPI管理マスタ画面 |
| Req 2 | 3.2 KPI項目管理 | kpi_master_items, subjects, metrics, kpi_definitions | KPI管理マスタ画面 |
| Req 3 | 4.2 階層構造 | kpi_master_items, action_plans | KPI一覧画面 |
| Req 4 | 4.3 部門フィルタ | employees.control_department_stable_ids | KPI一覧画面 |
| Req 5 | 4.5 財務科目 | fact_amounts, subjects | KPI一覧画面（パネル） |
| Req 6 | 4.5 非財務KPI | kpi_fact_amounts, kpi_definitions | KPI一覧画面（パネル） |
| Req 7 | 4.5 指標 | kpi_target_values, metrics | KPI一覧画面（パネル） |
| Req 8 | 5. アクションプラン管理 | action_plans | KPI一覧画面（モーダル） |
| Req 9 | 7.1 KPI項目の追加・変更・削除 | kpi_master_items | KPI管理マスタ画面 |
| Req 10 | 6. 権限・閲覧制御 | employees.control_department_stable_ids | 全画面 |
| Req 11 | tech.md: マルチテナント設計 | 全エンティティ.tenant_id | 全機能 |

---

## References

- **機能仕様**: `.kiro/specs/仕様概要/KPI管理マスタ機能仕様_確定版.md`
- **エンティティ定義**: `.kiro/specs/entities/02_KPI管理マスタ.md`
- **仕様検討記録**: `.kiro/specs/仕様検討/20260125_KPI管理マスタ仕様検討.md`
- **技術憲法**: `.kiro/steering/tech.md`
- **プロダクト方針**: `.kiro/steering/product.md`
- **構造定義**: `.kiro/steering/structure.md`
- **EARS形式**: `.kiro/settings/rules/ears-format.md`

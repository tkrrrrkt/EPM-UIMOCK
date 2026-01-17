# Research & Design Decisions

---
**Purpose**: PJ採算照会（Project Profitability Report）の設計に向けた調査・設計判断の記録

---

## Summary
- **Feature**: `reports/project-profitability`
- **Discovery Scope**: Extension（既存レポート機能群への追加）
- **Key Findings**:
  - 既存の承認ワークフロー（Split View）・差異分析レポートのBFF契約パターンを踏襲可能
  - fact_amountsのproject_id列によるPJ別データ集計が設計済み
  - companies.xxx_subject_idによる主要科目定義を活用した指標表示

## Research Log

### 既存レポート機能のパターン分析
- **Context**: PJ採算照会を既存レポート機能群の一つとして追加するため、既存パターンを確認
- **Sources Consulted**:
  - `packages/contracts/src/bff/approval/index.ts` - Split View形式の参考
  - `packages/contracts/src/bff/variance-report/index.ts` - レポート契約の参考
  - `apps/web/src/features/workflow/approval/api/BffClient.ts` - BffClientインターフェース
- **Findings**:
  - 一覧/詳細のSplit View形式：ListRequest/ListResponse + DetailResponse構成
  - ページング：page/pageSize（BFF）→ offset/limit（API）変換
  - 数値はnumber型（Decimal表示が必要な場合はstring）
  - フィルター：専用Requestインターフェースで定義
- **Implications**: 承認ワークフローのBFF契約構造を踏襲し、PJ採算照会用にカスタマイズ

### fact_amountsのPJデータ構造
- **Context**: PJ別予算・実績・見込データの取得方法を確認
- **Sources Consulted**: `.kiro/specs/entities/01_各種マスタ.md` セクション12.1
- **Findings**:
  - fact_amounts.project_id（nullable UUID）でPJ別データを保持
  - scenario_type: BUDGET/ACTUAL/FORECAST で予算・実績・見込を区分
  - year_month列で月別データを保持
  - amount列はDECIMAL型（高精度計算対応）
- **Implications**: project_idでグループ化し、scenario_typeでピボットして表示

### 主要科目IDの活用
- **Context**: companies.xxx_subject_idの定義を設計に反映
- **Sources Consulted**: `.kiro/specs/entities/01_各種マスタ.md` companiesテーブル定義
- **Findings**:
  - revenue_subject_id: 売上高
  - cogs_subject_id: 売上原価
  - gross_profit_subject_id: 粗利
  - operating_profit_subject_id: 営業利益
  - variable_cost_subject_id, marginal_profit_subject_id, fixed_cost_subject_id: 直接原価計算用
  - contribution_profit_subject_id: 貢献利益
- **Implications**: BFF/APIで会社マスタから主要科目IDを取得し、集計クエリに使用

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Split View（採用） | 左:PJ一覧、右:PJ詳細 | 承認WFと同じUX、一覧と詳細を同時確認可能 | 詳細が複雑な場合は縦スクロール増加 | 承認ワークフローで実績あり |
| 単一詳細画面 | PJ選択後に詳細画面遷移 | 詳細表示領域が広い | 一覧と詳細を同時に見れない | 却下 |

## Design Decisions

### Decision: BFF契約構造
- **Context**: PJ採算照会のBFF契約をどのように設計するか
- **Alternatives Considered**:
  1. variance-reportスタイル（フィルター中心の複雑な構造）
  2. approvalスタイル（一覧/詳細のシンプルな構造）
- **Selected Approach**: approvalスタイルを基本とし、PJ採算固有の指標を追加
- **Rationale**: Split View形式のUI要件に適合し、シンプルで保守しやすい
- **Trade-offs**: フィルター条件の柔軟性は若干低下するが、初期リリースとしては十分
- **Follow-up**: 月別推移表示の詳細設計は詳細表示API内で対応

### Decision: 着地予測の算出ロジック
- **Context**: 「着地予測 = 実績累計 + 残期間見込」をどの層で算出するか
- **Alternatives Considered**:
  1. Domain API層で算出（ビジネスロジックとして）
  2. BFF層で算出（表示用の集計として）
- **Selected Approach**: Domain API層で算出
- **Rationale**: 着地予測は経営判断の重要指標であり、ビジネスルールの正本はDomain APIに置く原則に従う
- **Trade-offs**: Domain APIの責務が増えるが、一貫性が保たれる
- **Follow-up**: 「残期間」の定義（会計年度末まで or PJ終了日まで）を明確化

### Decision: 警告判定ロジック
- **Context**: 「粗利マイナス」などの警告判定をどの層で行うか
- **Selected Approach**: Domain APIで算出し、フラグとしてBFF経由でUIに渡す
- **Rationale**: 警告の閾値や条件はビジネスルールであり、Domain APIの責務

## Risks & Mitigations
- **Risk 1**: fact_amountsに大量データがある場合のパフォーマンス → 適切なインデックス（project_id, scenario_type, year_month）とページングで対応
- **Risk 2**: 主要科目IDが未設定の会社がある → NULL時はその指標を非表示とし、UI上でガイダンス表示
- **Risk 3**: 着地予測の「残期間」定義の曖昧さ → 初期は「会計年度末まで」とし、PJ終了日対応は将来検討

## References
- [承認ワークフローBFF契約](packages/contracts/src/bff/approval/index.ts) - Split View形式の参考
- [差異分析レポートBFF契約](packages/contracts/src/bff/variance-report/index.ts) - レポート機能の参考
- [エンティティ定義](/.kiro/specs/entities/01_各種マスタ.md) - fact_amounts, projects, companies定義

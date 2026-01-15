# Research & Design Decisions

---
**Purpose**: 予算実績照会・差異分析レポート機能の設計調査・意思決定を記録する。

---

## Summary
- **Feature**: `budget-actual-report`
- **Discovery Scope**: New Feature（レポート機能の新規実装）
- **Key Findings**:
  - グラフライブラリ: Recharts を採用（軽量、OSS、Next.js App Router対応、カスタマイズ性）
  - ウォーターフォールチャート: Recharts BarChart + カスタムレンダリングで実現
  - Excelエクスポート: ExcelJS を採用（スタイリング対応、ブラウザ/Node.js両対応）
  - データ構造: 既存の `report_layouts`, `subjects`, `subject_rollup_items` を活用

## Research Log

### チャートライブラリの選定

- **Context**: 差異分析タブのウォーターフォールチャート、推移分析タブの折れ線グラフに適したライブラリが必要
- **Sources Consulted**:
  - [LogRocket: Best React Chart Libraries 2025](https://blog.logrocket.com/best-react-chart-libraries-2025/)
  - [AG Charts: Waterfall Series](https://www.ag-grid.com/charts/react/waterfall-series/)
  - [Syncfusion React Charts](https://www.syncfusion.com/blogs/post/top-5-react-chart-libraries-2025)
- **Findings**:
  - **AG Charts**: ネイティブウォーターフォール対応、商用ライセンス
  - **Syncfusion**: 50+チャートタイプ、ウォーターフォール対応、商用ライセンス
  - **Recharts**: 24.8K GitHub stars、D3ベース、OSS、積み上げバーでウォーターフォール再現可能
  - **ApexCharts**: 金融データ向け、ウォーターフォールはカスタム必要
- **Implications**:
  - 本プロジェクトはOSSライセンス優先のため、Rechartsを選定
  - ウォーターフォールは積み上げバーチャート + invisible base + カスタムレンダリングで実現
  - 商用ライセンス検討時はAG Chartsが有力候補

### Excelエクスポートライブラリの選定

- **Context**: レポートデータのExcel（.xlsx）エクスポート機能が必要
- **Sources Consulted**:
  - [SheetJS Documentation](https://docs.sheetjs.com/docs/demos/frontend/react/)
  - [ExcelJS npm](https://www.npmjs.com/package/exceljs)
  - [react-xlsx-wrapper](https://github.com/AS-Devs/react-xlsx-wrapper)
- **Findings**:
  - **SheetJS (xlsx)**: 人気が高いがnpm公開版に脆弱性あり（v18.5以降は直接DL推奨）
  - **ExcelJS**: スタイリング対応、ブラウザ/Node.js両対応、アクティブに保守
  - **react-xlsx-wrapper**: React専用だがバージョン問題あり
- **Implications**:
  - ExcelJSを採用（スタイリング対応が必要、脆弱性問題なし）
  - BFF側でExcel生成し、UIでダウンロード（Server-side generation）
  - セルスタイル（色、フォント、数値フォーマット）の維持が可能

### データ取得アーキテクチャ

- **Context**: マトリクス表示（組織×科目）のデータ取得パターンを決定する必要あり
- **Sources Consulted**:
  - `.kiro/specs/master-data/report-layout/design.md`
  - `.kiro/specs/master-data/subject-master/design.md`
  - `.kiro/steering/tech.md`
- **Findings**:
  - レイアウトマスタ: `report_layouts` + `report_layout_lines`（行軸の定義）
  - 組織マスタ: 組織階層構造（列軸の定義）
  - 科目残高: `subject_balances`（予算・実績・見込金額）
  - 集計科目階層: `subject_rollup_items`（ウォーターフォール用）
- **Implications**:
  - Domain API: 集計済みデータを返却（BFFでの集計は禁止）
  - BFF: UI用のDTO変換、ページング正規化のみ
  - パフォーマンス: 初期表示3秒以内の要件を満たすためにキャッシュ検討

### ウォーターフォール計算ロジック

- **Context**: 差異分析で利益影響を正しく表示するロジックを確定
- **Sources Consulted**:
  - `.kiro/specs/仕様概要/予算実績照会レポート.md`
  - `.kiro/specs/master-data/subject-master/design.md`（coefficient定義）
- **Findings**:
  - `subject_rollup_items.coefficient` で利益影響の符号を決定
  - 売上高: coefficient = +1（増加が利益増）
  - 売上原価: coefficient = -1（増加が利益減）
  - 計算式: `利益影響 = (見通し - 予算) * coefficient`
- **Implications**:
  - Domain API側で利益影響を計算し、BFFに返却
  - UIは正負に応じて緑/赤のバー表示のみ
  - ドリルダウン時も同じロジックを再帰適用

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Read Model専用 | 集計済みデータ専用テーブル | 高速クエリ | データ同期の複雑性 | Phase 2以降で検討 |
| クエリ時集計 | リクエスト毎に集計計算 | 実装シンプル | 大量データでパフォーマンス懸念 | Phase 1採用 |
| キャッシュ併用 | Redis等でキャッシュ | バランス良い | インフラ追加 | 将来検討 |

**Selected**: クエリ時集計（Phase 1）
- 理由: 初期実装の複雑性を抑える、データ量が限定的な初期段階
- 将来: パフォーマンス要件に応じてRead Model導入を検討

## Design Decisions

### Decision: チャートライブラリ選定

- **Context**: 差異分析・推移分析のグラフ表示に適したライブラリが必要
- **Alternatives Considered**:
  1. AG Charts — ネイティブウォーターフォール、商用ライセンス
  2. Recharts — OSS、カスタム実装必要
  3. ApexCharts — 金融向け、ウォーターフォール非対応
- **Selected Approach**: Recharts
- **Rationale**: OSSライセンス、Next.js App Router対応、十分なカスタマイズ性、GitHub 24.8K stars
- **Trade-offs**: ウォーターフォールのネイティブサポートなし（カスタム実装で対応）
- **Follow-up**: ウォーターフォールのカスタムレンダラー実装・検証

### Decision: Excelエクスポート方式

- **Context**: レポートデータのExcelエクスポート機能
- **Alternatives Considered**:
  1. BFF生成 — サーバー側でExcel生成、ダウンロード
  2. UI生成 — ブラウザ側でExcel生成
- **Selected Approach**: BFF生成
- **Rationale**: 大量データ対応、スタイリング一貫性、UIの軽量化
- **Trade-offs**: BFFにExcelJS依存追加
- **Follow-up**: ExcelJSのNext.js Route Handler統合確認

### Decision: 見通し計算の責務

- **Context**: 見通し（実績済み + 残見込）の計算場所を決定
- **Alternatives Considered**:
  1. Domain API — データ取得時に計算
  2. BFF — UIに返却前に計算
- **Selected Approach**: Domain API
- **Rationale**: ビジネスルールの正本はDomain API、締め処理状況の判定を含むため
- **Trade-offs**: APIレスポンスが若干複雑化
- **Follow-up**: なし

### Decision: ドリルダウン方式（列軸）

- **Context**: 組織階層のドリルダウンUI方式を決定
- **Alternatives Considered**:
  1. 置換方式 — クリックで列を置換、パンくずで戻る
  2. 展開方式 — 列を横に展開
  3. ダイアログ方式 — 別画面で表示
- **Selected Approach**: 置換方式
- **Rationale**: 画面幅の制約、EPM製品での一般的なパターン
- **Trade-offs**: 一度に見える組織が限定される
- **Follow-up**: パンくずナビゲーションの実装

## Risks & Mitigations

- **Risk**: 大量データ（1000行×20列）でのマトリクス表示パフォーマンス
  - **Mitigation**: 仮想スクロール（TanStack Virtual）検討、初期表示データ制限

- **Risk**: ウォーターフォールのカスタム実装の複雑性
  - **Mitigation**: Rechartsのサンプル実装を参考、単体テストで検証

- **Risk**: Excelエクスポートのメモリ消費
  - **Mitigation**: ストリーミング生成、ファイルサイズ上限設定

---

## Dependent Entity Definitions（依存エンティティ最小定義）

本機能が参照する依存エンティティの最小定義を以下に記載する。これらは別Featureで正式に設計されるが、本機能の実装開始前に最低限必要なカラム・型を明記する。

### SubjectBalance（科目残高）

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| tenant_id | UUID | テナントID（RLS） |
| company_id | UUID | 会社ID |
| subject_id | UUID | 科目ID（FK → subjects） |
| organization_id | UUID | 組織ID（FK → organizations） |
| plan_event_id | UUID | 予算イベントID（FK → plan_events） |
| fiscal_year | INTEGER | 会計年度 |
| period | INTEGER | 会計期間（1-12） |
| budget_amount | DECIMAL(18,2) | 予算金額 |
| actual_amount | DECIMAL(18,2) | 実績金額 |
| forecast_amount | DECIMAL(18,2) | 見込金額 |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

### AccountingPeriod（会計期間）

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| tenant_id | UUID | テナントID（RLS） |
| company_id | UUID | 会社ID |
| fiscal_year | INTEGER | 会計年度 |
| period | INTEGER | 会計期間（1-12） |
| period_name | VARCHAR(50) | 期間名（例: "2026年4月"） |
| start_date | DATE | 期間開始日 |
| end_date | DATE | 期間終了日 |
| close_status | VARCHAR(20) | 締め状態（'open' / 'closed'） |
| closed_at | TIMESTAMP | 締め処理日時（NULL = 未締め） |
| closed_by | UUID | 締め処理実行者（FK → users） |

**Note**: `close_status = 'closed'` の期間は実績済みとして扱い、見通し計算で「実績済み金額」として集計する。

### PlanEvent（予算イベント）

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| tenant_id | UUID | テナントID（RLS） |
| company_id | UUID | 会社ID |
| event_code | VARCHAR(20) | イベントコード（例: "BUDGET_2026", "REVISED_Q2"） |
| event_name | VARCHAR(100) | イベント名（例: "2026年度期初予算"） |
| event_type | VARCHAR(20) | イベント種別（'budget' / 'revised_budget' / 'forecast'） |
| fiscal_year | INTEGER | 対象会計年度 |
| is_active | BOOLEAN | 有効フラグ（デフォルト表示用） |
| created_at | TIMESTAMP | 作成日時 |

### Organization（組織）

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | PK |
| tenant_id | UUID | テナントID（RLS） |
| company_id | UUID | 会社ID |
| organization_code | VARCHAR(20) | 組織コード |
| organization_name | VARCHAR(100) | 組織名 |
| parent_id | UUID | 親組織ID（NULL = ルート） |
| level | INTEGER | 階層レベル（0 = 全社、1 = 事業部、2 = 部門...） |
| sort_order | INTEGER | 表示順 |
| is_active | BOOLEAN | 有効フラグ |

**Note**: 組織階層は `parent_id` による隣接リスト方式で管理。ドリルダウン時は子組織を取得。

## References

- [Recharts Documentation](https://recharts.org/)
- [ExcelJS Documentation](https://github.com/exceljs/exceljs)
- [LogRocket: Best React Chart Libraries 2025](https://blog.logrocket.com/best-react-chart-libraries-2025/)
- `.kiro/specs/仕様概要/予算実績照会レポート.md` — 仕様概要
- `.kiro/specs/master-data/report-layout/design.md` — レイアウトマスタ設計
- `.kiro/specs/master-data/subject-master/design.md` — 科目マスタ設計

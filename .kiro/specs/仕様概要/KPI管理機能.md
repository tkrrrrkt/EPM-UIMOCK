# KPI管理機能 仕様概要

## 概要

非財務指標（KPI）の目標・実績管理機能。財務予算と同じデータ構造を使用し、別画面で管理する。

## 対象エンティティ

| エンティティ | 定義ファイル | 役割 |
|-------------|-------------|------|
| subjects | `entities/01_各種マスタ.md` | KPI科目（subject_type='KPI'） |
| fact_amounts | `entities/01_各種マスタ.md` | KPI目標・実績・見込 |
| subject_rollup_items | `entities/01_各種マスタ.md` | KPI階層・集計定義 |
| report_layouts | `entities/01_各種マスタ.md` | KPIレイアウト（layout_type='KPI'） |

## 主要な仕様

### データ構造

```
subjects テーブル
├── subject_type = 'FIN'  → 財務科目
└── subject_type = 'KPI'  → 非財務KPI

fact_amounts テーブル
├── scenario_type = 'BUDGET'   → KPI目標
├── scenario_type = 'ACTUAL'   → KPI実績
└── scenario_type = 'FORECAST' → KPI見込
```

### 画面構成

財務予算入力とは**別画面**で提供。

```
┌─────────────────────────────────────────────────┐
│ 【KPI目標入力】                                  │
├─────────────────────────────────────────────────┤
│ [シナリオ] 当初予算 ▼   [バージョン] 第1回 ▼    │
├─────────────────────────────────────────────────┤
│ [部門選択] 営業本部 ▼                           │
├─────────────────────────────────────────────────┤
│                                                  │
│  KPI項目      単位   4月    5月    6月   合計   │
│  ─────────────────────────────────────────────  │
│  契約件数     件     50     55     60    165   │
│  商談件数     件    120    130    140    390   │
│  人員数       人     25     25     26     26   │
│  顧客満足度   pt    4.2    4.3    4.3   4.27   │
│  ...                                            │
└─────────────────────────────────────────────────┘
```

### 財務予算入力との比較

| 項目 | 財務予算 | KPI目標 |
|------|---------|---------|
| 対象科目 | subject_type='FIN' | subject_type='KPI' |
| レイアウト | layout_type='BUDGET' | layout_type='KPI' |
| 単位列 | なし（金額のみ） | あり（人/件/pt/%等） |
| PJモード | あり | なし |
| ディメンション展開 | 科目×部門×ディメンション1つ | 同じ |
| 保存先 | fact_amounts | fact_amounts（共通） |

### KPI固有の属性

| カラム | 用途 | KPIでの使い方 |
|--------|------|--------------|
| measure_kind | 数値の種類 | AMOUNT / COUNT / WEIGHT / RATIO |
| unit | 単位 | 人 / 件 / pt / % |
| aggregation_method | 集計方法 | SUM / EOP / AVG / MAX / MIN |
| direction | 増減の良し悪し | higher_is_better / lower_is_better |

### 年計列の表示ルール

aggregation_method に応じて表示を分ける：

| aggregation_method | 年計列の表示 | 例 |
|-------------------|-------------|-----|
| SUM | 合計値 | 契約件数: 165件 |
| AVG | 平均値 | 顧客満足度: 4.27pt |
| EOP | 期末値（最終月の値） | 人員数: 26人 |
| MAX/MIN | 非表示（-） | - |

### KPI階層

既存の subject_rollup_items で対応：

```
顧客満足度（AGGREGATE）
├── NPS（BASE）coefficient: +1
├── リピート率（BASE）coefficient: +1
└── クレーム件数（BASE）coefficient: -1
```

### 中期経営計画との連携

mtp_theme_kpis を通じて、戦略テーマとKPI科目を紐付け可能：

```
【戦略テーマ】海外事業拡大
    ↓ mtp_theme_kpis で紐付け
【KPI科目】海外売上比率（subject_type='KPI'）
```

詳細は [中期経営計画.md](中期経営計画.md) を参照。

### KPI実績の入力

| 方法 | Phase 1 対応 |
|------|-------------|
| 手入力 | ○ |
| CSV取込 | ○ |
| 自動計算（財務連携） | × |

- 財務実績と同じ仕組み（staging → fact_amounts）
- 外部システム（人事システム等）からの取込を想定

## 対象外（Phase 1）

| 項目 | 理由 |
|------|------|
| KPI分類ラベル（先行/遅行等） | 必要性が低い、後付け可 |
| PJモード | KPIはPJ単位管理の需要が低い |
| 財務データ連携 | 独立運用で十分 |

## 関連 Feature

- `.kiro/specs/kpi/kpi-entry/` - KPI入力機能（将来）
- `.kiro/specs/kpi/action-plan-core/` - アクションプラン機能（将来）

## 関連ドキュメント

- [中期経営計画.md](中期経営計画.md) - 戦略テーマとKPI連携
- [KPIアクションプラン管理.md](KPIアクションプラン管理.md) - KPI達成のための施策管理

## 検討経緯

- `.kiro/specs/仕様検討/20260109_KPI管理機能.md` - 設計方針の決定

## 変更履歴

| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2026-01-09 | 初版作成 | Claude Code |
| 2026-01-11 | 中期経営計画との連携セクション追加、関連ドキュメント追加 | Claude Code |

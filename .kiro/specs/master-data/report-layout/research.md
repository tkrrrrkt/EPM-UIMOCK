# Research & Design Decisions

---
**Purpose**: レポートレイアウトマスタ機能の設計調査結果と意思決定を記録する。

---

## Summary
- **Feature**: `master-data/report-layout`
- **Discovery Scope**: Extension（既存マスタ系機能の拡張パターン）
- **Key Findings**:
  - エンティティ定義（7.1 report_layouts, 7.2 report_layout_lines）に基づく親子構造
  - 行の並べ替え（ドラッグ＆ドロップ）は line_no の更新で実現
  - 科目選択時は subjects テーブルと subject_fin_attrs を参照し、PL/BS種別でフィルタリング

## Research Log

### ドラッグ＆ドロップによる行並べ替え
- **Context**: 要件10「レイアウト行の並べ替え」でD&D操作が必要
- **Sources Consulted**:
  - 組織マスタ（organization-master）のD&D実装パターン
  - dnd-kit ライブラリの使用実績
- **Findings**:
  - 組織マスタではツリー構造の移動にD&Dを使用（parent_id変更）
  - レイアウト行は親子関係を持たないフラットリストなので、line_no の更新のみで十分
  - 影響を受ける行の line_no を一括更新する必要がある
- **Implications**:
  - BFF側で moveLayoutLine エンドポイントを用意
  - Domain API側で line_no 再計算ロジックを実装
  - UI側では dnd-kit を使用してドラッグ操作を実装

### 科目選択の PL/BS フィルタリング
- **Context**: 要件13「科目選択の補助」でレイアウト種別に応じた科目フィルタが必要
- **Sources Consulted**:
  - エンティティ定義 6.1 subjects, 6.2 subject_fin_attrs
  - 科目マスタ（subject-master）の設計
- **Findings**:
  - subjects テーブルには subject_type（FIN/KPI）があるが、PL/BS区分は subject_fin_attrs.fin_stmt_class に存在
  - account行で科目を選択する際は、レイアウトの layout_type（PL/BS）に合致する科目のみ表示
  - subjects JOIN subject_fin_attrs で fin_stmt_class = layout_type となる科目を取得
- **Implications**:
  - 科目検索用エンドポイントを追加（layout_type パラメータ付き）
  - BFFで科目一覧を取得し、UIに返却
  - UIは科目選択ダイアログで検索・選択機能を提供

### レイアウト複製ロジック
- **Context**: 要件12「レイアウトの複製」で行を含む完全コピーが必要
- **Sources Consulted**:
  - 組織マスタのバージョンコピー機能
- **Findings**:
  - バージョンコピーでは stable_id を引き継ぎ、新しい id を発行
  - レイアウト複製も同様に、新しい layout_id と各行の新 id を発行
  - 行の subject_id はそのまま引き継ぐ（科目マスタへの参照）
  - トランザクション内で layout + 全 lines を一括作成
- **Implications**:
  - CopyService パターンを採用
  - 単一トランザクションで整合性を保証

### プレビュー表示
- **Context**: 要件11「レイアウトのプレビュー表示」
- **Sources Consulted**:
  - エンティティ定義の行種別（header/account/note/blank）
- **Findings**:
  - プレビューは UI 責務として実装可能
  - 行データを取得し、line_type に応じたスタイリングを適用
  - 実際の数値は表示しない（レイアウト確認のみ）
- **Implications**:
  - 専用 API は不要（行一覧取得で十分）
  - UI コンポーネントとして PreviewPanel を実装

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| 1画面統合型 | レイアウト一覧 + 行リスト + 詳細パネル | 組織マスタと同様のUX、学習コスト低 | 複雑度が高い | 既存パターン踏襲 |
| 2画面分離型 | レイアウト一覧と行編集を分離 | 画面がシンプル | 画面遷移が増える | - |

**選択**: 1画面統合型（組織マスタパターン踏襲）

## Design Decisions

### Decision: 行の line_no 採番方式
- **Context**: 新規行追加時の line_no 決定方法
- **Alternatives Considered**:
  1. 最大値 + 10（ギャップを持たせる）
  2. 連番（1, 2, 3...）
  3. 浮動小数点（ソート順の柔軟性）
- **Selected Approach**: 最大値 + 10
- **Rationale**:
  - エンティティ定義で line_no は int 型
  - 10 刻みにより中間挿入の余地を残す
  - 組織マスタの sort_order と同様のアプローチ
- **Trade-offs**: 長期運用で番号が大きくなる可能性があるが、再採番機能で対応可能
- **Follow-up**: 必要に応じて「行番号正規化」機能を将来追加

### Decision: プレビュー実装方式
- **Context**: プレビュー表示の実装場所
- **Alternatives Considered**:
  1. 専用 Preview API を作成
  2. 行一覧データを UI で整形
- **Selected Approach**: 行一覧データを UI で整形
- **Rationale**:
  - プレビューは表示の問題であり、ビジネスロジックは不要
  - 行データは詳細ページで取得済み
  - BFF/API の複雑度を増やさない
- **Trade-offs**: UI 側のコード量が増えるが、責務分離の観点で適切
- **Follow-up**: -

### Decision: 科目選択のデータ取得
- **Context**: account行の科目選択で使用するデータ
- **Alternatives Considered**:
  1. 科目マスタ API を直接呼び出し
  2. レイアウトマスタ専用エンドポイントを追加
- **Selected Approach**: レイアウトマスタ専用エンドポイントを追加
- **Rationale**:
  - layout_type（PL/BS）でフィルタリングが必要
  - 科目マスタ API は汎用的すぎる
  - レイアウトマスタのコンテキストで科目を取得
- **Trade-offs**: エンドポイントが増えるが、関心の分離が明確
- **Follow-up**: -

## Risks & Mitigations
- **大量行の D&D パフォーマンス** — 初期は100行程度を想定。1000行超は仮想スクロール検討
- **科目選択時の件数** — ページネーション（page/pageSize）で対応
- **複製時のトランザクションタイムアウト** — バルクインサート使用、タイムアウト設定

## References
- [requirements.md](./requirements.md) — 要件定義
- `.kiro/specs/entities/01_各種マスタ.md` — エンティティ定義（セクション 7.1, 7.2, 6.1, 6.2）
- `.kiro/specs/master-data/organization-master/design.md` — 参考設計（1画面統合型パターン）
- `.kiro/steering/tech.md` — 技術憲法

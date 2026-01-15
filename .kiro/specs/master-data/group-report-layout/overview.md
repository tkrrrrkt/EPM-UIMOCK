# 連結レポートレイアウト（group-report-layout）仕様概要

## 1. 機能概要

連結レポートレイアウト機能は、連結予算実績レポート（連結PL/BS/KPI）の表示形式を定義・管理する機能である。

### 目的
- グループ全体の連結財務レポートの表示レイアウトを統一管理
- レポートの行構成・表示順・見出し・スタイルを柔軟に定義
- 連結勘定科目（group_subjects）の集計結果を見やすく表示

### 対象ユーザー
- 親会社の経営企画/経理財務部門（編集権限あり）
- 子会社の経理財務部門（参照のみ）

---

## 2. 関連エンティティ

### 新規追加エンティティ
| エンティティ | 説明 | 参照先 |
|-------------|------|--------|
| group_report_layouts | 連結レイアウトヘッダ | `.kiro/specs/entities/01_各種マスタ.md` セクション10.1 |
| group_report_layout_lines | 連結レイアウト行 | `.kiro/specs/entities/01_各種マスタ.md` セクション10.2 |

### 参照エンティティ
| エンティティ | 用途 |
|-------------|------|
| group_subjects | レイアウト行が参照する連結勘定科目 |
| companies | 親会社判定（parent_company_id） |

---

## 3. 主要機能

### 3.1 レイアウト管理
- 連結レイアウトの一覧表示
- 連結レイアウトの新規作成（PL/BS/KPI別）
- 連結レイアウトの編集・削除
- デフォルトレイアウトの設定
- レイアウトのコピー

### 3.2 レイアウト行の編集
- 行の追加・編集・削除
- 行タイプの設定（個社レイアウトと同じ体系）:
  - **header**: セクション見出し（例: 営業収益）
  - **account**: 科目行（BASE/AGGREGATE問わず連結勘定科目を参照）
  - **note**: 注記行
  - **blank**: 空行（スペーサー）
- 表示順（line_no）の並べ替え
- インデントレベルの設定
- 表示スタイル（太字/下線/ハイライト等）
- 集計科目（AGGREGATE）の小計表示は is_bold / is_underline フラグで制御

### 3.3 連結科目との連携
- レイアウト行から連結勘定科目を選択
- 科目の集計値（rollupで計算）をレポートに表示
- 科目タイプ（FIN/KPI）に応じたフィルタリング

---

## 4. 権限モデル

| 操作 | 親会社 | 子会社 |
|------|--------|--------|
| レイアウト一覧表示 | ✅ | ✅ |
| レイアウト詳細表示 | ✅ | ✅ |
| レイアウト作成 | ✅ | ❌ |
| レイアウト編集 | ✅ | ❌ |
| レイアウト削除 | ✅ | ❌ |
| 行の追加・編集・削除 | ✅ | ❌ |

**親会社判定**: `companies.parent_company_id IS NULL`

---

## 5. データモデル概要

```
group_report_layouts (レイアウトヘッダ)
├── id (PK)
├── tenant_id (RLS)
├── layout_type (PL/BS/KPI)
├── layout_code (tenant内一意)
├── layout_name
├── is_default
├── is_active
└── ...

    ↓ 1:N

group_report_layout_lines (レイアウト行)
├── id (PK)
├── tenant_id (RLS)
├── layout_id (FK → group_report_layouts)
├── line_no (表示順)
├── line_type (header/account/note/blank)  ※個社と同じ
├── display_name
├── group_subject_id (FK → group_subjects、account行のみ)
├── indent_level
├── 表示スタイル (is_bold, is_underline, ...)
└── ...
```

---

## 6. 画面構成（想定）

### 6.1 レイアウト一覧画面
- PL/BS/KPI タブ切替
- レイアウト一覧テーブル（コード、名称、デフォルト、状態）
- 新規作成ボタン（親会社のみ）
- 行クリックで詳細・編集画面へ

### 6.2 レイアウト詳細・編集画面
- レイアウトヘッダ情報（コード、名称、説明等）
- レイアウト行一覧（ドラッグ＆ドロップで並べ替え）
- 行追加ダイアログ
- プレビュー機能（実際の表示イメージ確認）

### 6.3 レイアウト行追加ダイアログ
- 行タイプ選択
- 表示名入力
- 連結科目選択（account/subtotal行の場合）
- インデント・スタイル設定

---

## 7. レポート生成での利用

### 集計フロー
```
fact_amounts (会社COA: subject_id)
    ↓ group_subject_mappings (変換)
group_subjects (連結COA)
    ↓ group_subject_rollup_items (集計)
集計科目 (AGGREGATE)
    ↓ group_report_layout_lines (表示)
連結レポート
```

### レンダリングロジック
1. 指定されたレイアウトの行を line_no 順に取得
2. 各行タイプに応じて表示:
   - **header**: display_name をセクション見出しとして表示
   - **account/subtotal**: group_subject_id から集計値を取得し表示
   - **note**: display_name を注記として表示
   - **blank**: 空行を挿入
3. インデント・スタイル（太字、下線等）を適用

---

## 8. 制約・注意事項

### Phase 1 の制約
- 連結用の計算指標（group_metrics）は未対応
- レイアウト行には科目行のみ（指標行は将来拡張）
- 係数による符号反転は group_subject_rollup_items で処理済み

### 設計上の注意
- line_no は 10 刻みで採番（行挿入時の再採番を減らす）
- is_default=true は layout_type ごとに1つのみ
- 削除時は物理削除ではなく is_active=false（論理削除）

---

## 9. 他機能との関係

| 関連機能 | 関係性 |
|---------|--------|
| group-subject-master | レイアウト行が参照する連結勘定科目を管理 |
| group-subject-mapping | 会社科目→連結科目の変換ルールを管理 |
| report-layout（会社別） | 会社別PL/BSレイアウト。連結レイアウトとは別体系 |
| 連結レポート機能（将来） | レイアウトを使用してレポートを生成・表示 |

---

## 10. 次のステップ

CCSDDワークフローに従い、以下の順序で進める:

1. `/kiro:spec-init master-data/group-report-layout`
2. `/kiro:spec-requirements master-data/group-report-layout`
3. `/kiro:spec-design master-data/group-report-layout`
4. `/kiro:validate-design master-data/group-report-layout`
5. `/kiro:spec-tasks master-data/group-report-layout`

---

## 変更履歴

| 日付 | 変更内容 |
|------|---------|
| 2026-01-05 | 初版作成 |

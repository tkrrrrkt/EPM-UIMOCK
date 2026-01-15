# Requirements Document: 確度管理機能

## Introduction

本機能は、予算・見込入力において、売上等の特定科目に対して確度ランク（S/A/B/C/D/Z等）別に金額を入力・管理する機能を提供する。案件の成約確度を数値化し、期待値（確度加味した着地予測）を自動算出する。

---

## Spec Reference（INPUT情報）

本要件を作成するにあたり、以下の情報を確認した：

### 仕様概要（確定済み仕様）
- **参照ファイル**: `.kiro/specs/仕様概要/確度管理機能.md`
- **確認日**: 2026-01-12
- **主要な仕様ポイント**:
  - 確度ランク（S/A/B/C/D/Z）別に金額を入力
  - 期待値 = Σ(確度×金額) を自動計算
  - 予算との差をZランク等で埋める運用を支援

### 実装内容（リバース参照）
- **BFF Contracts**: `packages/contracts/src/bff/confidence-master/index.ts`
- **UI Components**: `apps/web/src/features/master-data/confidence-master/`
- **グリッド統合**: `apps/web/src/features/transactions/forecast-entry/ui/ForecastGridWithConfidence.tsx`

---

## Entity Reference（必須）

本機能で使用するエンティティ定義：

### 対象エンティティ
- confidence_levels: 確度マスタ（会社ごと）
- fact_amounts: confidence_level_id カラム追加
- report_layout_items: confidence_enabled カラム追加

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
| 実装との整合性 | 要件が実装済みコードと整合する: ✅ |

---

## Requirements

### Requirement 1: 確度マスタ管理

**Objective:** As a システム管理者, I want 会社ごとに確度ランクを定義・管理したい, so that 案件の成約確度を数値化できる

#### Acceptance Criteria

1.1. 確度マスタは会社（company_id）単位で管理されること
1.2. 確度ランクは以下の項目を持つこと：
   - levelCode: 確度コード（S/A/B/C/D/Z等）
   - levelName: 確度名称（受注、80%受注等）
   - levelNameShort: 短縮名（S/A等）
   - probabilityRate: 掛け率（0.0〜1.0）
   - colorCode: 表示色（#RRGGBB形式）
   - sortOrder: 表示順
   - isActive: 有効/無効フラグ
1.3. 確度コードは会社内で一意であること
1.4. 新規会社作成時にデフォルトの確度ランク（S/A/B/C/D/Z）が自動設定されること
1.5. 確度マスタの追加・編集・削除ができること（使用中の削除は不可）

### Requirement 2: 確度マスタ管理画面

**Objective:** As a システム管理者, I want GUIで確度マスタを編集したい, so that 会社固有の確度ランクを設定できる

#### Acceptance Criteria

2.1. マスタデータ > 確度マスタ メニューからアクセスできること
2.2. 一覧形式で全確度ランクを表示すること
2.3. インライン編集で以下を変更できること：
   - 名称、掛け率（0-100%）、表示色、表示順、有効/無効
2.4. 掛け率はUI上0-100%で表示し、保存時に0-1に変換すること
2.5. 色の選択にカラーピッカーを提供すること
2.6. 表示順の上下移動ボタンを提供すること
2.7. 行追加・行削除ができること

### Requirement 3: 予算レイアウトでの確度管理対象設定

**Objective:** As a 経理担当者, I want 科目ごとに確度管理の対象/非対象を設定したい, so that 必要な科目のみ確度管理できる

#### Acceptance Criteria

3.1. 予算レイアウト設定画面で科目ごとに「確度管理」チェックボックスを表示すること
3.2. ディメンション設定がある科目は確度管理を設定できないこと（併用不可）
3.3. 集計科目（AGGREGATE）は確度管理を設定できないこと（子科目から自動集計）
3.4. 設定はreport_layout_itemsのconfidence_enabledカラムに保存されること

### Requirement 4: 見込入力グリッドでの確度展開表示

**Objective:** As a 現場担当者, I want 確度管理対象科目を展開して確度別に入力したい, so that 案件の確度を反映した見込を入力できる

#### Acceptance Criteria

4.1. 確度管理対象科目は▶アイコンで折りたたみ可能であること
4.2. 展開時（▼）、確度別の入力行が表示されること
   - 各確度ランク行（S/A/B/C/D/Z）
   - 合計行（自動計算、編集不可）
   - 期待値行（自動計算、編集不可）
   - 予算行（参考表示、編集不可）
4.3. 確度別行は左端に色付きバッジで確度を表示すること
4.4. 折りたたみ時は科目の合計値のみ表示すること
4.5. セル編集はデバウンス（500ms）による自動保存であること

### Requirement 5: 期待値の自動計算

**Objective:** As a 経営者, I want 確度を加味した期待値を自動算出したい, so that 確率的な着地予測を把握できる

#### Acceptance Criteria

5.1. 期待値 = Σ(確度ランクの金額 × 確度ランクの掛け率)で計算すること
5.2. 期待値は各期間（月）ごと、および通期で表示すること
5.3. 確度別金額の変更時にリアルタイムで再計算すること
5.4. 集計科目の期待値は子科目の期待値を合計すること

### Requirement 6: 確度別金額の保存

**Objective:** As a システム, I want 確度別金額をfact_amountsに保存したい, so that データの一貫性を保てる

#### Acceptance Criteria

6.1. fact_amountsにconfidence_level_idカラムを追加すること
6.2. 確度管理しない科目はconfidence_level_id = NULLであること
6.3. 確度管理科目は各確度ランクごとにレコードを作成すること
6.4. 一意制約にconfidence_level_idを含めること

---

## Out of Scope

- 確度サマリーレポート（会社全体の確度別構成）- Phase 2
- 確度推移グラフ（月次での確度変化）- Phase 2
- 確度×W/N/Bの組み合わせ分析 - Phase 2
- 実績入力への確度管理適用（実績は確定値のため対象外）

---

## 変更履歴

| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2026-01-12 | リバースエンジニアリングにより初版作成 | Claude Code |

# Requirements Document: 見込シナリオ機能（W/N/B）

## Introduction

本機能は、見込入力において特定科目に対してワースト/ノーマル/ベストの3シナリオを入力・管理する機能を提供する。期末が近づいた時に、会社全体の着地シナリオの幅を把握し、経営判断を支援する。

---

## Spec Reference（INPUT情報）

本要件を作成するにあたり、以下の情報を確認した：

### 仕様概要（確定済み仕様）
- **参照ファイル**: `.kiro/specs/仕様概要/見込シナリオ機能.md`
- **確認日**: 2026-01-12
- **主要な仕様ポイント**:
  - W/N/Bは科目の「合計」に対して入力する
  - ノーマル = 通常見込（グリッドの値と連動）
  - 未入力時はノーマル値を使用

### 実装内容（リバース参照）
- **BFF Contracts**: `packages/contracts/src/bff/forecast-wnb/index.ts`
- **W/N/Bダイアログ**: `apps/web/src/features/transactions/forecast-entry/dialogs/wnb-input-dialog.tsx`
- **イベント作成**: `apps/web/src/features/transactions/forecast-entry/dialogs/create-event-dialog.tsx`
- **グリッド統合**: `apps/web/src/features/transactions/forecast-entry/ui/ForecastGridWithConfidence.tsx`

---

## Entity Reference（必須）

本機能で使用するエンティティ定義：

### 対象エンティティ
- fact_amounts: scenario_case カラム追加
- report_layout_items: wnb_enabled カラム追加
- plan_events: wnb_start_period_no カラム追加

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

### Requirement 1: 予算レイアウトでのW/N/B対象科目設定

**Objective:** As a 経理担当者, I want 科目ごとにW/N/B入力の対象/非対象を設定したい, so that 必要な科目のみシナリオ管理できる

#### Acceptance Criteria

1.1. 予算レイアウト設定画面で科目ごとに「W/N/B」チェックボックスを表示すること
1.2. ディメンション設定がある科目はW/N/Bを設定できないこと（併用不可）
1.3. 集計科目（AGGREGATE）はW/N/Bを設定できないこと（子科目から自動集計）
1.4. 設定はreport_layout_itemsのwnb_enabledカラムに保存されること
1.5. 確度管理とW/N/Bは併用可能であること（W/N/Bは合計に対して適用）

### Requirement 2: 見込イベントでのW/N/B開始月設定

**Objective:** As a 経理担当者, I want 見込イベントごとにW/N/B入力の開始月を設定したい, so that 必要な期間のみシナリオ入力できる

#### Acceptance Criteria

2.1. 見込イベント作成画面で「W/N/B入力を有効にする」チェックボックスを表示すること
2.2. 有効時に「W/N/B開始月」セレクトボックスを表示すること（4月〜3月）
2.3. 開始月より前の月はW/N/B入力不可（ノーマルのみ）
2.4. 開始月以降はW/N/B入力可能
2.5. 設定はplan_eventsのwnb_start_period_noカラムに保存されること

### Requirement 3: 見込入力グリッドへのW/N/Bアイコン表示

**Objective:** As a 現場担当者, I want W/N/B対象のセルを視覚的に識別したい, so that シナリオ入力が必要な箇所がわかる

#### Acceptance Criteria

3.1. W/N/B対象科目かつ開始月以降のセルに📊アイコンを表示すること
3.2. アイコンはセル値の右側に表示すること
3.3. 確度管理の展開時は、「合計」行のセルにアイコンを表示すること
3.4. アイコンクリックでW/N/B入力ダイアログを開くこと

### Requirement 4: W/N/B入力ダイアログ

**Objective:** As a 現場担当者, I want ダイアログでW/N/Bを一括入力したい, so that 効率的にシナリオを入力できる

#### Acceptance Criteria

4.1. ダイアログに科目名とシナリオ入力テーブルを表示すること
4.2. テーブル行構成：
   - ワースト行（赤系バッジ）
   - ノーマル行（グレー系バッジ）
   - ベスト行（緑系バッジ）
   - 予算行（参考表示、編集不可）
4.3. テーブル列構成：
   - W/N/B対象期間の月列（編集可能）
   - 通期列（自動計算、編集不可）
4.4. ワースト/ベストは未入力可（placeholderで「未入力」表示）
4.5. ノーマル編集時はグリッドの値も連動更新されること
4.6. 「保存」ボタンで一括保存すること（自動保存ではない）
4.7. 「キャンセル」ボタンで変更を破棄してダイアログを閉じること

### Requirement 5: W/N/B未入力時のフォールバック

**Objective:** As a システム, I want 未入力のW/Bをノーマル値で代替したい, so that 集計時にデータ欠損がない

#### Acceptance Criteria

5.1. ワーストが未入力（null）の場合、ノーマル値を使用すること
5.2. ベストが未入力（null）の場合、ノーマル値を使用すること
5.3. 集計時も同様のフォールバックを適用すること
5.4. 通期計算時はフォールバック適用後の値で計算すること

### Requirement 6: W/N/Bデータの保存

**Objective:** As a システム, I want W/N/Bデータをfact_amountsに保存したい, so that データの一貫性を保てる

#### Acceptance Criteria

6.1. fact_amountsにscenario_caseカラムを追加すること
6.2. scenario_caseの値：
   - NULL: 通常値（ノーマル）= グリッドの値
   - 'WORST': ワーストケース
   - 'BEST': ベストケース
6.3. ノーマルは既存のfact_amountsレコード（scenario_case=NULL）を使用
6.4. 一意制約にscenario_caseを含めること

---

## Out of Scope

- W/N/Bサマリーパネル（見込入力画面）- Phase 2
- W/N/B専用レポート画面 - Phase 2
- シナリオ比較グラフ - Phase 2
- 確度管理との連携分析 - Phase 2

---

## 変更履歴

| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2026-01-12 | リバースエンジニアリングにより初版作成 | Claude Code |

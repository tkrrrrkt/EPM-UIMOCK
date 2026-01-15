# Requirements Document

## Introduction

本ドキュメントは、EPM SaaSにおける「月次締処理状況管理」機能の要件を定義する。会計期間（accounting_periods）の締めステータス（OPEN/SOFT_CLOSED/HARD_CLOSED）を可視化し、仮締め・本締め・差し戻し操作を提供することで、実績取込後の入力制御とデータ整合性を担保する。

---

## Spec Reference（INPUT情報）

本要件を作成するにあたり、以下の情報を確認した：

### 仕様概要（確定済み仕様）
- **参照ファイル**: `.kiro/specs/仕様概要/月次締処理状況管理.md`
- **確認日**: 2026-01-12
- **主要な仕様ポイント**:
  - 締めステータスは OPEN → SOFT_CLOSED → HARD_CLOSED の順で遷移
  - HARD_CLOSED は不可逆（差し戻し不可）
  - 仮締め実行時は前月 HARD_CLOSED チェックを実施
  - 締め操作は period_close_logs に監査ログとして記録

### 仕様検討（経緯・背景）※参考
- **参照ファイル**: `.kiro/specs/仕様検討/20260112_月次締処理状況管理.md`
- **経緯メモ**: QA壁打ちにより、締め処理フロー・権限設計・UI構成を検討し確定

---

## Entity Reference（必須）

本機能で使用するエンティティ定義を `.kiro/specs/entities/*.md` から確認し、以下を記載する：

### 対象エンティティ
- accounting_periods: `.kiro/specs/entities/01_各種マスタ.md` セクション 2.1
- period_close_logs: `.kiro/specs/entities/01_各種マスタ.md` セクション 2.2

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

### Requirement 1: 締め状況一覧表示

**Objective:** As a 経理担当者, I want 会社・年度を指定して月次締め状況を一覧表示したい, so that 各月の締め進捗を把握し適切な締め操作を判断できる

#### Acceptance Criteria

1. When ユーザーが会社と年度を選択した場合, the Period Close Status Page shall 当該年度の12ヶ月分の締め状況をリスト形式で表示する
2. The Period Close Status Page shall 各月について期間ラベル・締めステータス・締め日時・操作者を表示する
3. The Period Close Status Page shall 締めステータスを視覚的に区別できる形式で表示する（OPEN=未締め, SOFT_CLOSED=仮締め, HARD_CLOSED=本締め）
4. When ユーザーが年度セレクタで年度を変更した場合, the Period Close Status Page shall 選択された年度の締め状況を再取得して表示する
5. While データ読み込み中の場合, the Period Close Status Page shall ローディング状態を表示する

---

### Requirement 2: 仮締め操作

**Objective:** As a 締め操作権限を持つユーザー, I want 月次期間を仮締めしたい, so that 入力期間を終了し原則入力禁止状態にできる

#### Acceptance Criteria

1. When 対象月が OPEN 状態の場合, the Period Close Status Page shall 仮締めボタンを表示する
2. When ユーザーが仮締めボタンをクリックした場合, the Period Close Status Page shall 確認ダイアログを表示する
3. When ユーザーが確認ダイアログで仮締め実行を選択した場合, the BFF shall 仮締め実行前チェックを行い、チェック結果に基づいて処理を続行または拒否する
4. If 前月が HARD_CLOSED でない場合, the Domain API shall 仮締めを拒否しエラーメッセージを返却する
5. When 仮締めチェックが全てパスした場合, the Domain API shall 対象月の close_status を SOFT_CLOSED に更新し、closed_at と operated_by を記録する
6. When 仮締めが成功した場合, the Domain API shall period_close_logs に監査ログを記録する（action='SOFT_CLOSE'）
7. When 仮締めが成功した場合, the Period Close Status Page shall 最新の締め状況を再取得して画面を更新する

---

### Requirement 3: 本締め操作

**Objective:** As a 締め操作権限を持つユーザー, I want 仮締め状態の月を本締めしたい, so that 当該月のデータを確定し変更不可にできる

#### Acceptance Criteria

1. When 対象月が SOFT_CLOSED 状態の場合, the Period Close Status Page shall 本締めボタンを表示する
2. When ユーザーが本締めボタンをクリックした場合, the Period Close Status Page shall 警告付きの確認ダイアログを表示する
3. The 確認ダイアログ shall 本締め後は変更できない旨を明示する
4. When ユーザーが確認ダイアログで本締め実行を選択した場合, the Domain API shall 対象月の close_status を HARD_CLOSED に更新する
5. When 本締めが成功した場合, the Domain API shall period_close_logs に監査ログを記録する（action='HARD_CLOSE'）
6. The Domain API shall HARD_CLOSED 状態からの状態変更を一切許可しない（不可逆）

---

### Requirement 4: 差し戻し操作（仮締め解除）

**Objective:** As a 締め操作権限を持つユーザー, I want 仮締め状態の月を未締めに戻したい, so that 修正が必要な場合に入力可能状態に戻せる

#### Acceptance Criteria

1. When 対象月が SOFT_CLOSED 状態の場合, the Period Close Status Page shall 戻すボタンを表示する
2. When ユーザーが戻すボタンをクリックした場合, the Period Close Status Page shall 理由入力欄付きの確認ダイアログを表示する
3. When ユーザーが確認ダイアログで差し戻しを実行した場合, the Domain API shall 対象月の close_status を OPEN に更新する
4. When 差し戻しが成功した場合, the Domain API shall period_close_logs に監査ログを記録する（action='REOPEN', notes に理由を含む）
5. If 対象月が HARD_CLOSED 状態の場合, the Domain API shall 差し戻しを拒否する

---

### Requirement 5: 締め前チェック結果表示

**Objective:** As a 経理担当者, I want 仮締め実行前のチェック結果を確認したい, so that 仮締めできない理由を把握し対処できる

#### Acceptance Criteria

1. When 対象月が OPEN 状態かつ仮締め不可の場合, the Period Close Status Page shall チェック結果（パス/不合格とメッセージ）を表示する
2. The BFF shall チェック項目として「前月が HARD_CLOSED 済みか」を検証する
3. If チェック項目が不合格の場合, the Period Close Status Page shall 具体的な不合格理由を表示する

---

### Requirement 6: 監査ログ記録

**Objective:** As a システム管理者, I want 締め操作の履歴を追跡可能にしたい, so that 監査・トラブルシューティング時に操作履歴を確認できる

#### Acceptance Criteria

1. When 締め操作（仮締め/本締め/差し戻し）が実行された場合, the Domain API shall period_close_logs テーブルにレコードを挿入する
2. The period_close_logs レコード shall action, from_status, to_status, operated_by, operated_at, notes を含む
3. The period_close_logs shall INSERT-only とし、UPDATE/DELETE は禁止する

---

### Requirement 7: 配賦処理実行

**Objective:** As a 経理担当者, I want 月次締めフローの中で配賦処理を実行したい, so that 共通費を各部門・プロジェクトに配分し正確な損益計算ができる

#### Acceptance Criteria

1. When 仮締め状態（SOFT_CLOSED）の月がある場合, the Period Close Status Page shall 配賦処理ボタンを表示する
2. The 配賦処理ボタン shall 対象月（仮締め状態の月）のラベルを表示する
3. When ユーザーが配賦処理ボタンをクリックした場合, the Period Close Status Page shall 配賦確認ダイアログを表示する
4. The 配賦確認ダイアログ shall プレビューボタンを提供し、実行前に配賦内容を確認できる
5. When ユーザーがプレビューを実行した場合, the BFF shall 配賦マスタに基づく配賦計算結果（ルール名・配賦元金額・配賦金額・配賦先数）を一覧表示する
6. When ユーザーが配賦実行を選択した場合, the Domain API shall 配賦マスタに登録されたルールに従って配賦処理を実行する
7. When 配賦処理が成功した場合, the Period Close Status Page shall 完了トーストを表示しダイアログを閉じる
8. If 仮締め状態の月がない場合, the Period Close Status Page shall 配賦処理ボタンを無効化する

---

## Out of Scope（Phase 1 対象外）

以下は本要件のスコープ外とし、将来 Phase で検討する：

- 部門単位の締め進捗管理
- 実績取込完了の自動判定チェック
- 操作履歴の画面表示
- 権限管理機能（Phase 1 では権限チェックなし）
- 会社選択機能（Phase 1 では単一会社固定）
- 配賦マスタの管理画面（別機能として実装）

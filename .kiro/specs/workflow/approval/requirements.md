# Requirements Document

## Introduction

本ドキュメントは、EPM SaaSにおける承認ワークフロー機能の要件を定義する。
予算・見込の部門×バージョン単位での承認フローを提供し、最大5段階の固定段階承認、メール通知、Split View UIを実現する。

---

## Spec Reference（INPUT情報）

本要件を作成するにあたり、以下の情報を確認した：

### 仕様概要（確定済み仕様）
- **参照ファイル**: `.kiro/specs/仕様概要/承認ワークフロー.md`
- **確認日**: 2026-01-15
- **主要な仕様ポイント**:
  - 予算・見込（CORPORATE）の部門×バージョン単位承認
  - 最大5段階の固定承認フロー（本人+代理）
  - 5ステータス管理（DRAFT/PENDING/APPROVED/REJECTED/WITHDRAWN）
  - 垂直代理承認（上位者による下位段階スキップ承認）
  - メール通知（提出・承認・差戻し・取下げ時）
  - Split View + ステッパーUIによる承認画面

### 仕様検討（経緯・背景）
- **参照ファイル**: `.kiro/specs/仕様検討/20260115_承認ワークフロー機能.md`
- **経緯メモ**: EPMはERPではないため承認機能は「必要十分」に留める方針。一括承認・承認期限・可変ルートはMVP外。

---

## Entity Reference（必須）

本機能で使用するエンティティ定義を `.kiro/specs/entities/*.md` から確認し、以下を記載する：

### 対象エンティティ
- **department_approval_status**: `.kiro/specs/entities/03_承認ワークフロー.md` セクション 3.1
- **department_approval_histories**: `.kiro/specs/entities/03_承認ワークフロー.md` セクション 3.2
- **plan_events（変更）**: `.kiro/specs/entities/01_各種マスタ.md` セクション 11.1（purpose_type追加）
- **departments（変更）**: `.kiro/specs/entities/01_各種マスタ.md` セクション 3.2（承認者10カラム追加）

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

### Requirement 1: 承認状態管理

**Objective:** As a 予算担当者, I want 部門×バージョン単位で承認状態を管理したい, so that 承認進捗を正確に把握できる

#### Acceptance Criteria

1. When ユーザーが予算・見込バージョンを選択した時, the Approval Service shall 対象部門の承認状態（department_approval_status）を取得して表示する
2. The Approval Service shall 承認状態として DRAFT / PENDING / APPROVED / REJECTED / WITHDRAWN の5種類を管理する
3. The Approval Service shall 現在の承認段階（current_step: 0〜5）を管理する
4. While status が DRAFT の時, the Approval Service shall current_step を 0 として保持する
5. The Approval Service shall tenant_id × plan_version_id × department_stable_id の組み合わせで一意に承認状態を識別する

---

### Requirement 2: 予算・見込の提出

**Objective:** As a 予算担当者, I want 入力した予算・見込を承認申請として提出したい, so that 承認フローを開始できる

#### Acceptance Criteria

1. When ユーザーが提出ボタンをクリックした時, the Approval Service shall status を DRAFT から PENDING に変更する
2. When 提出が実行された時, the Approval Service shall current_step を 1 に設定する
3. When 提出が実行された時, the Approval Service shall submitted_at に現在日時を記録する
4. When 提出が実行された時, the Approval Service shall submitted_by_employee_id に提出者のIDを記録する
5. When 提出が実行された時, the Approval Service shall 履歴テーブルに action=SUBMIT のレコードを作成する
6. If status が DRAFT 以外の場合, then the Approval Service shall 提出を拒否しエラーを返す
7. When 提出が成功した時, the Approval Service shall 第1承認者にメール通知を送信する

---

### Requirement 3: 承認処理

**Objective:** As a 承認者, I want 承認待ちの予算・見込を承認したい, so that 承認フローを進行できる

#### Acceptance Criteria

1. When 承認者が承認ボタンをクリックした時, the Approval Service shall 履歴テーブルに action=APPROVE のレコードを作成する
2. When 承認が実行され次段階の承認者が存在する場合, the Approval Service shall current_step を +1 する
3. When 承認が実行され次段階の承認者が存在しない場合（最終承認）, the Approval Service shall status を APPROVED に変更する
4. When 最終承認が完了した時, the Approval Service shall final_approved_at に現在日時を記録する
5. If 操作者が現在段階の承認者（本人または代理）でない場合, then the Approval Service shall 承認を拒否しエラーを返す
6. When 承認が成功し次段階がある場合, the Approval Service shall 次の承認者にメール通知を送信する
7. When 最終承認が完了した時, the Approval Service shall 申請者にメール通知を送信する

---

### Requirement 4: 垂直代理承認（スキップ承認）

**Objective:** As a 上位承認者, I want 下位段階をスキップして承認したい, so that 効率的に承認処理ができる

#### Acceptance Criteria

1. When 第N承認者が承認を実行した時 and current_step が N より小さい場合, the Approval Service shall current_step を N まで進める
2. When スキップ承認が実行された時, the Approval Service shall スキップされた各段階に action=SKIP のレコードを履歴に作成する
3. When スキップ承認が実行された時, the Approval Service shall 最終承認対象段階に action=APPROVE のレコードを履歴に作成する
4. If 操作者が現在段階より下位の承認者の場合, then the Approval Service shall 承認を拒否しエラーを返す

---

### Requirement 5: 差戻し処理

**Objective:** As a 承認者, I want 問題のある予算・見込を差し戻したい, so that 修正を依頼できる

#### Acceptance Criteria

1. When 承認者が差戻しボタンをクリックした時, the Approval Service shall status を REJECTED に変更する
2. When 差戻しが実行された時, the Approval Service shall 履歴テーブルに action=REJECT のレコードを作成する
3. When 差戻しが実行された時, the Approval Service shall コメント（任意）を履歴に記録する
4. If status が PENDING でない場合, then the Approval Service shall 差戻しを拒否しエラーを返す
5. When 差戻しが成功した時, the Approval Service shall 申請者にメール通知を送信する

---

### Requirement 6: 取下げ処理

**Objective:** As a 申請者, I want 提出した申請を取り下げたい, so that 修正後に再提出できる

#### Acceptance Criteria

1. When 申請者が取下げボタンをクリックした時, the Approval Service shall status を WITHDRAWN に変更する
2. When 取下げが実行された時, the Approval Service shall 履歴テーブルに action=WITHDRAW のレコードを作成する
3. If status が PENDING でない場合, then the Approval Service shall 取下げを拒否しエラーを返す
4. If 操作者が申請者本人でない場合, then the Approval Service shall 取下げを拒否しエラーを返す
5. When 取下げが成功した時, the Approval Service shall 現在の承認待ち者にメール通知を送信する

---

### Requirement 7: 再提出処理

**Objective:** As a 申請者, I want 差戻しまたは取下げ後に再提出したい, so that 承認フローを再開できる

#### Acceptance Criteria

1. When 申請者が再提出ボタンをクリックした時 and status が REJECTED または WITHDRAWN の場合, the Approval Service shall status を PENDING に変更する
2. When 再提出が実行された時, the Approval Service shall current_step を 1 にリセットする（第1段階からやり直し）
3. When 再提出が実行された時, the Approval Service shall 履歴テーブルに action=SUBMIT のレコードを作成する
4. When 再提出が成功した時, the Approval Service shall 第1承認者にメール通知を送信する

---

### Requirement 8: 承認者設定

**Objective:** As a 管理者, I want 部門ごとに承認者を設定したい, so that 承認フローを定義できる

#### Acceptance Criteria

1. The Approval Service shall 部門マスタ（departments）に最大5段階の承認者（本人+代理）を設定できる
2. The Approval Service shall 承認者は社員ID（employees.id）で指定する
3. The Approval Service shall 承認者は詰めて設定する（1, 2, 3の順。中抜け禁止）
4. When 承認者が設定されていない段階がある場合, the Approval Service shall その段階をスキップして次の段階を最終承認とする
5. The Approval Service shall 組織版（organization_version）ごとに承認者設定を保持する

---

### Requirement 9: 承認権限判定

**Objective:** As a システム, I want 承認権限を正確に判定したい, so that 不正な承認操作を防止できる

#### Acceptance Criteria

1. The Approval Service shall 第N承認者は第1〜第N段階を承認できる
2. The Approval Service shall 第N代理承認者も第N承認者と同等の権限を持つ
3. If 操作者が設定された承認者（本人または代理）でない場合, then the Approval Service shall 承認操作を拒否する
4. The Approval Service shall 下位者（第M承認者 where M < 現在段階）による上位段階の承認を禁止する

---

### Requirement 10: 承認一覧ページ（Split View）

**Objective:** As a 承認者, I want 承認待ち案件を一覧で確認したい, so that 効率的に承認業務を行える

#### Acceptance Criteria

1. The Approval UI shall Split View形式で左ペインに承認待ち一覧、右ペインに選択案件の詳細を表示する
2. When ユーザーが承認一覧ページを開いた時, the Approval UI shall 自分が承認者（本人または代理）で status=PENDING の案件のみを表示する
3. The Approval UI shall 左ペインに検索・フィルター機能を提供する
4. When ユーザーが一覧から案件を選択した時, the Approval UI shall 右ペインに承認詳細情報を表示する
5. The Approval UI shall 右ペインに承認ステッパー（進捗可視化）を表示する
6. The Approval UI shall 右ペインにコメント入力欄（任意）を表示する
7. The Approval UI shall 右ペインに [承認] [差戻し] ボタンを表示する

---

### Requirement 11: 承認ステッパー

**Objective:** As a 承認者, I want 承認進捗を視覚的に確認したい, so that 現在の状態を把握できる

#### Acceptance Criteria

1. The Approval UI shall 承認ステッパーを横一列で表示する
2. The Approval UI shall 完了した段階を ✓（緑）で表示する
3. The Approval UI shall 現在の承認待ち段階を ●（青、ハイライト）で表示する
4. The Approval UI shall 未到達の段階を ○（グレー）で表示する
5. The Approval UI shall 各段階に承認者名を表示する
6. When 現在ログイン中のユーザーが承認者の場合, the Approval UI shall その段階を「あなた」と強調表示する

---

### Requirement 12: ヘッダ通知アイコン

**Objective:** As a 承認者, I want 承認待ち件数を常に把握したい, so that 承認漏れを防止できる

#### Acceptance Criteria

1. The Approval UI shall アプリケーションヘッダにベルアイコンを常時表示する
2. When 承認待ち案件が1件以上ある場合, the Approval UI shall バッジに件数を表示する
3. When 承認待ち案件が0件の場合, the Approval UI shall バッジを非表示にする
4. When ユーザーが通知アイコンをクリックした時, the Approval UI shall 承認一覧ページ（/approvals）に遷移する
5. The Approval UI shall 承認待ち件数は自分が承認者（本人または代理）で status=PENDING の案件数とする

---

### Requirement 13: 予算データ照会

**Objective:** As a 承認者, I want 承認対象の予算データを確認したい, so that 適切な判断ができる

#### Acceptance Criteria

1. The Approval UI shall 承認詳細画面に [予算データを確認] リンクを表示する
2. When ユーザーがリンクをクリックした時, the Approval UI shall 該当バージョン・部門の予算入力画面（読み取り専用）へ遷移する
3. The Approval UI shall 承認詳細画面にサマリ情報（売上・原価・営業利益等）を表示する

---

### Requirement 14: メール通知

**Objective:** As a ユーザー, I want 承認関連の通知をメールで受け取りたい, so that タイムリーに対応できる

#### Acceptance Criteria

1. When 提出が実行された時, the Notification Service shall 第1承認者に承認依頼メールを送信する
2. When 承認が実行され次段階がある時, the Notification Service shall 次の承認者に承認依頼メールを送信する
3. When 最終承認が完了した時, the Notification Service shall 申請者に承認完了メールを送信する
4. When 差戻しが実行された時, the Notification Service shall 申請者に差戻し通知メールを送信する
5. When 取下げが実行された時, the Notification Service shall 現在の承認待ち者に取下げ通知メールを送信する
6. The Notification Service shall メール送信先は employees.email を使用する
7. The Notification Service shall 固定文言 + 変数埋め込みのフォーマットを使用する

---

### Requirement 15: 見込の区分（CORPORATE / DIVISIONAL）

**Objective:** As a 管理者, I want 全社報告用と事業部用の見込を区分したい, so that 承認対象を適切に管理できる

#### Acceptance Criteria

1. The Plan Event Service shall plan_events テーブルに purpose_type（CORPORATE / DIVISIONAL）を保持する
2. When purpose_type が CORPORATE の場合, the Approval Service shall 承認対象として扱う
3. When purpose_type が DIVISIONAL の場合, the Approval Service shall 承認対象外として扱う
4. The Plan Event Service shall 予算（BUDGET）は purpose_type に関わらず承認対象とする
5. The Plan Event Service shall 実績（ACTUAL）は承認対象外とする

---

### Requirement 16: 承認履歴

**Objective:** As a 監査担当者, I want 承認履歴を確認したい, so that 監査証跡を確保できる

#### Acceptance Criteria

1. The Approval Service shall すべての承認アクション（SUBMIT/APPROVE/REJECT/WITHDRAW/SKIP）を履歴に記録する
2. The Approval Service shall 履歴に操作者（actor_employee_id）を記録する
3. The Approval Service shall 履歴に操作日時（acted_at）を記録する
4. The Approval Service shall 履歴に操作対象段階（step）を記録する
5. The Approval Service shall 履歴にコメント（任意）を記録する

---

## Out of Scope

以下はMVP対象外とする：

- 一括承認機能
- 承認期限機能
- エスカレーション機能
- 可変承認ルート
- メールテンプレートのカスタマイズ画面
- 承認フローの組織階層連動

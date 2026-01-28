# 報告フォーム設定 Requirements

> **ステータス**: 要件定義中
> **作成日**: 2026-01-26
> **スコープ**: A3（報告フォーム設定）
> **対象ユーザー**: システム管理者、経営企画部

---

## Spec Reference

- **仕様概要（SSoT）**: [.kiro/specs/仕様概要/経営会議レポート機能.md](../../仕様概要/経営会議レポート機能.md)
- **仕様検討**: [.kiro/specs/仕様検討/20260115_経営会議レポート機能.md](../../仕様検討/20260115_経営会議レポート機能.md)

---

## Introduction

報告フォーム設定（meeting-form-settings）は、経営会議レポート機能における**入力側**の設定画面である。

本機能は、会議種別ごとに部門が報告を登録する際の「フォーム」を定義する。セクション（大項目）と項目（入力フィールド）を階層構造で管理し、各項目のタイプ（テキスト、選択肢、ファイル添付等）を設定できる。

### 位置づけ

- **A3（報告フォーム設定）**: 部門が「何を入力するか」を定義（INPUT側）
- **A4（レポートレイアウト設定）**: 経営層が「何を見るか」を定義（OUTPUT側）

### 対象ユーザー

- システム管理者
- 経営企画部（会議設計担当）

### ビジネス目的

- 会議種別ごとに適切な報告フォームを設計できる
- 部門報告の入力項目を柔軟にカスタマイズできる
- 標準テンプレート（月次経営会議フォーム等）を定義・再利用できる
- 入力必須/任意、選択肢、文字数制限などの検証ルールを設定できる

---

## Entity Reference

本機能で使用するエンティティ定義を確認する：

### 対象エンティティ

- **meeting_form_sections**: `.kiro/specs/仕様検討/20260115_経営会議レポート機能.md` セクション 5.3
- **meeting_form_fields**: `.kiro/specs/仕様検討/20260115_経営会議レポート機能.md` セクション 5.4

### 関連エンティティ（参照のみ）

- **meeting_types**: `.kiro/specs/仕様検討/20260115_経営会議レポート機能.md` セクション 5.2（フォーム定義の親）

### エンティティ整合性確認

- [x] 対象エンティティのカラム・型・制約を確認した
- [x] エンティティ補足のビジネスルールを要件に反映した
- [x] スコープ外の関連エンティティを Out of Scope に明記した

---

## Functional Requirements

### FR-1: セクション一覧表示

**Objective:** As a システム管理者, I want 会議種別のフォームセクションを一覧表示できること, so that フォーム構成を把握できる

#### Acceptance Criteria

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-1.1 | When ユーザーが会議種別を選択した時, the Form Settings Service shall 当該会議種別に属するセクション一覧をsort_order順で表示する | P1 |
| FR-1.2 | The Form Settings Service shall 各セクションにセクションコード、セクション名、入力スコープ（DEPARTMENT/BU/COMPANY）、必須フラグ、項目数を表示する | P1 |
| FR-1.3 | The Form Settings Service shall 無効なセクション（is_active=false）をグレーアウト表示する | P2 |
| FR-1.4 | When ユーザーがセクションを展開した時, the Form Settings Service shall 当該セクションに属する項目一覧を表示する | P1 |

---

### FR-2: セクション追加

**Objective:** As a システム管理者, I want 新しいセクションを追加できること, so that フォーム構成を拡張できる

#### Acceptance Criteria

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-2.1 | When ユーザーが必須項目（セクションコード、セクション名、入力スコープ）を入力して登録を実行した時, the Form Settings Service shall 新しいセクションレコードを作成する | P1 |
| FR-2.2 | The Form Settings Service shall セクションコードを会議種別内で一意とする | P1 |
| FR-2.3 | If 同一会議種別内で既に存在するセクションコードで登録しようとした場合, the Form Settings Service shall 「セクションコードが重複しています」エラーを返す | P1 |
| FR-2.4 | The Form Settings Service shall 新規セクションの sort_order を既存セクションの最大値 + 10 として初期化する | P1 |
| FR-2.5 | The Form Settings Service shall 登録時に is_active を true として初期化する | P1 |

**入力項目**:
- セクションコード（section_code）: 必須、英数字アンダースコア、最大50文字
- セクション名（section_name）: 必須、最大200文字
- 入力スコープ（input_scope）: 必須、DEPARTMENT/BU/COMPANY から選択
- 必須フラグ（is_required）: 必須、デフォルトtrue
- 説明（description）: 任意、テキスト

---

### FR-3: セクション編集

**Objective:** As a システム管理者, I want セクション情報を編集できること, so that フォーム構成を調整できる

#### Acceptance Criteria

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-3.1 | When ユーザーがセクション情報を編集して更新を実行した時, the Form Settings Service shall 対象セクションのレコードを更新する | P1 |
| FR-3.2 | If 更新対象のセクションが存在しない場合, the Form Settings Service shall 「セクションが見つかりません」エラーを返す | P1 |
| FR-3.3 | If セクションコードを変更して既存のコードと重複する場合, the Form Settings Service shall 「セクションコードが重複しています」エラーを返す | P1 |
| FR-3.4 | The Form Settings Service shall 更新時に updated_at を記録する | P1 |

---

### FR-4: セクション削除

**Objective:** As a システム管理者, I want セクションを削除できること, so that 不要なセクションをフォームから除外できる

#### Acceptance Criteria

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-4.1 | When ユーザーがセクションの削除ボタンを押した時, the Form Settings UI shall 確認ダイアログを表示する | P1 |
| FR-4.2 | When セクションに項目が存在する場合, the Form Settings UI shall 「このセクションには[N]個の項目があります。セクションと項目をすべて削除しますか？」という警告を表示する | P1 |
| FR-4.3 | When ユーザーが確認ダイアログで「削除」を選択した時, the Form Settings Service shall 対象セクションと所属する項目をすべて物理削除する | P1 |
| FR-4.4 | If 削除対象のセクションが存在しない場合, the Form Settings Service shall 「セクションが見つかりません」エラーを返す | P1 |

---

### FR-5: セクション並べ替え

**Objective:** As a システム管理者, I want セクションの順序をドラッグ＆ドロップで変更できること, so that 直感的にフォーム構成を編集できる

#### Acceptance Criteria

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-5.1 | When ユーザーがセクションをドラッグして別の位置にドロップした時, the Form Settings Service shall 対象セクションの sort_order を更新して順序を変更する | P1 |
| FR-5.2 | The Form Settings UI shall ドラッグ中にドロップ可能な位置を視覚的に示す | P1 |
| FR-5.3 | When 並べ替えが完了した時, the Form Settings Service shall 影響を受けたセクションの sort_order を再計算する | P1 |

---

### FR-6: 項目一覧表示

**Objective:** As a システム管理者, I want セクション内の項目を一覧表示できること, so that 入力項目の構成を把握できる

#### Acceptance Criteria

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-6.1 | When ユーザーがセクションを選択した時, the Form Settings Service shall 当該セクションに属する項目一覧をsort_order順で表示する | P1 |
| FR-6.2 | The Form Settings Service shall 各項目に項目コード、項目名、項目タイプ、必須フラグ、プレースホルダーを表示する | P1 |
| FR-6.3 | The Form Settings Service shall 項目タイプをアイコンまたはバッジで視覚的に表示する | P2 |
| FR-6.4 | The Form Settings Service shall 無効な項目（is_active=false）をグレーアウト表示する | P2 |

---

### FR-7: 項目追加

**Objective:** As a システム管理者, I want セクションに新しい項目を追加できること, so that 入力フォームを拡張できる

#### Acceptance Criteria

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-7.1 | When ユーザーが必須項目（項目コード、項目名、項目タイプ）を入力して登録を実行した時, the Form Settings Service shall 新しい項目レコードを作成する | P1 |
| FR-7.2 | The Form Settings Service shall 項目コードをセクション内で一意とする | P1 |
| FR-7.3 | If 同一セクション内で既に存在する項目コードで登録しようとした場合, the Form Settings Service shall 「項目コードが重複しています」エラーを返す | P1 |
| FR-7.4 | When 項目タイプが SELECT または MULTI_SELECT の場合, the Form Settings Service shall 選択肢（options_json）の入力を必須とする | P1 |
| FR-7.5 | The Form Settings Service shall 新規項目の sort_order を既存項目の最大値 + 10 として初期化する | P1 |
| FR-7.6 | The Form Settings Service shall 登録時に is_active を true として初期化する | P1 |

**入力項目**:
- 項目コード（field_code）: 必須、英数字アンダースコア、最大50文字
- 項目名（field_name）: 必須、最大200文字
- 項目タイプ（field_type）: 必須、後述の一覧から選択
- 必須フラグ（is_required）: 必須、デフォルトtrue
- プレースホルダー（placeholder）: 任意、最大200文字
- 選択肢（options_json）: SELECT/MULTI_SELECT時は必須
- 検証ルール（validation_json）: 任意
- デフォルト値（default_value）: 任意
- 最大文字数（max_length）: TEXT/TEXTAREA時に設定可能
- ヘルプテキスト（help_text）: 任意

---

### FR-8: 項目タイプ設定

**Objective:** As a システム管理者, I want 項目タイプに応じた詳細設定ができること, so that 入力フォームを適切に構成できる

#### Acceptance Criteria

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-8.1 | When 項目タイプが TEXT の場合, the Form Settings Service shall 最大文字数（max_length）を設定可能とする | P1 |
| FR-8.2 | When 項目タイプが TEXTAREA の場合, the Form Settings Service shall 最大文字数（max_length）を設定可能とする | P1 |
| FR-8.3 | When 項目タイプが NUMBER の場合, the Form Settings Service shall 最小値・最大値を validation_json で設定可能とする | P2 |
| FR-8.4 | When 項目タイプが SELECT の場合, the Form Settings Service shall 選択肢リスト（options_json）を設定必須とする | P1 |
| FR-8.5 | When 項目タイプが MULTI_SELECT の場合, the Form Settings Service shall 選択肢リスト（options_json）を設定必須とする | P1 |
| FR-8.6 | When 項目タイプが DATE の場合, the Form Settings Service shall 日付形式の入力フィールドを提供する | P2 |
| FR-8.7 | When 項目タイプが FILE の場合, the Form Settings Service shall 許可ファイル形式を validation_json で設定可能とする | P2 |
| FR-8.8 | When 項目タイプが FORECAST_QUOTE の場合, the Form Settings Service shall 見込コメント引用用の特殊フィールドを提供する | P3 |

**項目タイプ一覧**:

| タイプ | 説明 | 用途 |
|--------|------|------|
| TEXT | 短いテキスト | 一行コメント |
| TEXTAREA | 長いテキスト | 詳細説明、引用挿入対応 |
| NUMBER | 数値 | 定量データ |
| SELECT | 単一選択 | 見通し（好調/懸念等） |
| MULTI_SELECT | 複数選択 | 該当項目チェック |
| DATE | 日付 | 期限等 |
| FILE | ファイル添付 | Excel、PDF等 |
| FORECAST_QUOTE | 見込コメント引用 | 見込入力のコメントを引用 |

---

### FR-9: 選択肢設定（options_json）

**Objective:** As a システム管理者, I want SELECT/MULTI_SELECT項目の選択肢を設定できること, so that 適切な選択肢を提供できる

#### Acceptance Criteria

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-9.1 | The Form Settings Service shall 選択肢を配列形式（options_json）で保存する | P1 |
| FR-9.2 | The Form Settings Service shall 各選択肢に value（値）と label（表示名）を設定可能とする | P1 |
| FR-9.3 | When ユーザーが選択肢を追加した時, the Form Settings UI shall 新しい選択肢行を追加する | P1 |
| FR-9.4 | When ユーザーが選択肢を削除した時, the Form Settings UI shall 対象の選択肢行を削除する | P1 |
| FR-9.5 | The Form Settings UI shall 選択肢をドラッグ＆ドロップで並べ替え可能とする | P2 |
| FR-9.6 | If SELECT/MULTI_SELECT項目で選択肢が0件の場合, the Form Settings Service shall 「選択肢を1つ以上設定してください」エラーを返す | P1 |

**options_json 形式**:
```json
[
  { "value": "GOOD", "label": "好調" },
  { "value": "ON_TRACK", "label": "計画通り" },
  { "value": "CONCERN", "label": "懸念" },
  { "value": "ACTION_NEEDED", "label": "要対策" }
]
```

---

### FR-10: 検証ルール設定（validation_json）

**Objective:** As a システム管理者, I want 項目の検証ルールを設定できること, so that 入力データの品質を担保できる

#### Acceptance Criteria

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-10.1 | The Form Settings Service shall 検証ルールをJSON形式（validation_json）で保存する | P1 |
| FR-10.2 | When 項目タイプが NUMBER の場合, the Form Settings Service shall min（最小値）とmax（最大値）を設定可能とする | P2 |
| FR-10.3 | When 項目タイプが FILE の場合, the Form Settings Service shall allowedTypes（許可ファイル形式）とmaxSize（最大サイズ）を設定可能とする | P2 |
| FR-10.4 | When 項目タイプが TEXT/TEXTAREA の場合, the Form Settings Service shall pattern（正規表現）を設定可能とする | P3 |

**validation_json 形式例**:
```json
// NUMBER の場合
{ "min": 0, "max": 100 }

// FILE の場合
{ "allowedTypes": ["pdf", "xlsx", "docx"], "maxSize": 10485760 }

// TEXT の場合（正規表現）
{ "pattern": "^[A-Z]{3}-[0-9]{4}$" }
```

---

### FR-11: 項目編集

**Objective:** As a システム管理者, I want 項目情報を編集できること, so that 入力フォームを調整できる

#### Acceptance Criteria

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-11.1 | When ユーザーが項目情報を編集して更新を実行した時, the Form Settings Service shall 対象項目のレコードを更新する | P1 |
| FR-11.2 | If 更新対象の項目が存在しない場合, the Form Settings Service shall 「項目が見つかりません」エラーを返す | P1 |
| FR-11.3 | If 項目コードを変更して既存のコードと重複する場合, the Form Settings Service shall 「項目コードが重複しています」エラーを返す | P1 |
| FR-11.4 | When 項目タイプを変更した時, the Form Settings Service shall タイプ依存の設定（options_json等）をリセットする | P2 |
| FR-11.5 | The Form Settings Service shall 更新時に updated_at を記録する | P1 |

---

### FR-12: 項目削除

**Objective:** As a システム管理者, I want 項目を削除できること, so that 不要な項目をフォームから除外できる

#### Acceptance Criteria

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-12.1 | When ユーザーが項目の削除ボタンを押した時, the Form Settings UI shall 確認ダイアログを表示する | P1 |
| FR-12.2 | When ユーザーが確認ダイアログで「削除」を選択した時, the Form Settings Service shall 対象項目のレコードを物理削除する | P1 |
| FR-12.3 | If 削除対象の項目が存在しない場合, the Form Settings Service shall 「項目が見つかりません」エラーを返す | P1 |

---

### FR-13: 項目並べ替え

**Objective:** As a システム管理者, I want 項目の順序をドラッグ＆ドロップで変更できること, so that 直感的にフォーム構成を編集できる

#### Acceptance Criteria

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-13.1 | When ユーザーが項目をドラッグして別の位置にドロップした時, the Form Settings Service shall 対象項目の sort_order を更新して順序を変更する | P1 |
| FR-13.2 | The Form Settings UI shall ドラッグ中にドロップ可能な位置を視覚的に示す | P1 |
| FR-13.3 | When 並べ替えが完了した時, the Form Settings Service shall 影響を受けた項目の sort_order を再計算する | P1 |
| FR-13.4 | The Form Settings Service shall セクション間での項目移動は不可とする（同一セクション内のみ） | P1 |

---

### FR-14: フォームプレビュー

**Objective:** As a システム管理者, I want 設定したフォームをプレビューできること, so that 部門が実際に入力する画面イメージを確認できる

#### Acceptance Criteria

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-14.1 | When ユーザーがプレビュー表示を実行した時, the Form Settings UI shall フォームを実際の入力画面と同じレイアウトで表示する | P1 |
| FR-14.2 | The Form Settings UI shall セクションごとにグループ化して表示する | P1 |
| FR-14.3 | The Form Settings UI shall 各項目タイプに応じた入力コントロールを表示する（TEXT→テキストボックス、SELECT→ドロップダウン等） | P1 |
| FR-14.4 | The Form Settings UI shall 必須項目に必須マーク（*）を表示する | P1 |
| FR-14.5 | The Form Settings UI shall プレースホルダーを表示する | P1 |
| FR-14.6 | The Form Settings UI shall ヘルプテキストを表示する | P2 |
| FR-14.7 | When プレビューモードの場合, the Form Settings UI shall 入力値の保存は行わない（表示のみ） | P1 |
| FR-14.8 | The Form Settings UI shall プレビューコンポーネントを部門報告登録画面（C1）と共通化する | P2 |

---

### FR-15: 標準テンプレート

**Objective:** As a システム管理者, I want 標準テンプレートからフォームを初期化できること, so that 一般的なフォーム構成を効率的に作成できる

#### Acceptance Criteria

| ID | 要件 | 優先度 |
|----|------|--------|
| FR-15.1 | When 会議種別にフォームが未定義の場合, the Form Settings UI shall 「テンプレートから作成」ボタンを表示する | P2 |
| FR-15.2 | When ユーザーがテンプレート選択を実行した時, the Form Settings UI shall 利用可能なテンプレート一覧を表示する | P2 |
| FR-15.3 | When ユーザーがテンプレートを選択した時, the Form Settings Service shall テンプレートのセクション・項目を複製して作成する | P2 |
| FR-15.4 | The Form Settings Service shall 「月次経営会議」標準テンプレートを提供する | P2 |

**月次経営会議テンプレート構成**:

| セクション | 項目 | タイプ | 必須 |
|------------|------|--------|------|
| 業績サマリー | 売上見通し | SELECT | ○ |
| | 利益見通し | SELECT | ○ |
| | サマリーコメント | TEXTAREA | ○ |
| 差異要因 | 売上差異の主要因 | TEXTAREA | ○ |
| | 粗利差異の主要因 | TEXTAREA | ○ |
| | 販管費差異の主要因 | TEXTAREA | - |
| リスク・課題 | 主要リスク | TEXTAREA | - |
| | 対応状況 | TEXTAREA | - |
| アクション | 今月の重点施策 | TEXTAREA | ○ |
| | 経営への要請事項 | TEXTAREA | - |
| 添付資料 | 補足資料 | FILE | - |

---

## Non-Functional Requirements

### NFR-1: セキュリティ

| ID | 要件 |
|----|------|
| NFR-1.1 | UIはBFF経由でのみデータを取得する（Domain API直接アクセス禁止） |
| NFR-1.2 | tenant_idによるマルチテナント分離を行う |
| NFR-1.3 | 認証されたユーザーのみアクセス可能とする |
| NFR-1.4 | フォーム設定操作はシステム管理者権限を要する |

### NFR-2: UI/UX

| ID | 要件 |
|----|------|
| NFR-2.1 | デザインシステム（epm-design-system.md）に準拠する |
| NFR-2.2 | ドラッグ＆ドロップ操作は直感的でスムーズに動作する |
| NFR-2.3 | レスポンシブ対応（デスクトップ優先） |
| NFR-2.4 | ローディング状態を表示する |
| NFR-2.5 | エラー時はトースト通知を表示する |
| NFR-2.6 | プレビュー表示は別画面またはサイドパネルで実行する |

### NFR-3: 開発ガイドライン

| ID | 要件 |
|----|------|
| NFR-3.1 | CCSDD（Contracts-first）に準拠する |
| NFR-3.2 | v0生成UIは `_v0_drop` に隔離する |
| NFR-3.3 | Structure Guardをパスしてから本番移行する |
| NFR-3.4 | BffClientパターンを使用する（fetch直書き禁止） |
| NFR-3.5 | プレビューコンポーネントは再利用可能な設計とする |

---

## Out of Scope（本Spec対象外）

以下は別Specで管理：

| 機能 | 対象Spec |
|------|----------|
| 会議種別一覧・設定（A1, A2） | 実装済み（meeting-type-master） |
| レポートレイアウト設定（A4） | `meeting-report-layout/`（別途作成予定） |
| 部門報告登録（C1, C2, C3） | `department-submission/` |
| 会議イベント管理（B1-B5） | `meeting-event-management/` |
| レポート閲覧（D1-D8） | `meeting-report-view/` |

---

## Glossary

| 用語 | 説明 |
|------|------|
| セクション | フォームの大項目（meeting_form_sections） |
| 項目 | セクション内の入力フィールド（meeting_form_fields） |
| 項目タイプ | TEXT/TEXTAREA/NUMBER/SELECT/MULTI_SELECT/DATE/FILE/FORECAST_QUOTE |
| 入力スコープ | DEPARTMENT（部門ごと）/BU（事業部ごと）/COMPANY（全社1つ） |
| options_json | SELECT/MULTI_SELECT項目の選択肢定義 |
| validation_json | 入力検証ルール定義 |
| プレビュー | 設定したフォームの表示確認機能 |
| テンプレート | 標準フォーム構成のプリセット |

---

## 変更履歴

| 日付 | 変更内容 |
|------|----------|
| 2026-01-26 | 初版作成 |

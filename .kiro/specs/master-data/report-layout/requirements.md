# Requirements Document

## Introduction

レポートレイアウトマスタ（report-layout）は、EPM SaaSにおける「レポートレイアウト（report_layouts）」と「レイアウト行（report_layout_lines）」を管理する機能である。

本機能は、PL（損益計算書）やBS（貸借対照表）、KPI（非財務指標）の表示レイアウトを定義し、各行に科目や見出し・注記を配置することで、経営管理レポートの表示形式をカスタマイズ可能にする。

レイアウトはテナント共通またはテナント内の会社別に定義でき、行の順序変更やインデント調整、太字表示などの表示制御を提供する。財務レイアウト（PL/BS）とKPIレイアウトは区別され、それぞれ適切な科目のみを対象とする。

### 対象ユーザー
- 経営企画/管理部門の担当者
- システム管理者

### ビジネス目的
- PL/BS/KPIの表示レイアウトを柔軟に定義し、経営管理に適した形式でレポートを表示できる
- 見出し・科目行・注記・空白行を組み合わせて、見やすいレポート構成を実現する
- 科目との紐付けにより、実績・予算データをレイアウトに沿って表示できる
- 財務レイアウトとKPIレイアウトを区別し、それぞれ適切な科目のみを対象とする

---

## Entity Reference（必須）

本機能で使用するエンティティ定義を `.kiro/specs/entities/*.md` から確認し、以下を記載する：

### 対象エンティティ
- **report_layouts**: `.kiro/specs/entities/01_各種マスタ.md` セクション 7.1
- **report_layout_lines**: `.kiro/specs/entities/01_各種マスタ.md` セクション 7.2

### 関連エンティティ（参照のみ）
- **subjects**: `.kiro/specs/entities/01_各種マスタ.md` セクション 6.1（account行で参照）
- **companies**: `.kiro/specs/entities/01_各種マスタ.md` セクション 1.2（会社別レイアウト用）

### エンティティ整合性確認
- [x] 対象エンティティのカラム・型・制約を確認した
- [x] エンティティ補足のビジネスルールを要件に反映した
- [x] スコープ外の関連エンティティを Out of Scope に明記した

---

## Requirements

### Requirement 1: レイアウト一覧の表示

**Objective:** As a 経営企画担当者, I want レイアウトを一覧形式で閲覧できること, so that 定義済みのレイアウトを把握し管理できる

#### Acceptance Criteria

1. When ユーザーがレイアウトマスタ画面を開いた時, the Report Layout Service shall 当該テナントに所属するレイアウト一覧を取得して表示する
2. When ユーザーが複数社の権限を持っている場合, the Report Layout UI shall 会社選択DDL（ドロップダウンリスト）を表示し、選択された会社のマスタのみを表示・編集可能とする
3. The Report Layout Service shall レイアウト一覧にレイアウトコード、レイアウト名、レイアウト種別（PL/BS/KPI）、会社名（会社別の場合）、有効状態を表示する
4. When ユーザーがレイアウト種別（PL/BS/KPI）でフィルタリングした時, the Report Layout Service shall 選択された種別のレイアウトのみを表示する
5. When ユーザーがキーワード検索を実行した時, the Report Layout Service shall レイアウトコードまたはレイアウト名に部分一致するレイアウトを表示する
6. The Report Layout Service shall 無効なレイアウト（is_active=false）をグレーアウト表示する

---

### Requirement 2: レイアウトの新規作成

**Objective:** As a システム管理者, I want 新しいレイアウトを作成できること, so that 経営管理に適したPL/BSの表示形式を定義できる

#### Acceptance Criteria

1. When ユーザーが必須項目（レイアウトコード、レイアウト名、レイアウト種別）を入力して登録を実行した時, the Report Layout Service shall 新しいレイアウトレコードを作成する
2. When レイアウト種別が「PL」または「BS」の場合, the Report Layout Service shall 財務レイアウトとして作成する
3. When レイアウト種別が「KPI」の場合, the Report Layout Service shall KPIレイアウトとして作成する
4. When レイアウトが正常に登録された時, the Report Layout Service shall 登録されたレイアウトの詳細情報を返す
5. If 同一テナント内かつ同一レイアウト種別で既に存在するレイアウトコードで登録しようとした場合, the Report Layout Service shall 「レイアウトコードが重複しています」エラーを返す
6. When ユーザーが会社を指定して登録した時, the Report Layout Service shall 当該会社専用のレイアウトとして作成する
7. The Report Layout Service shall 登録時に is_active を true として初期化する
8. The Report Layout Service shall 登録時に created_at / updated_at を記録する

---

### Requirement 3: レイアウトの編集

**Objective:** As a システム管理者, I want レイアウトの基本情報を編集できること, so that レイアウト名や会社割当を変更できる

#### Acceptance Criteria

1. When ユーザーがレイアウト情報を編集して更新を実行した時, the Report Layout Service shall 対象レイアウトのレコードを更新する
2. When レイアウト情報が正常に更新された時, the Report Layout Service shall 更新後のレイアウト詳細情報を返す
3. If 更新対象のレイアウトが存在しない場合, the Report Layout Service shall 「レイアウトが見つかりません」エラーを返す
4. If レイアウトコードを変更して既存のレイアウトコードと重複する場合, the Report Layout Service shall 「レイアウトコードが重複しています」エラーを返す
5. The Report Layout Service shall company_idは変更不可とする（会社選択DDLで制御するため）
6. The Report Layout Service shall 更新時に updated_at を記録する
7. When ユーザーがレイアウト種別（PL/BS/KPI）を変更しようとした時, the Report Layout UI shall 「種別を変更すると既存の行がすべて削除されます。続行しますか？」という警告ダイアログを表示する
8. When ユーザーが種別変更の警告ダイアログで「続行」を選択した時, the Report Layout Service shall レイアウトに属するすべての行を削除し、種別を更新する
9. When ユーザーが種別変更の警告ダイアログで「キャンセル」を選択した時, the Report Layout UI shall 種別変更をキャンセルし元の値を保持する

---

### Requirement 4: レイアウトの無効化

**Objective:** As a システム管理者, I want レイアウトを無効化できること, so that 使用しなくなったレイアウトを一覧から除外しつつ履歴は保持できる

#### Acceptance Criteria

1. When ユーザーが有効なレイアウトに対して無効化を実行した時, the Report Layout Service shall is_active を false に更新する
2. When 無効化が正常に完了した時, the Report Layout Service shall 更新後のレイアウト詳細情報を返す
3. If 無効化対象のレイアウトが存在しない場合, the Report Layout Service shall 「レイアウトが見つかりません」エラーを返す
4. If 既に無効化されているレイアウトを無効化しようとした場合, the Report Layout Service shall 「このレイアウトは既に無効化されています」エラーを返す
5. The Report Layout Service shall 無効化時に updated_at を記録する

---

### Requirement 5: レイアウトの再有効化

**Objective:** As a システム管理者, I want 無効化されたレイアウトを再有効化できること, so that 再び使用するレイアウトを管理対象に戻すことができる

#### Acceptance Criteria

1. When ユーザーが無効なレイアウトに対して再有効化を実行した時, the Report Layout Service shall is_active を true に更新する
2. When 再有効化が正常に完了した時, the Report Layout Service shall 更新後のレイアウト詳細情報を返す
3. If 再有効化対象のレイアウトが存在しない場合, the Report Layout Service shall 「レイアウトが見つかりません」エラーを返す
4. If 既に有効なレイアウトを再有効化しようとした場合, the Report Layout Service shall 「このレイアウトは既に有効です」エラーを返す
5. The Report Layout Service shall 再有効化時に updated_at を記録する

---

### Requirement 6: レイアウト行一覧の表示

**Objective:** As a 経営企画担当者, I want 選択したレイアウトの行を一覧形式で閲覧できること, so that レポートの構成を確認できる

#### Acceptance Criteria

1. When ユーザーがレイアウトを選択した時, the Report Layout Service shall 当該レイアウトに属する行一覧を表示順（line_no）で表示する
2. The Report Layout Service shall 各行に行番号、行種別（header/account/note/blank）、表示名、科目名（account行の場合）、インデントレベル、太字設定を表示する
3. The Report Layout Service shall 行種別を視覚的に区別して表示する（アイコンまたは色分け）
4. The Report Layout Service shall インデントレベルに応じて行を字下げ表示する
5. The Report Layout Service shall 太字設定がオンの行を太字で表示する

---

### Requirement 7: レイアウト行の追加

**Objective:** As a システム管理者, I want レイアウトに新しい行を追加できること, so that レポートの構成を拡張できる

#### Acceptance Criteria

1. When ユーザーが行種別と必要な項目を入力して追加を実行した時, the Report Layout Service shall 新しいレイアウト行レコードを作成する
2. When 行種別が「header」の場合, the Report Layout Service shall 表示名（display_name）を必須として登録する
3. When 行種別が「account」の場合, the Report Layout Service shall 科目（subject_id）を必須として登録する
4. When 行種別が「account」の場合, the Report Layout Service shall 表示名（display_name）を手動入力可能とする（レイアウトマスタ用に設定可能）
5. When 行種別が「note」の場合, the Report Layout Service shall 表示名（display_name）を必須として登録する
6. When 行種別が「blank」の場合, the Report Layout Service shall 表示名・科目なしで空白行を登録する
7. If 行種別が「account」で科目が指定されていない場合, the Report Layout Service shall 「科目を選択してください」エラーを返す
8. The Report Layout Service shall 新規行の line_no を既存行の最大値 + 10 として初期化する
9. The Report Layout Service shall 登録時に created_at / updated_at を記録する

---

### Requirement 8: レイアウト行の編集

**Objective:** As a システム管理者, I want レイアウト行の内容を編集できること, so that 表示名やインデント、太字設定などを調整できる

#### Acceptance Criteria

1. When ユーザーが行情報を編集して更新を実行した時, the Report Layout Service shall 対象行のレコードを更新する
2. When 行情報が正常に更新された時, the Report Layout Service shall 更新後の行詳細情報を返す
3. If 更新対象の行が存在しない場合, the Report Layout Service shall 「行が見つかりません」エラーを返す
4. The Report Layout Service shall 行種別（line_type）は変更不可とする
5. When 行種別が「account」で科目を変更した時, the Report Layout Service shall 新しい科目で更新する
6. When 行種別が「account」で科目を変更しようとした時, the Report Layout Service shall 選択された科目が有効（is_active=true）であることをチェックし、無効な科目の場合は「無効化された科目は選択できません」エラーを返す
7. When 行種別が「account」で科目を変更しようとした時, the Report Layout Service shall 選択された科目がレイアウト種別と整合性があることをチェックする（財務レイアウトには財務科目のみ、KPIレイアウトにはKPI科目のみ）
8. The Report Layout Service shall インデントレベル（indent_level）を 0〜5 の範囲で設定可能とする
9. The Report Layout Service shall 符号表示ポリシー（sign_display_policy）を auto/force_plus/force_minus から選択可能とする
10. The Report Layout Service shall 更新時に updated_at を記録する

---

### Requirement 9: レイアウト行の削除

**Objective:** As a システム管理者, I want レイアウト行を削除できること, so that 不要な行をレポートから除外できる

#### Acceptance Criteria

1. When ユーザーが行の削除ボタンを押した時, the Report Layout UI shall 確認ダイアログを表示する
2. When 行種別が「account」の場合, the Report Layout UI shall 「科目「[科目名]」を削除しますか？」という確認ダイアログを表示する
3. When 行種別が「account」以外の場合, the Report Layout UI shall 「この行を削除しますか？」という確認ダイアログを表示する
4. When ユーザーが確認ダイアログで「削除」を選択した時, the Report Layout Service shall 対象行のレコードを物理削除する
5. When ユーザーが確認ダイアログで「キャンセル」を選択した時, the Report Layout UI shall 削除をキャンセルする
6. When 削除が正常に完了した時, the Report Layout Service shall 削除成功メッセージを返す
7. If 削除対象の行が存在しない場合, the Report Layout Service shall 「行が見つかりません」エラーを返す
8. The Report Layout Service shall 削除後に残りの行の line_no を再採番しない（ギャップを許容）

---

### Requirement 10: レイアウト行の並べ替え

**Objective:** As a 経営企画担当者, I want レイアウト行の順序をドラッグ＆ドロップで変更できること, so that 直感的にレポート構成を編集できる

#### Acceptance Criteria

1. When ユーザーが行をドラッグして別の位置にドロップした時, the Report Layout Service shall 対象行の line_no を更新して順序を変更する
2. The Report Layout Service shall ドラッグ中にドロップ可能な位置を視覚的に示す
3. When 並べ替えが完了した時, the Report Layout Service shall 影響を受けた行の line_no を再計算する
4. The Report Layout Service shall 並べ替え後に更新された行一覧を返す
5. The Report Layout Service shall 並べ替え時に updated_at を記録する

---

### Requirement 11: レイアウトのプレビュー表示

**Objective:** As a 経営企画担当者, I want レイアウトのプレビューを確認できること, so that 実際のレポート表示イメージを事前に確認できる

#### Acceptance Criteria

1. When ユーザーがプレビュー表示を実行した時, the Report Layout Service shall レイアウト行をレポート形式でプレビュー表示する
2. The Report Layout Service shall 見出し行（header）を太字・大きめのフォントで表示する
3. The Report Layout Service shall 科目行（account）を科目名とともにインデント付きで表示する
4. The Report Layout Service shall 注記行（note）を斜体または小さめのフォントで表示する
5. The Report Layout Service shall 空白行（blank）を空行として表示する
6. The Report Layout Service shall インデントレベルに応じた字下げをプレビューに反映する
7. The Report Layout Service shall 太字設定をプレビューに反映する

---

### Requirement 12: レイアウトの複製

**Objective:** As a システム管理者, I want 既存のレイアウトを複製して新しいレイアウトを作成できること, so that 類似のレイアウトを効率的に作成できる

#### Acceptance Criteria

1. When ユーザーがレイアウトの複製を実行した時, the Report Layout Service shall 新しいレイアウトと、複製元の全行をコピーして作成する
2. When 複製時, the Report Layout Service shall 新しいレイアウトコードと名前を入力として受け取る
3. The Report Layout Service shall 複製元のcompany_idを引き継ぐ（変更不可）
4. The Report Layout Service shall 複製された行の line_no を元の順序で保持する
5. The Report Layout Service shall 複製された行の subject_id を引き継ぐ（科目マスタへの参照）
6. If 複製元のレイアウトが存在しない場合, the Report Layout Service shall 「複製元レイアウトが見つかりません」エラーを返す
7. If 入力されたレイアウトコードが重複している場合, the Report Layout Service shall 「レイアウトコードが重複しています」エラーを返す
8. The Report Layout Service shall 複製されたレイアウトを is_active = true として作成する

---

### Requirement 13: 科目選択の補助

**Objective:** As a システム管理者, I want account行に紐付ける科目を検索・選択できること, so that 多数の科目から適切なものを効率的に選択できる

#### Acceptance Criteria

1. When ユーザーがaccount行の科目を選択しようとした時, the Report Layout Service shall 科目選択ダイアログを表示する
2. The Report Layout Service shall 科目コードまたは科目名でのキーワード検索を提供する
3. When レイアウト種別が「PL」または「BS」の場合, the Report Layout Service shall 財務科目（subject_type='FIN' かつ subject_fin_attrsが存在）のみを選択肢として表示する
4. When レイアウト種別が「PL」または「BS」の場合, the Report Layout Service shall レイアウト種別に応じた科目（subject_fin_attrs.fin_stmt_class = layout_type）のみを選択肢として表示する
5. When レイアウト種別が「KPI」の場合, the Report Layout Service shall KPI科目（subject_type='KPI'）のみを選択肢として表示する
6. The Report Layout Service shall 選択された会社（company_id）の科目のみを選択肢として表示する
7. The Report Layout Service shall 科目一覧に科目コード、科目名、科目クラス（BASE/AGGREGATE）を表示する
8. When ユーザーが科目を選択した時, the Report Layout Service shall 選択した科目を行に紐付ける
9. The Report Layout Service shall 有効な科目（is_active=true）のみを選択肢として表示する
10. When レイアウト表示時に無効化された科目を参照しているaccount行が存在する場合, the Report Layout UI shall 「無効化された科目が含まれています」というアラートを表示するが、描画は実行する（数値は表示しない）

---

### Requirement 14: マルチテナント・データ分離

**Objective:** As a システム運営者, I want テナント間のデータが完全に分離されること, so that 情報漏洩リスクを排除できる

#### Acceptance Criteria

1. The Report Layout Service shall すべての操作において tenant_id による絞り込みを実施する
2. The Report Layout Service shall Repository レイヤーで tenant_id を必須パラメータとして受け取る
3. The Report Layout Service shall PostgreSQL の Row Level Security (RLS) と併用してデータ分離を担保する（double-guard）
4. If 異なるテナントのデータにアクセスしようとした場合, the Report Layout Service shall アクセスを拒否する

---

### Requirement 15: 一意性制約

**Objective:** As a システム管理者, I want レイアウトコードが適切な範囲で一意であること, so that レイアウトを確実に識別できる

#### Acceptance Criteria

1. The Report Layout Service shall tenant_id + layout_type + layout_code の組み合わせでレイアウトの一意性を担保する
2. The Report Layout Service shall tenant_id + layout_id で行の所属レイアウトを特定する
3. If 重複するコードを登録・更新しようとした場合, the Report Layout Service shall 重複エラーを返す

---

## Out of Scope（本機能のスコープ外）

以下は別機能として実装予定であり、本機能のスコープには含まない：

- **レポート表示機能**: 実際のファクトデータを取得してレイアウトに沿って表示する機能（reporting系機能）
- **レイアウトのバージョン管理**: レイアウトの変更履歴管理
- **レイアウトのインポート/エクスポート**: CSVやJSONでの一括入出力
- **レイアウトテンプレート**: テナント共通のプリセットレイアウト
- **metrics（指標）の行追加**: エンティティ定義 8.1 の metrics を行として追加する機能（将来拡張）
- **group_subjects（連結科目）との連携**: 連結レポート用のグループ科目対応
- **レイアウトの物理削除**: 行が存在する場合の物理削除（無効化のみサポート）

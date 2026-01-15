# Requirements Document

## Introduction

連結レポートレイアウトマスタ（group-report-layout）は、EPM SaaSにおける「連結レイアウト（group_report_layouts）」と「連結レイアウト行（group_report_layout_lines）」を管理する機能である。

本機能は、連結PL（連結損益計算書）や連結BS（連結貸借対照表）、連結KPI（グループ非財務指標）の表示レイアウトを定義し、各行に連結勘定科目や見出し・注記を配置することで、グループ全体の経営管理レポートの表示形式をカスタマイズ可能にする。

連結レイアウトはテナント単位で管理され、**親会社のみが編集権限を持ち**、子会社は参照のみとなる。これは個社レイアウト（report-layout）との主要な違いである。

### 対象ユーザー
- 親会社の経営企画/経理財務部門（編集権限あり）
- 子会社の経理財務部門（参照のみ）

### ビジネス目的
- 連結PL/BS/KPIの表示レイアウトをグループ統一で管理し、連結経営管理レポートを表示できる
- 見出し・科目行・注記・空白行を組み合わせて、見やすい連結レポート構成を実現する
- 連結勘定科目（group_subjects）との紐付けにより、連結実績・予算データをレイアウトに沿って表示できる
- 財務レイアウトとKPIレイアウトを区別し、それぞれ適切な連結勘定科目のみを対象とする

---

## Design Principles (設計方針)

### UI統一原則
- **個社レイアウト（report-layout）と連結レイアウト（group-report-layout）のUIは基本的に統一する**
- ユーザーが片方のUIを覚えれば、もう片方も直感的に操作できる設計を優先
- 共通化すべき要素: 画面構成、操作フロー、コンポーネント配置、行編集UI
- 個別対応が必要な要素: 参照科目体系（subjects vs group_subjects）、権限モデル（会社別 vs 親会社のみ）、スコープ表示

### 参照仕様
- 個社レイアウト仕様: `.kiro/specs/master-data/report-layout/`
- UI設計時は個社レイアウトのUIパターンを踏襲すること

### 個社レイアウトとの主な違い

| 観点 | 個社レイアウト (report-layout) | 連結レイアウト (group-report-layout) |
|------|-------------------------------|-------------------------------------|
| スコープ | tenant + company（会社別） | tenant（テナント共通） |
| 参照科目 | subjects（会社COA） | group_subjects（連結COA） |
| 編集権限 | 各会社で編集可能 | 親会社のみ編集可能 |
| 会社選択DDL | あり | なし（テナント共通のため） |
| 科目フィルタ | subject_type + subject_fin_attrs | subject_type + fin_stmt_class |

---

## Entity Reference（必須）

本機能で使用するエンティティ定義を `.kiro/specs/entities/*.md` から確認し、以下を記載する：

### 対象エンティティ
- **group_report_layouts**: `.kiro/specs/entities/01_各種マスタ.md` セクション 10.1
- **group_report_layout_lines**: `.kiro/specs/entities/01_各種マスタ.md` セクション 10.2

### 関連エンティティ（参照のみ）
- **group_subjects**: `.kiro/specs/entities/01_各種マスタ.md` セクション 9.1（account行で参照）
- **companies**: `.kiro/specs/entities/01_各種マスタ.md` セクション 1.2（親会社判定用）

### エンティティ整合性確認
- [x] 対象エンティティのカラム・型・制約を確認した
- [x] エンティティ補足のビジネスルールを要件に反映した
- [x] スコープ外の関連エンティティを Out of Scope に明記した

---

## Requirements

### Requirement 1: 連結レイアウト一覧の表示

**Objective:** As a 経営企画担当者, I want 連結レイアウトを一覧形式で閲覧できること, so that 定義済みの連結レイアウトを把握し管理できる

#### Acceptance Criteria

1. When ユーザーが連結レイアウトマスタ画面を開いた時, the Group Report Layout Service shall 当該テナントに所属する連結レイアウト一覧を取得して表示する
2. The Group Report Layout Service shall 連結レイアウト一覧にレイアウトコード、レイアウト名、レイアウト種別（PL/BS/KPI）、デフォルトフラグ、有効状態を表示する
3. When ユーザーがレイアウト種別（PL/BS/KPI）タブを切り替えた時, the Group Report Layout Service shall 選択された種別のレイアウトのみを表示する
4. When ユーザーがキーワード検索を実行した時, the Group Report Layout Service shall レイアウトコードまたはレイアウト名に部分一致するレイアウトを表示する
5. The Group Report Layout Service shall 無効なレイアウト（is_active=false）をグレーアウト表示する
6. The Group Report Layout Service shall デフォルトレイアウト（is_default=true）を視覚的に区別して表示する（バッジまたはアイコン）
7. While ユーザーが子会社でログインしている場合, the Group Report Layout UI shall 新規作成・編集・削除ボタンを非表示とする

---

### Requirement 2: 連結レイアウトの新規作成

**Objective:** As a 親会社のシステム管理者, I want 新しい連結レイアウトを作成できること, so that グループ経営管理に適した連結PL/BSの表示形式を定義できる

#### Acceptance Criteria

1. When 親会社ユーザーが必須項目（レイアウトコード、レイアウト名、レイアウト種別）を入力して登録を実行した時, the Group Report Layout Service shall 新しい連結レイアウトレコードを作成する
2. When レイアウト種別が「PL」または「BS」の場合, the Group Report Layout Service shall 財務レイアウトとして作成する
3. When レイアウト種別が「KPI」の場合, the Group Report Layout Service shall KPIレイアウトとして作成する
4. When 連結レイアウトが正常に登録された時, the Group Report Layout Service shall 登録されたレイアウトの詳細情報を返す
5. If 同一テナント内かつ同一レイアウト種別で既に存在するレイアウトコードで登録しようとした場合, the Group Report Layout Service shall 「レイアウトコードが重複しています」エラーを返す
6. If 子会社ユーザーが作成を試みた場合, the Group Report Layout Service shall 「連結レイアウトの作成権限がありません」エラーを返す
7. The Group Report Layout Service shall 登録時に is_active を true、is_default を false として初期化する
8. The Group Report Layout Service shall 登録時に created_at / updated_at / created_by / updated_by を記録する

---

### Requirement 3: 連結レイアウトの編集

**Objective:** As a 親会社のシステム管理者, I want 連結レイアウトの基本情報を編集できること, so that レイアウト名や説明を変更できる

#### Acceptance Criteria

1. When 親会社ユーザーがレイアウト情報を編集して更新を実行した時, the Group Report Layout Service shall 対象レイアウトのレコードを更新する
2. When レイアウト情報が正常に更新された時, the Group Report Layout Service shall 更新後のレイアウト詳細情報を返す
3. If 更新対象のレイアウトが存在しない場合, the Group Report Layout Service shall 「レイアウトが見つかりません」エラーを返す
4. If レイアウトコードを変更して既存のレイアウトコードと重複する場合, the Group Report Layout Service shall 「レイアウトコードが重複しています」エラーを返す
5. If 子会社ユーザーが更新を試みた場合, the Group Report Layout Service shall 「連結レイアウトの編集権限がありません」エラーを返す
6. The Group Report Layout Service shall 更新時に updated_at / updated_by を記録する
7. When ユーザーがレイアウト種別（PL/BS/KPI）を変更しようとした時, the Group Report Layout UI shall 「種別を変更すると既存の行がすべて削除されます。続行しますか？」という警告ダイアログを表示する
8. When ユーザーが種別変更の警告ダイアログで「続行」を選択した時, the Group Report Layout Service shall レイアウトに属するすべての行を削除し、種別を更新する
9. When ユーザーが種別変更の警告ダイアログで「キャンセル」を選択した時, the Group Report Layout UI shall 種別変更をキャンセルし元の値を保持する

---

### Requirement 4: 連結レイアウトの無効化

**Objective:** As a 親会社のシステム管理者, I want 連結レイアウトを無効化できること, so that 使用しなくなったレイアウトを一覧から除外しつつ履歴は保持できる

#### Acceptance Criteria

1. When 親会社ユーザーが有効なレイアウトに対して無効化を実行した時, the Group Report Layout Service shall is_active を false に更新する
2. When 無効化が正常に完了した時, the Group Report Layout Service shall 更新後のレイアウト詳細情報を返す
3. If 無効化対象のレイアウトが存在しない場合, the Group Report Layout Service shall 「レイアウトが見つかりません」エラーを返す
4. If 既に無効化されているレイアウトを無効化しようとした場合, the Group Report Layout Service shall 「このレイアウトは既に無効化されています」エラーを返す
5. If 子会社ユーザーが無効化を試みた場合, the Group Report Layout Service shall 「連結レイアウトの編集権限がありません」エラーを返す
6. If デフォルトレイアウト（is_default=true）を無効化しようとした場合, the Group Report Layout Service shall 「デフォルトレイアウトは無効化できません。先に別のレイアウトをデフォルトに設定してください」エラーを返す
7. The Group Report Layout Service shall 無効化時に updated_at / updated_by を記録する

---

### Requirement 5: 連結レイアウトの再有効化

**Objective:** As a 親会社のシステム管理者, I want 無効化された連結レイアウトを再有効化できること, so that 再び使用するレイアウトを管理対象に戻すことができる

#### Acceptance Criteria

1. When 親会社ユーザーが無効なレイアウトに対して再有効化を実行した時, the Group Report Layout Service shall is_active を true に更新する
2. When 再有効化が正常に完了した時, the Group Report Layout Service shall 更新後のレイアウト詳細情報を返す
3. If 再有効化対象のレイアウトが存在しない場合, the Group Report Layout Service shall 「レイアウトが見つかりません」エラーを返す
4. If 既に有効なレイアウトを再有効化しようとした場合, the Group Report Layout Service shall 「このレイアウトは既に有効です」エラーを返す
5. If 子会社ユーザーが再有効化を試みた場合, the Group Report Layout Service shall 「連結レイアウトの編集権限がありません」エラーを返す
6. The Group Report Layout Service shall 再有効化時に updated_at / updated_by を記録する

---

### Requirement 6: デフォルトレイアウトの設定

**Objective:** As a 親会社のシステム管理者, I want レイアウト種別ごとにデフォルトレイアウトを設定できること, so that レポート表示時の初期レイアウトを指定できる

#### Acceptance Criteria

1. When 親会社ユーザーがレイアウトをデフォルトに設定した時, the Group Report Layout Service shall 当該レイアウトの is_default を true に更新する
2. When デフォルト設定が実行された時, the Group Report Layout Service shall 同一テナント・同一レイアウト種別の既存デフォルトレイアウト（is_default=true）を false に更新する
3. The Group Report Layout Service shall 同一テナント・同一レイアウト種別で is_default=true のレイアウトは常に1つのみとする
4. If 無効なレイアウト（is_active=false）をデフォルトに設定しようとした場合, the Group Report Layout Service shall 「無効なレイアウトはデフォルトに設定できません」エラーを返す
5. If 子会社ユーザーがデフォルト設定を試みた場合, the Group Report Layout Service shall 「連結レイアウトの編集権限がありません」エラーを返す
6. The Group Report Layout Service shall デフォルト設定時に updated_at / updated_by を記録する

---

### Requirement 7: 連結レイアウト行一覧の表示

**Objective:** As a 経営企画担当者, I want 選択した連結レイアウトの行を一覧形式で閲覧できること, so that 連結レポートの構成を確認できる

#### Acceptance Criteria

1. When ユーザーが連結レイアウトを選択した時, the Group Report Layout Service shall 当該レイアウトに属する行一覧を表示順（line_no）で表示する
2. The Group Report Layout Service shall 各行に行番号、行種別（header/account/note/blank）、表示名、連結科目名（account行の場合）、科目クラス（BASE/AGGREGATE）、インデントレベル、太字・下線設定を表示する
3. The Group Report Layout Service shall 行種別を視覚的に区別して表示する（アイコンまたは色分け）
4. The Group Report Layout Service shall インデントレベルに応じて行を字下げ表示する
5. The Group Report Layout Service shall 太字設定（is_bold=true）がオンの行を太字で表示する
6. The Group Report Layout Service shall 下線設定（is_underline=true）がオンの行を下線付きで表示する
7. The Group Report Layout Service shall 二重下線設定（is_double_underline=true）がオンの行を二重下線付きで表示する
8. The Group Report Layout Service shall 背景ハイライト（bg_highlight=true）がオンの行を背景色付きで表示する

---

### Requirement 8: 連結レイアウト行の追加

**Objective:** As a 親会社のシステム管理者, I want 連結レイアウトに新しい行を追加できること, so that 連結レポートの構成を拡張できる

#### Acceptance Criteria

1. When 親会社ユーザーが行種別と必要な項目を入力して追加を実行した時, the Group Report Layout Service shall 新しいレイアウト行レコードを作成する
2. When 行種別が「header」の場合, the Group Report Layout Service shall 表示名（display_name）を必須として登録する
3. When 行種別が「account」の場合, the Group Report Layout Service shall 連結科目（group_subject_id）を必須として登録する
4. When 行種別が「account」の場合, the Group Report Layout Service shall 表示名（display_name）を手動入力可能とする（空欄の場合は連結科目名を使用）
5. When 行種別が「note」の場合, the Group Report Layout Service shall 表示名（display_name）を必須として登録する
6. When 行種別が「blank」の場合, the Group Report Layout Service shall 表示名・科目なしで空白行を登録する
7. If 行種別が「account」で連結科目が指定されていない場合, the Group Report Layout Service shall 「連結科目を選択してください」エラーを返す
8. If 子会社ユーザーが行追加を試みた場合, the Group Report Layout Service shall 「連結レイアウトの編集権限がありません」エラーを返す
9. The Group Report Layout Service shall 新規行の line_no を既存行の最大値 + 10 として初期化する
10. The Group Report Layout Service shall 登録時に created_at / updated_at を記録する

---

### Requirement 9: 連結レイアウト行の編集

**Objective:** As a 親会社のシステム管理者, I want 連結レイアウト行の内容を編集できること, so that 表示名やインデント、表示スタイルを調整できる

#### Acceptance Criteria

1. When 親会社ユーザーが行情報を編集して更新を実行した時, the Group Report Layout Service shall 対象行のレコードを更新する
2. When 行情報が正常に更新された時, the Group Report Layout Service shall 更新後の行詳細情報を返す
3. If 更新対象の行が存在しない場合, the Group Report Layout Service shall 「行が見つかりません」エラーを返す
4. If 子会社ユーザーが行編集を試みた場合, the Group Report Layout Service shall 「連結レイアウトの編集権限がありません」エラーを返す
5. The Group Report Layout Service shall 行種別（line_type）は変更不可とする
6. When 行種別が「account」で連結科目を変更した時, the Group Report Layout Service shall 新しい連結科目で更新する
7. When 行種別が「account」で連結科目を変更しようとした時, the Group Report Layout Service shall 選択された連結科目が有効（is_active=true）であることをチェックし、無効な科目の場合は「無効化された連結科目は選択できません」エラーを返す
8. When 行種別が「account」で連結科目を変更しようとした時, the Group Report Layout Service shall 選択された連結科目がレイアウト種別と整合性があることをチェックする（財務レイアウトには財務科目のみ、KPIレイアウトにはKPI科目のみ）
9. The Group Report Layout Service shall インデントレベル（indent_level）を 0〜10 の範囲で設定可能とする
10. The Group Report Layout Service shall 符号表示ポリシー（sign_display_policy）を auto/force_plus/force_minus/force_paren から選択可能とする
11. The Group Report Layout Service shall 表示スタイル（is_bold, is_underline, is_double_underline, bg_highlight）を設定可能とする
12. The Group Report Layout Service shall 更新時に updated_at を記録する

---

### Requirement 10: 連結レイアウト行の削除

**Objective:** As a 親会社のシステム管理者, I want 連結レイアウト行を削除できること, so that 不要な行を連結レポートから除外できる

#### Acceptance Criteria

1. When 親会社ユーザーが行の削除ボタンを押した時, the Group Report Layout UI shall 確認ダイアログを表示する
2. When 行種別が「account」の場合, the Group Report Layout UI shall 「連結科目「[科目名]」を削除しますか？」という確認ダイアログを表示する
3. When 行種別が「account」以外の場合, the Group Report Layout UI shall 「この行を削除しますか？」という確認ダイアログを表示する
4. When ユーザーが確認ダイアログで「削除」を選択した時, the Group Report Layout Service shall 対象行のレコードを物理削除する
5. When ユーザーが確認ダイアログで「キャンセル」を選択した時, the Group Report Layout UI shall 削除をキャンセルする
6. When 削除が正常に完了した時, the Group Report Layout Service shall 削除成功メッセージを返す
7. If 削除対象の行が存在しない場合, the Group Report Layout Service shall 「行が見つかりません」エラーを返す
8. If 子会社ユーザーが行削除を試みた場合, the Group Report Layout Service shall 「連結レイアウトの編集権限がありません」エラーを返す
9. The Group Report Layout Service shall 削除後に残りの行の line_no を再採番しない（ギャップを許容）

---

### Requirement 11: 連結レイアウト行の並べ替え

**Objective:** As a 親会社のシステム管理者, I want 連結レイアウト行の順序をドラッグ＆ドロップで変更できること, so that 直感的に連結レポート構成を編集できる

#### Acceptance Criteria

1. When 親会社ユーザーが行をドラッグして別の位置にドロップした時, the Group Report Layout Service shall 対象行の line_no を更新して順序を変更する
2. The Group Report Layout Service shall ドラッグ中にドロップ可能な位置を視覚的に示す
3. When 並べ替えが完了した時, the Group Report Layout Service shall 影響を受けた行の line_no を再計算する
4. The Group Report Layout Service shall 並べ替え後に更新された行一覧を返す
5. If 子会社ユーザーが並べ替えを試みた場合, the Group Report Layout Service shall 「連結レイアウトの編集権限がありません」エラーを返す
6. While ユーザーが子会社でログインしている場合, the Group Report Layout UI shall ドラッグ＆ドロップ機能を無効化する
7. The Group Report Layout Service shall 並べ替え時に updated_at を記録する

---

### Requirement 12: 連結レイアウトのプレビュー表示

**Objective:** As a 経営企画担当者, I want 連結レイアウトのプレビューを確認できること, so that 実際の連結レポート表示イメージを事前に確認できる

#### Acceptance Criteria

1. When ユーザーがプレビュー表示を実行した時, the Group Report Layout Service shall レイアウト行をレポート形式でプレビュー表示する
2. The Group Report Layout Service shall 見出し行（header）を太字・大きめのフォントで表示する
3. The Group Report Layout Service shall 科目行（account）を連結科目名とともにインデント付きで表示する
4. The Group Report Layout Service shall 科目行（account）で科目クラスがAGGREGATEの場合、行の表示スタイル（is_bold等）に従って表示する
5. The Group Report Layout Service shall 注記行（note）を斜体または小さめのフォントで表示する
6. The Group Report Layout Service shall 空白行（blank）を空行として表示する
7. The Group Report Layout Service shall インデントレベルに応じた字下げをプレビューに反映する
8. The Group Report Layout Service shall 太字・下線・二重下線・背景ハイライト設定をプレビューに反映する

---

### Requirement 13: 連結レイアウトの複製

**Objective:** As a 親会社のシステム管理者, I want 既存の連結レイアウトを複製して新しいレイアウトを作成できること, so that 類似の連結レイアウトを効率的に作成できる

#### Acceptance Criteria

1. When 親会社ユーザーが連結レイアウトの複製を実行した時, the Group Report Layout Service shall 新しいレイアウトと、複製元の全行をコピーして作成する
2. When 複製時, the Group Report Layout Service shall 新しいレイアウトコードと名前を入力として受け取る
3. The Group Report Layout Service shall 複製元のレイアウト種別を引き継ぐ（変更不可）
4. The Group Report Layout Service shall 複製された行の line_no を元の順序で保持する
5. The Group Report Layout Service shall 複製された行の group_subject_id を引き継ぐ（連結科目マスタへの参照）
6. The Group Report Layout Service shall 複製された行の表示スタイル設定（is_bold, is_underline等）を引き継ぐ
7. If 複製元のレイアウトが存在しない場合, the Group Report Layout Service shall 「複製元レイアウトが見つかりません」エラーを返す
8. If 入力されたレイアウトコードが重複している場合, the Group Report Layout Service shall 「レイアウトコードが重複しています」エラーを返す
9. If 子会社ユーザーが複製を試みた場合, the Group Report Layout Service shall 「連結レイアウトの作成権限がありません」エラーを返す
10. The Group Report Layout Service shall 複製されたレイアウトを is_active = true、is_default = false として作成する

---

### Requirement 14: 連結科目選択の補助

**Objective:** As a 親会社のシステム管理者, I want account行に紐付ける連結科目を検索・選択できること, so that 多数の連結科目から適切なものを効率的に選択できる

#### Acceptance Criteria

1. When ユーザーがaccount行の連結科目を選択しようとした時, the Group Report Layout Service shall 連結科目選択ダイアログを表示する
2. The Group Report Layout Service shall 科目コードまたは科目名でのキーワード検索を提供する
3. When レイアウト種別が「PL」の場合, the Group Report Layout Service shall 財務科目（subject_type='FIN' かつ fin_stmt_class='PL'）のみを選択肢として表示する
4. When レイアウト種別が「BS」の場合, the Group Report Layout Service shall 財務科目（subject_type='FIN' かつ fin_stmt_class='BS'）のみを選択肢として表示する
5. When レイアウト種別が「KPI」の場合, the Group Report Layout Service shall KPI科目（subject_type='KPI'）のみを選択肢として表示する
6. The Group Report Layout Service shall 連結科目一覧に科目コード、科目名、科目クラス（BASE/AGGREGATE）を表示する
7. When ユーザーが連結科目を選択した時, the Group Report Layout Service shall 選択した科目を行に紐付ける
8. The Group Report Layout Service shall 有効な連結科目（is_active=true）のみを選択肢として表示する
9. When レイアウト表示時に無効化された連結科目を参照しているaccount行が存在する場合, the Group Report Layout UI shall 「無効化された連結科目が含まれています」というアラートを表示するが、描画は実行する

---

### Requirement 15: マルチテナント・データ分離

**Objective:** As a システム運営者, I want テナント間のデータが完全に分離されること, so that 情報漏洩リスクを排除できる

#### Acceptance Criteria

1. The Group Report Layout Service shall すべての操作において tenant_id による絞り込みを実施する
2. The Group Report Layout Service shall Repository レイヤーで tenant_id を必須パラメータとして受け取る
3. The Group Report Layout Service shall PostgreSQL の Row Level Security (RLS) と併用してデータ分離を担保する（double-guard）
4. If 異なるテナントのデータにアクセスしようとした場合, the Group Report Layout Service shall アクセスを拒否する

---

### Requirement 16: 一意性制約

**Objective:** As a システム管理者, I want 連結レイアウトコードが適切な範囲で一意であること, so that レイアウトを確実に識別できる

#### Acceptance Criteria

1. The Group Report Layout Service shall tenant_id + layout_type + layout_code の組み合わせで連結レイアウトの一意性を担保する
2. The Group Report Layout Service shall tenant_id + layout_id で行の所属レイアウトを特定する
3. If 重複するコードを登録・更新しようとした場合, the Group Report Layout Service shall 重複エラーを返す

---

### Requirement 17: 親会社判定と権限制御

**Objective:** As a システム運営者, I want 連結レイアウトの編集権限を親会社のみに制限できること, so that グループ統一のレイアウト管理体制を維持できる

#### Acceptance Criteria

1. The Group Report Layout Service shall ログインユーザーの所属会社の parent_company_id を確認して親会社を判定する
2. When companies.parent_company_id IS NULL の場合, the Group Report Layout Service shall 当該ユーザーを親会社ユーザーと判定する
3. When companies.parent_company_id IS NOT NULL の場合, the Group Report Layout Service shall 当該ユーザーを子会社ユーザーと判定する
4. The Group Report Layout Service shall 子会社ユーザーに対してすべての変更操作（作成・更新・削除・並べ替え）を禁止する
5. The Group Report Layout Service shall 親会社・子会社を問わずすべてのユーザーに参照操作（一覧表示・詳細表示・プレビュー）を許可する
6. If 子会社ユーザーが変更操作を試みた場合, the Group Report Layout Service shall 403 Forbidden エラーを返す

---

## Out of Scope（本機能のスコープ外）

以下は別機能として実装予定であり、本機能のスコープには含まない：

- **連結レポート表示機能**: 実際の連結ファクトデータを取得してレイアウトに沿って表示する機能（reporting系機能）
- **レイアウトのバージョン管理**: レイアウトの変更履歴管理
- **レイアウトのインポート/エクスポート**: CSVやJSONでの一括入出力
- **レイアウトテンプレート**: テナント共通のプリセットレイアウト
- **group_metrics（連結指標）の行追加**: 連結用の計算指標を行として追加する機能（将来拡張）
- **レイアウトの物理削除**: 行が存在する場合の物理削除（無効化のみサポート）
- **会社別連結レイアウト**: 現在はテナント単位のみ。会社別の連結レイアウトは将来検討

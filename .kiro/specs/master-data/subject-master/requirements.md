# Requirements Document

## Introduction

科目マスタは、EPM SaaSにおける「勘定科目（財務科目・KPI）とその集計構造」を管理する機能である。

本機能のスコープは、科目（subjects）の基本属性と集計定義（subject_rollup_items）に限定し、財務属性（subject_fin_attrs）は別機能として実装する。

科目は「通常科目（BASE）」と「集計科目（AGGREGATE）」に分類され、AGGREGATEは複数の構成科目を係数付きで集計する親子関係を持つ。このため、リスト形式ではなくツリー形式のUIを採用し、集計構造の視覚的な把握と編集を可能にする。

subjects.id は予算・実績データ（transactions）から FK 参照されるため、物理削除ではなく無効化（is_active = false）で運用する。

### 対象ユーザー
- 経営企画/管理部門の担当者
- システム管理者

### ビジネス目的
- 財務科目・KPIを統一的に管理し、予算編成・実績管理の基盤とする
- 集計科目による自動集計を実現し、手動集計の手間とミスを排除する
- ツリーUIによる直感的な集計構造の把握と編集を可能にする

---

## Requirements

### Requirement 1: 科目ツリーの表示

**Objective:** As a 経営企画担当者, I want 科目を階層ツリー形式で閲覧できること, so that 集計構造を視覚的に把握できる

#### Acceptance Criteria

1. When ユーザーが科目マスタ画面を開いた時, the Subject Master Service shall 当該会社（company_id）に所属する科目一覧をツリー形式で表示する
2. The Subject Master Service shall 集計科目（AGGREGATE）を親ノードとして、その構成科目を子ノードとしてツリー表示する
3. The Subject Master Service shall ルートレベルに集計親を持たない科目（トップレベル集計科目および未割当科目）を表示する
4. When ユーザーがツリーノードを展開した時, the Subject Master Service shall 子ノード（構成科目）を表示する
5. When ユーザーがツリーノードを折りたたんだ時, the Subject Master Service shall 子ノードを非表示にする
6. The Subject Master Service shall 各ノードに科目コード、科目名、科目クラス（BASE/AGGREGATE）、科目タイプ（FIN/KPI）、有効状態を表示する

---

### Requirement 2: 科目の詳細表示・編集

**Objective:** As a 経営企画担当者, I want ツリーから選択した科目の詳細情報を閲覧・編集できること, so that 科目属性を正確に管理できる

#### Acceptance Criteria

1. When ユーザーがツリーから科目を選択した時, the Subject Master Service shall 右側の詳細パネルに当該科目の全属性を表示する
2. The Subject Master Service shall 詳細パネルに科目コード、科目名、科目名略称、科目クラス、科目タイプ、計上可否、メジャー種別、単位、スケール、集計方法、方向性、負値許可、労務費単価利用可否、有効フラグ、備考、作成日時、更新日時を表示する
3. When ユーザーが編集モードに切り替えた時, the Subject Master Service shall 編集可能なフィールドを入力可能状態にする
4. When ユーザーが編集内容を保存した時, the Subject Master Service shall 科目レコードを更新する
5. If 科目コードを変更して既存の科目コードと重複する場合, the Subject Master Service shall 「科目コードが重複しています」エラーを返す
6. The Subject Master Service shall 更新時に updated_at / updated_by を記録する

---

### Requirement 3: 通常科目（BASE）の新規登録

**Objective:** As a システム管理者, I want 新しい通常科目を登録できること, so that 新たな勘定科目やKPIを追加できる

#### Acceptance Criteria

1. When ユーザーが「通常科目を追加」を実行した時, the Subject Master Service shall 新規作成フォームを表示する
2. When ユーザーが必須項目（科目コード、科目名、科目タイプ、メジャー種別、集計方法）を入力して登録を実行した時, the Subject Master Service shall subject_class = 'BASE' として新しい科目レコードを作成する
3. The Subject Master Service shall BASE科目の posting_allowed をデフォルト true として初期化する
4. If 同一会社内で既に存在する科目コードで登録しようとした場合, the Subject Master Service shall 「科目コードが重複しています」エラーを返す
5. If 必須項目が入力されていない場合, the Subject Master Service shall バリデーションエラーを返す
6. The Subject Master Service shall 新規登録時に is_active を true として初期化する
7. The Subject Master Service shall 登録時に created_by / updated_by に操作ユーザーIDを記録する

---

### Requirement 4: 集計科目（AGGREGATE）の新規登録

**Objective:** As a システム管理者, I want 新しい集計科目を登録できること, so that 複数科目を集計する親科目を定義できる

#### Acceptance Criteria

1. When ユーザーが「集計科目を追加」を実行した時, the Subject Master Service shall 新規作成フォームを表示する
2. When ユーザーが必須項目（科目コード、科目名、科目タイプ、メジャー種別、集計方法）を入力して登録を実行した時, the Subject Master Service shall subject_class = 'AGGREGATE' として新しい科目レコードを作成する
3. The Subject Master Service shall AGGREGATE科目の posting_allowed を強制的に false に設定する
4. If 同一会社内で既に存在する科目コードで登録しようとした場合, the Subject Master Service shall 「科目コードが重複しています」エラーを返す
5. If 必須項目が入力されていない場合, the Subject Master Service shall バリデーションエラーを返す
6. The Subject Master Service shall 新規登録時に is_active を true として初期化する
7. The Subject Master Service shall 登録時に created_by / updated_by に操作ユーザーIDを記録する

---

### Requirement 5: 集計構造（Rollup）の定義

**Objective:** As a 経営企画担当者, I want 集計科目に構成科目を追加・編集できること, so that 集計ロジックを定義できる

#### Acceptance Criteria

1. When ユーザーが集計科目を選択して「構成科目を追加」を実行した時, the Subject Master Service shall 構成科目選択ダイアログを表示する
2. When ユーザーが構成科目と係数を指定して追加を実行した時, the Subject Master Service shall subject_rollup_items レコードを作成する
3. The Subject Master Service shall 係数（coefficient）としてプラス値・マイナス値を許可する（例：売上 +1、売上原価 -1 → 粗利）
4. When ユーザーが既存の構成科目の係数を変更した時, the Subject Master Service shall subject_rollup_items レコードを更新する
5. When ユーザーが構成科目を削除した時, the Subject Master Service shall 該当の subject_rollup_items レコードを削除する
6. The Subject Master Service shall sort_order により構成科目の表示順序を管理する
7. If 同一の親子関係が既に存在する場合, the Subject Master Service shall 「この構成科目は既に追加されています」エラーを返す

---

### Requirement 6: ドラッグ＆ドロップによる構造編集

**Objective:** As a 経営企画担当者, I want ツリー上でドラッグ＆ドロップで構成科目を移動できること, so that 直感的に集計構造を編集できる

#### Acceptance Criteria

1. When ユーザーが科目ノードをドラッグして別の集計科目にドロップした時, the Subject Master Service shall 移動元の rollup 関係を削除し、移動先の rollup 関係を作成する
2. When ユーザーが科目ノードをルートレベルにドロップした時, the Subject Master Service shall 既存の rollup 関係を削除し、未割当状態にする
3. If ドロップ先が通常科目（BASE）の場合, the Subject Master Service shall 「通常科目の下には配置できません」エラーを表示する
4. The Subject Master Service shall ドロップ後に循環参照チェックを実行し、問題があればエラーを表示してロールバックする
5. The Subject Master Service shall ドラッグ中にドロップ可能な位置を視覚的に示す

---

### Requirement 7: 科目のコピー＆ペースト

**Objective:** As a 経営企画担当者, I want 科目をコピーして別の集計科目に追加できること, so that 同じ科目を複数の集計に含めることができる

#### Acceptance Criteria

1. When ユーザーが科目を選択してコピーを実行した時, the Subject Master Service shall クリップボードに科目参照を保持する
2. When ユーザーが集計科目を選択してペーストを実行した時, the Subject Master Service shall 新しい rollup 関係を作成する
3. The Subject Master Service shall ペースト時にデフォルト係数 +1 を設定する（後から編集可能）
4. If ペースト先に同一科目が既に存在する場合, the Subject Master Service shall 「この構成科目は既に追加されています」エラーを表示する
5. The Subject Master Service shall ペースト後に循環参照チェックを実行する

---

### Requirement 8: 科目の無効化

**Objective:** As a システム管理者, I want 科目を無効化できること, so that 使用しなくなった科目を一覧から除外しつつ履歴は保持できる

#### Acceptance Criteria

1. When ユーザーが有効な科目に対して無効化を実行した時, the Subject Master Service shall is_active を false に更新する
2. When 無効化が正常に完了した時, the Subject Master Service shall 更新後の科目詳細情報を返す
3. If 無効化対象の科目が存在しない場合, the Subject Master Service shall 「科目が見つかりません」エラーを返す
4. If 既に無効化されている科目を無効化しようとした場合, the Subject Master Service shall 「この科目は既に無効化されています」エラーを返す
5. When 集計科目を無効化した時, the Subject Master Service shall その科目が親となっている rollup 関係を無効（または削除）する
6. The Subject Master Service shall 無効化時に updated_at / updated_by を記録する

---

### Requirement 9: 科目の再有効化

**Objective:** As a システム管理者, I want 無効化された科目を再有効化できること, so that 再び使用する科目を管理対象に戻すことができる

#### Acceptance Criteria

1. When ユーザーが無効な科目に対して再有効化を実行した時, the Subject Master Service shall is_active を true に更新する
2. When 再有効化が正常に完了した時, the Subject Master Service shall 更新後の科目詳細情報を返す
3. If 再有効化対象の科目が存在しない場合, the Subject Master Service shall 「科目が見つかりません」エラーを返す
4. If 既に有効な科目を再有効化しようとした場合, the Subject Master Service shall 「この科目は既に有効です」エラーを返す
5. The Subject Master Service shall 再有効化時に updated_at / updated_by を記録する

---

### Requirement 10: 科目のフィルタリング・検索

**Objective:** As a 経営企画担当者, I want 科目をフィルタリング・検索できること, so that 大量の科目から必要なものを素早く見つけられる

#### Acceptance Criteria

1. When ユーザーが検索キーワードを入力した時, the Subject Master Service shall 科目コードまたは科目名に部分一致する科目をハイライト表示する
2. When ユーザーが科目タイプ（FIN/KPI）でフィルタリングした時, the Subject Master Service shall 該当する科目のみを表示する
3. When ユーザーが科目クラス（BASE/AGGREGATE）でフィルタリングした時, the Subject Master Service shall 該当する科目のみを表示する
4. When ユーザーが有効フラグでフィルタリングした時, the Subject Master Service shall 有効または無効の科目のみを表示する
5. The Subject Master Service shall 複数のフィルタ条件を AND 結合で適用する
6. When フィルタ適用時に該当科目が集計構造の途中にある場合, the Subject Master Service shall 親ノードを自動展開して該当科目を表示する

---

### Requirement 11: マルチテナント・データ分離

**Objective:** As a システム運営者, I want テナント間のデータが完全に分離されること, so that 情報漏洩リスクを排除できる

#### Acceptance Criteria

1. The Subject Master Service shall すべての操作において tenant_id による絞り込みを実施する
2. The Subject Master Service shall Repository レイヤーで tenant_id を必須パラメータとして受け取る
3. The Subject Master Service shall PostgreSQL の Row Level Security (RLS) と併用してデータ分離を担保する（double-guard）
4. If 異なるテナントの科目にアクセスしようとした場合, the Subject Master Service shall アクセスを拒否する

---

### Requirement 12: 会社単位の一意性制約

**Objective:** As a システム管理者, I want 科目コードが会社内で一意であること, so that 科目を確実に識別できる

#### Acceptance Criteria

1. The Subject Master Service shall tenant_id + company_id + subject_code の組み合わせで一意性を担保する
2. If 同一会社内で重複する科目コードを登録・更新しようとした場合, the Subject Master Service shall 重複エラーを返す

---

### Requirement 13: 監査ログ

**Objective:** As a 内部統制担当者, I want 誰がいつ科目情報を変更したかを追跡できること, so that 監査・コンプライアンス要件を満たせる

#### Acceptance Criteria

1. The Subject Master Service shall 登録・更新・無効化・再有効化のすべての操作において操作ユーザーIDを記録する
2. The Subject Master Service shall 操作日時（created_at / updated_at）を自動的に記録する
3. The Subject Master Service shall 操作ユーザー（created_by / updated_by）を自動的に記録する

---

### Requirement 14: 循環参照の防止

**Objective:** As a システム管理者, I want 集計構造に循環参照が発生しないこと, so that 無限ループによるシステム障害を防止できる

#### Acceptance Criteria

1. When 新しい rollup 関係を作成する時, the Subject Master Service shall 循環参照チェックを実行する
2. If 循環参照が検出された場合, the Subject Master Service shall 「循環参照が発生するため、この構成を追加できません」エラーを返す
3. The Subject Master Service shall ドラッグ＆ドロップ操作時にも循環参照チェックを実行する
4. The Subject Master Service shall 循環参照チェックはグラフ探索アルゴリズム（DFS/BFS）で実装する
5. If 循環参照チェックでエラーが発生した場合, the Subject Master Service shall 操作をロールバックしてデータ整合性を保つ

---

### Requirement 15: 労務費単価利用可否フラグの管理

**Objective:** As a 経営企画担当者, I want 科目ごとに労務費単価マスタで使用可能かどうかを設定できること, so that 労務費単価の科目別内訳で使用する科目を制限できる

#### Acceptance Criteria

1. The Subject Master Service shall 科目に is_labor_cost_applicable（労務費単価利用可否）フラグを持つ
2. The Subject Master Service shall is_labor_cost_applicable のデフォルト値を false とする
3. When ユーザーが科目の詳細パネルで is_labor_cost_applicable を変更して保存した時, the Subject Master Service shall 当該フラグを更新する
4. The Subject Master Service shall 労務費単価マスタの科目選択において、is_labor_cost_applicable = true かつ is_active = true の科目のみを選択肢として返す
5. The Subject Master Service shall 科目タイプ（FIN/KPI）や科目クラス（BASE/AGGREGATE）に関わらず is_labor_cost_applicable を設定可能とする

---

## Out of Scope（本機能のスコープ外）

以下は別機能として実装予定であり、本機能のスコープには含まない：

- **subject_fin_attrs**: 財務属性（PL/BS区分、勘定要素、正常残高、控除科目フラグ）
- 科目の物理削除（FK参照があるため無効化のみサポート）
- 一括インポート／エクスポート機能
- 複数会社間での科目コピー機能
- 科目コードの自動採番機能
- 集計計算結果のプレビュー機能（レポート機能で実装予定）

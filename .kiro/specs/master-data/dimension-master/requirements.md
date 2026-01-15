# Requirements Document

## Introduction

ディメンションマスタは、EPM SaaSにおける「集計軸（ディメンション）とその値（Group）」を統一的に管理する機能である。

本機能は2つのエンティティを対象とする：
- **dimensions（ディメンション定義）**: IRセグメント、製品カテゴリ、得意先グループ、地域など分析軸そのものを定義
- **dimension_values（ディメンション値）**: 各ディメンションに属する値（国内事業、海外事業、製品A群など）を階層構造で管理

本機能のスコープは上記2エンティティのCRUD管理に限定し、以下は別機能として実装する：
- dimension_members（Leaf：大量コードの写し）
- dimension_member_groups（Leaf→Group分類）
- department_dimension_mappings（部門→ディメンション割当）
- project_group_mappings（プロジェクト→ディメンション値グルーピング）

dimensions.id および dimension_values.id は上記の別機能から FK 参照されるため、物理削除ではなく無効化（is_active = false）で運用する。

### 対象ユーザー
- 経営企画/管理部門の担当者
- システム管理者

### ビジネス目的
- 分析軸を一元管理し、予算・実績・見込の多次元分析を可能にする
- IRセグメント、製品カテゴリ、得意先グループなど複数の分析軸を統一インターフェースで管理する
- 将来の Fact リンク（fact_dimension_links）および部門割当（department_dimension_mappings）との連携基盤を整備する

---

## Requirements

### Requirement 1: ディメンション一覧の検索・表示

**Objective:** As a 経営企画担当者, I want ディメンション（集計軸）を一覧形式で検索・閲覧できること, so that 管理している分析軸を素早く確認できる

#### Acceptance Criteria

1. When ユーザーがディメンションマスタ画面を開いた時, the Dimension Master Service shall 当該テナントに所属するディメンション一覧を取得して表示する
2. When ユーザーが検索条件（ディメンションコード、ディメンション名、ディメンションタイプ、有効フラグ）を入力して検索を実行した時, the Dimension Master Service shall 条件に一致するディメンションのみをフィルタリングして表示する
3. When ユーザーがソート項目（ディメンションコード、ディメンション名、表示順）を選択した時, the Dimension Master Service shall 選択された項目で昇順または降順にソートして表示する
4. While ディメンション数が多い場合, the Dimension Master Service shall ページネーションにより一定件数ずつ表示する
5. The Dimension Master Service shall ディメンション一覧にディメンションコード、ディメンション名、ディメンションタイプ、階層有無、スコープポリシー、表示順、有効状態を表示する

---

### Requirement 2: ディメンションの詳細表示

**Objective:** As a 経営企画担当者, I want 特定のディメンションの詳細情報を閲覧できること, so that ディメンションの正確な設定を確認できる

#### Acceptance Criteria

1. When ユーザーがディメンション一覧から特定のディメンションを選択した時, the Dimension Master Service shall 当該ディメンションの詳細情報（全項目）を表示する
2. The Dimension Master Service shall 詳細画面にディメンションコード、ディメンション名、ディメンションタイプ、階層有無、運用上の必須フラグ、スコープポリシー、表示順、有効フラグ、作成日時、更新日時を表示する
3. If 指定されたIDのディメンションが存在しない場合, the Dimension Master Service shall 「ディメンションが見つかりません」エラーを返す

---

### Requirement 3: ディメンションの新規登録

**Objective:** As a システム管理者, I want 新しいディメンション（集計軸）を登録できること, so that 新たな分析軸を管理対象に追加できる

#### Acceptance Criteria

1. When ユーザーが必須項目（ディメンションコード、ディメンション名、ディメンションタイプ）を入力して登録を実行した時, the Dimension Master Service shall 新しいディメンションレコードを作成する
2. When ディメンションが正常に登録された時, the Dimension Master Service shall 登録されたディメンションの詳細情報を返す
3. If 同一テナント内で既に存在するディメンションコードで登録しようとした場合, the Dimension Master Service shall 「ディメンションコードが重複しています」エラーを返す
4. If 必須項目（ディメンションコード、ディメンション名、ディメンションタイプ）が入力されていない場合, the Dimension Master Service shall バリデーションエラーを返す
5. The Dimension Master Service shall 新規登録時に is_active を true として初期化する
6. The Dimension Master Service shall 登録時に created_by / updated_by に操作ユーザーIDを記録する

---

### Requirement 4: ディメンション情報の更新

**Objective:** As a システム管理者, I want 既存のディメンション情報を更新できること, so that ディメンション名変更や設定変更などに対応できる

#### Acceptance Criteria

1. When ユーザーがディメンション情報を編集して更新を実行した時, the Dimension Master Service shall 対象ディメンションのレコードを更新する
2. When ディメンション情報が正常に更新された時, the Dimension Master Service shall 更新後のディメンション詳細情報を返す
3. If 更新対象のディメンションが存在しない場合, the Dimension Master Service shall 「ディメンションが見つかりません」エラーを返す
4. If ディメンションコードを変更して既存のディメンションコードと重複する場合, the Dimension Master Service shall 「ディメンションコードが重複しています」エラーを返す
5. The Dimension Master Service shall 更新時に updated_at / updated_by を記録する

---

### Requirement 5: ディメンションの無効化

**Objective:** As a システム管理者, I want ディメンションを無効化できること, so that 使用しなくなった分析軸を一覧から除外しつつ履歴は保持できる

#### Acceptance Criteria

1. When ユーザーが有効なディメンションに対して無効化を実行した時, the Dimension Master Service shall is_active を false に更新する
2. When 無効化が正常に完了した時, the Dimension Master Service shall 更新後のディメンション詳細情報を返す
3. If 無効化対象のディメンションが存在しない場合, the Dimension Master Service shall 「ディメンションが見つかりません」エラーを返す
4. If 既に無効化されているディメンションを無効化しようとした場合, the Dimension Master Service shall 「このディメンションは既に無効化されています」エラーを返す
5. The Dimension Master Service shall 無効化時に updated_at / updated_by を記録する

---

### Requirement 6: ディメンションの再有効化

**Objective:** As a システム管理者, I want 無効化されたディメンションを再有効化できること, so that 再び使用する分析軸を管理対象に戻すことができる

#### Acceptance Criteria

1. When ユーザーが無効なディメンションに対して再有効化を実行した時, the Dimension Master Service shall is_active を true に更新する
2. When 再有効化が正常に完了した時, the Dimension Master Service shall 更新後のディメンション詳細情報を返す
3. If 再有効化対象のディメンションが存在しない場合, the Dimension Master Service shall 「ディメンションが見つかりません」エラーを返す
4. If 既に有効なディメンションを再有効化しようとした場合, the Dimension Master Service shall 「このディメンションは既に有効です」エラーを返す
5. The Dimension Master Service shall 再有効化時に updated_at / updated_by を記録する

---

### Requirement 7: ディメンション値一覧の検索・表示

**Objective:** As a 経営企画担当者, I want 特定のディメンションに属する値（Group）を一覧形式で検索・閲覧できること, so that 分析軸の値を素早く確認できる

#### Acceptance Criteria

1. When ユーザーがディメンション値マスタ画面を開いた時, the Dimension Master Service shall 指定されたディメンションに属する値一覧を取得して表示する
2. When ユーザーが検索条件（値コード、値名、スコープタイプ、有効フラグ）を入力して検索を実行した時, the Dimension Master Service shall 条件に一致する値のみをフィルタリングして表示する
3. When ユーザーがソート項目（値コード、値名、表示順、階層レベル）を選択した時, the Dimension Master Service shall 選択された項目で昇順または降順にソートして表示する
4. While ディメンション値数が多い場合, the Dimension Master Service shall ページネーションにより一定件数ずつ表示する
5. The Dimension Master Service shall ディメンション値一覧に値コード、値名、値名（短縮）、スコープタイプ、親値、階層レベル、表示順、有効状態を表示する
6. Where ディメンションが階層構造を持つ場合, the Dimension Master Service shall 階層構造をツリー形式または階層パスで視覚的に表示する

---

### Requirement 8: ディメンション値の詳細表示

**Objective:** As a 経営企画担当者, I want 特定のディメンション値の詳細情報を閲覧できること, so that 値の正確な設定を確認できる

#### Acceptance Criteria

1. When ユーザーがディメンション値一覧から特定の値を選択した時, the Dimension Master Service shall 当該値の詳細情報（全項目）を表示する
2. The Dimension Master Service shall 詳細画面に値コード、値名、値名（短縮）、スコープタイプ、スコープ会社、親値、階層レベル、階層パス、表示順、有効フラグ、作成日時、更新日時を表示する
3. If 指定されたIDのディメンション値が存在しない場合, the Dimension Master Service shall 「ディメンション値が見つかりません」エラーを返す

---

### Requirement 9: ディメンション値の新規登録

**Objective:** As a システム管理者, I want 新しいディメンション値を登録できること, so that 新たな分類値を管理対象に追加できる

#### Acceptance Criteria

1. When ユーザーが必須項目（値コード、値名、スコープタイプ）を入力して登録を実行した時, the Dimension Master Service shall 新しいディメンション値レコードを作成する
2. When ディメンション値が正常に登録された時, the Dimension Master Service shall 登録された値の詳細情報を返す
3. If 同一ディメンション内で既に存在する値コードで登録しようとした場合, the Dimension Master Service shall 「値コードが重複しています」エラーを返す
4. If 必須項目（値コード、値名、スコープタイプ）が入力されていない場合, the Dimension Master Service shall バリデーションエラーを返す
5. If スコープタイプが "company" の場合にスコープ会社IDが指定されていない場合, the Dimension Master Service shall バリデーションエラーを返す
6. The Dimension Master Service shall 新規登録時に is_active を true として初期化する
7. The Dimension Master Service shall 登録時に created_by / updated_by に操作ユーザーIDを記録する
8. Where 親値が指定された場合, the Dimension Master Service shall hierarchy_level と hierarchy_path を自動計算して設定する

---

### Requirement 10: ディメンション値情報の更新

**Objective:** As a システム管理者, I want 既存のディメンション値情報を更新できること, so that 値名変更や親値変更などに対応できる

#### Acceptance Criteria

1. When ユーザーがディメンション値情報を編集して更新を実行した時, the Dimension Master Service shall 対象値のレコードを更新する
2. When ディメンション値情報が正常に更新された時, the Dimension Master Service shall 更新後の値詳細情報を返す
3. If 更新対象のディメンション値が存在しない場合, the Dimension Master Service shall 「ディメンション値が見つかりません」エラーを返す
4. If 値コードを変更して既存の値コードと重複する場合, the Dimension Master Service shall 「値コードが重複しています」エラーを返す
5. If 親値を変更して循環参照が発生する場合, the Dimension Master Service shall 「循環参照が発生するため更新できません」エラーを返す
6. The Dimension Master Service shall 更新時に updated_at / updated_by を記録する
7. Where 親値が変更された場合, the Dimension Master Service shall hierarchy_level と hierarchy_path を再計算して更新する
8. Where 親値が変更された場合, the Dimension Master Service shall 子孫値の hierarchy_level と hierarchy_path も連鎖的に再計算して更新する

---

### Requirement 11: ディメンション値の無効化

**Objective:** As a システム管理者, I want ディメンション値を無効化できること, so that 使用しなくなった値を一覧から除外しつつ履歴は保持できる

#### Acceptance Criteria

1. When ユーザーが有効なディメンション値に対して無効化を実行した時, the Dimension Master Service shall is_active を false に更新する
2. When 無効化が正常に完了した時, the Dimension Master Service shall 更新後の値詳細情報を返す
3. If 無効化対象のディメンション値が存在しない場合, the Dimension Master Service shall 「ディメンション値が見つかりません」エラーを返す
4. If 既に無効化されているディメンション値を無効化しようとした場合, the Dimension Master Service shall 「このディメンション値は既に無効化されています」エラーを返す
5. The Dimension Master Service shall 無効化時に updated_at / updated_by を記録する

---

### Requirement 12: ディメンション値の再有効化

**Objective:** As a システム管理者, I want 無効化されたディメンション値を再有効化できること, so that 再び使用する値を管理対象に戻すことができる

#### Acceptance Criteria

1. When ユーザーが無効なディメンション値に対して再有効化を実行した時, the Dimension Master Service shall is_active を true に更新する
2. When 再有効化が正常に完了した時, the Dimension Master Service shall 更新後の値詳細情報を返す
3. If 再有効化対象のディメンション値が存在しない場合, the Dimension Master Service shall 「ディメンション値が見つかりません」エラーを返す
4. If 既に有効なディメンション値を再有効化しようとした場合, the Dimension Master Service shall 「このディメンション値は既に有効です」エラーを返す
5. The Dimension Master Service shall 再有効化時に updated_at / updated_by を記録する

---

### Requirement 13: マルチテナント・データ分離

**Objective:** As a システム運営者, I want テナント間のデータが完全に分離されること, so that 情報漏洩リスクを排除できる

#### Acceptance Criteria

1. The Dimension Master Service shall すべての操作において tenant_id による絞り込みを実施する
2. The Dimension Master Service shall Repository レイヤーで tenant_id を必須パラメータとして受け取る
3. The Dimension Master Service shall PostgreSQL の Row Level Security (RLS) と併用してデータ分離を担保する（double-guard）
4. If 異なるテナントのディメンションまたはディメンション値にアクセスしようとした場合, the Dimension Master Service shall アクセスを拒否する

---

### Requirement 14: テナント単位の一意性制約

**Objective:** As a システム管理者, I want ディメンションコードがテナント内で一意であること, so that ディメンションを確実に識別できる

#### Acceptance Criteria

1. The Dimension Master Service shall tenant_id + dimension_code の組み合わせで一意性を担保する
2. The Dimension Master Service shall tenant_id + dimension_id + value_code の組み合わせで値コードの一意性を担保する
3. If 同一テナント内で重複するディメンションコードを登録・更新しようとした場合, the Dimension Master Service shall 重複エラーを返す
4. If 同一ディメンション内で重複する値コードを登録・更新しようとした場合, the Dimension Master Service shall 重複エラーを返す

---

### Requirement 15: 監査ログ

**Objective:** As a 内部統制担当者, I want 誰がいつディメンション/ディメンション値を変更したかを追跡できること, so that 監査・コンプライアンス要件を満たせる

#### Acceptance Criteria

1. The Dimension Master Service shall 登録・更新・無効化・再有効化のすべての操作において操作ユーザーIDを記録する
2. The Dimension Master Service shall 操作日時（created_at / updated_at）を自動的に記録する
3. The Dimension Master Service shall 操作ユーザー（created_by / updated_by）を自動的に記録する

---

### Requirement 16: スコープ管理（テナント共通/会社別）

**Objective:** As a システム管理者, I want ディメンション値をテナント共通または会社別で管理できること, so that 分析軸の運用ポリシーに応じた柔軟な管理ができる

#### Acceptance Criteria

1. The Dimension Master Service shall ディメンション値の scope_type として "tenant"（テナント共通）または "company"（会社別）を選択可能とする
2. Where scope_type が "company" の場合, the Dimension Master Service shall scope_company_id を必須とする
3. Where scope_type が "tenant" の場合, the Dimension Master Service shall scope_company_id を NULL として保持する
4. The Dimension Master Service shall ディメンションの scope_policy（運用ガイド）として "tenant" または "company" を設定可能とする

---

## Out of Scope（本機能のスコープ外）

以下は別機能として実装予定であり、本機能のスコープには含まない：

- **dimension_members**: Leaf（大量コードの写し）管理（dimensions.id を参照）
- **dimension_member_groups**: Leaf→Group分類（dimension_values.id を参照）
- **department_dimension_mappings**: 部門→ディメンション値の割当/配賦
- **project_group_mappings**: プロジェクト→ディメンション値のグルーピング
- **fact_dimension_links**: Fact へのディメンション値リンク
- ディメンション/ディメンション値の物理削除（FK参照があるため無効化のみサポート）
- 一括インポート／エクスポート機能

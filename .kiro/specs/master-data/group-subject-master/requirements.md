# Requirements Document

## Introduction

連結勘定科目マスタ（group-subject-master）は、EPM SaaSにおける「連結用の統一勘定科目（グループCOA）とその集計構造」を管理する機能である。

本機能は、テナント全体で共通の連結勘定科目を定義し、各個社の会社COAをグループCOAにマッピングすることで連結財務レポートの基盤を提供する。

連結勘定科目は「通常科目（BASE）」と「集計科目（AGGREGATE）」に分類され、会社科目（subjects）と同様にツリー形式の集計構造を持つ。ただし、編集権限は**親会社のみ**に限定され、子会社は参照のみ可能である。

group_subjects.id は group_subject_mappings から FK 参照されるため、物理削除ではなく無効化（is_active = false）で運用する。

### 対象ユーザー
- 親会社の経営企画/経理財務部門の担当者
- 子会社の経理財務部門（参照のみ）
- システム管理者

### ビジネス目的
- テナント全体で統一された連結勘定科目体系を構築し、連結財務レポートの基盤とする
- グループ全体での予算・実績の比較分析を可能にする
- 連結集計構造を明示的に定義し、自動集計を実現する

---

## Entity Reference（必須）

本機能で使用するエンティティ定義を `.kiro/specs/entities/*.md` から確認し、以下を記載する：

### 対象エンティティ
- group_subjects: `.kiro/specs/entities/01_各種マスタ.md` セクション 9.1
- group_subject_rollup_items: `.kiro/specs/entities/01_各種マスタ.md` セクション 9.3
- companies: `.kiro/specs/entities/01_各種マスタ.md` セクション 1.2（親会社判定用）

### エンティティ整合性確認
- [x] 対象エンティティのカラム・型・制約を確認した
- [x] エンティティ補足のビジネスルールを要件に反映した
- [x] スコープ外の関連エンティティを Out of Scope に明記した

---

## Requirements

### Requirement 1: 連結勘定科目ツリーの表示

**Objective:** As a 経営企画担当者, I want 連結勘定科目を階層ツリー形式で閲覧できること, so that 連結集計構造を視覚的に把握できる

#### Acceptance Criteria

1. When ユーザーが連結勘定科目マスタ画面を開いた時, the Group Subject Master Service shall 当該テナント（tenant_id）に所属する連結勘定科目一覧をツリー形式で表示する
2. The Group Subject Master Service shall 集計科目（AGGREGATE）を親ノードとして、その構成科目を子ノードとしてツリー表示する
3. The Group Subject Master Service shall ルートレベルに集計親を持たない科目（トップレベル集計科目および未割当科目）を表示する
4. When ユーザーがツリーノードを展開した時, the Group Subject Master Service shall 子ノード（構成科目）を表示する
5. When ユーザーがツリーノードを折りたたんだ時, the Group Subject Master Service shall 子ノードを非表示にする
6. The Group Subject Master Service shall 各ノードに連結勘定科目コード、科目名、科目クラス（BASE/AGGREGATE）、科目タイプ（FIN/KPI）、有効状態を表示する

---

### Requirement 2: 連結勘定科目の詳細表示・編集

**Objective:** As a 親会社経営企画担当者, I want ツリーから選択した連結勘定科目の詳細情報を閲覧・編集できること, so that 連結勘定科目属性を正確に管理できる

#### Acceptance Criteria

1. When ユーザーがツリーから連結勘定科目を選択した時, the Group Subject Master Service shall 右側の詳細パネルに当該科目の全属性を表示する
2. The Group Subject Master Service shall 詳細パネルに連結勘定科目コード、科目名、科目名略称、科目クラス、科目タイプ、計上可否、メジャー種別、単位、スケール、集計方法、財務諸表区分（FINのみ）、勘定要素（FINのみ）、正常残高（FINのみ）、控除科目フラグ、有効フラグ、備考、作成日時、更新日時を表示する
3. While ユーザーが親会社でログインしている時, when ユーザーが編集モードに切り替えた時, the Group Subject Master Service shall 編集可能なフィールドを入力可能状態にする
4. While ユーザーが子会社でログインしている時, the Group Subject Master Service shall 編集操作を無効化し参照のみを許可する
5. When 親会社ユーザーが編集内容を保存した時, the Group Subject Master Service shall 連結勘定科目レコードを更新する
6. If 連結勘定科目コードを変更して既存の科目コードと重複する場合, the Group Subject Master Service shall 「連結勘定科目コードが重複しています」エラーを返す
7. The Group Subject Master Service shall 更新時に updated_at / updated_by を記録する

---

### Requirement 3: 通常科目（BASE）の新規登録

**Objective:** As a 親会社システム管理者, I want 新しい通常連結勘定科目を登録できること, so that 連結用の新たな勘定科目を追加できる

#### Acceptance Criteria

1. While ユーザーが親会社でログインしている時, when ユーザーが「通常科目を追加」を実行した時, the Group Subject Master Service shall 新規作成フォームを表示する
2. When ユーザーが必須項目（連結勘定科目コード、科目名、科目タイプ、メジャー種別、集計方法）を入力して登録を実行した時, the Group Subject Master Service shall subject_class = 'BASE' として新しい連結勘定科目レコードを作成する
3. The Group Subject Master Service shall BASE科目の posting_allowed をデフォルト true として初期化する
4. If 同一テナント内で既に存在する連結勘定科目コードで登録しようとした場合, the Group Subject Master Service shall 「連結勘定科目コードが重複しています」エラーを返す
5. If 必須項目が入力されていない場合, the Group Subject Master Service shall バリデーションエラーを返す
6. The Group Subject Master Service shall 新規登録時に is_active を true として初期化する
7. The Group Subject Master Service shall 登録時に created_by / updated_by に操作ユーザーIDを記録する
8. While ユーザーが子会社でログインしている時, the Group Subject Master Service shall 新規登録操作を拒否する

---

### Requirement 4: 集計科目（AGGREGATE）の新規登録

**Objective:** As a 親会社システム管理者, I want 新しい集計連結勘定科目を登録できること, so that 複数科目を集計する親科目を定義できる

#### Acceptance Criteria

1. While ユーザーが親会社でログインしている時, when ユーザーが「集計科目を追加」を実行した時, the Group Subject Master Service shall 新規作成フォームを表示する
2. When ユーザーが必須項目（連結勘定科目コード、科目名、科目タイプ、メジャー種別、集計方法）を入力して登録を実行した時, the Group Subject Master Service shall subject_class = 'AGGREGATE' として新しい連結勘定科目レコードを作成する
3. The Group Subject Master Service shall AGGREGATE科目の posting_allowed を強制的に false に設定する
4. If 同一テナント内で既に存在する連結勘定科目コードで登録しようとした場合, the Group Subject Master Service shall 「連結勘定科目コードが重複しています」エラーを返す
5. If 必須項目が入力されていない場合, the Group Subject Master Service shall バリデーションエラーを返す
6. The Group Subject Master Service shall 新規登録時に is_active を true として初期化する
7. The Group Subject Master Service shall 登録時に created_by / updated_by に操作ユーザーIDを記録する
8. While ユーザーが子会社でログインしている時, the Group Subject Master Service shall 新規登録操作を拒否する

---

### Requirement 5: 集計構造（Rollup）の定義

**Objective:** As a 親会社経営企画担当者, I want 集計科目に構成科目を追加・編集できること, so that 連結集計ロジックを定義できる

#### Acceptance Criteria

1. While ユーザーが親会社でログインしている時, when ユーザーが集計科目を選択して「構成科目を追加」を実行した時, the Group Subject Master Service shall 構成科目選択ダイアログを表示する
2. When ユーザーが構成科目と係数を指定して追加を実行した時, the Group Subject Master Service shall group_subject_rollup_items レコードを作成する
3. The Group Subject Master Service shall 係数（coefficient）として +1 または -1 のみを許可する（Phase 1）
4. When ユーザーが既存の構成科目の係数を変更した時, the Group Subject Master Service shall group_subject_rollup_items レコードを更新する
5. When ユーザーが構成科目を削除した時, the Group Subject Master Service shall 該当の group_subject_rollup_items レコードを削除する
6. The Group Subject Master Service shall sort_order により構成科目の表示順序を管理する
7. If 同一の親子関係が既に存在する場合, the Group Subject Master Service shall 「この構成科目は既に追加されています」エラーを返す
8. While ユーザーが子会社でログインしている時, the Group Subject Master Service shall 集計構造の編集操作を拒否する

---

### Requirement 6: ドラッグ＆ドロップによる構造編集

**Objective:** As a 親会社経営企画担当者, I want ツリー上でドラッグ＆ドロップで構成科目を移動できること, so that 直感的に連結集計構造を編集できる

#### Acceptance Criteria

1. While ユーザーが親会社でログインしている時, when ユーザーが科目ノードをドラッグして別の集計科目にドロップした時, the Group Subject Master Service shall 移動元の rollup 関係を削除し、移動先の rollup 関係を作成する
2. When ユーザーが科目ノードをルートレベルにドロップした時, the Group Subject Master Service shall 既存の rollup 関係を削除し、未割当状態にする
3. If ドロップ先が通常科目（BASE）の場合, the Group Subject Master Service shall 「通常科目の下には配置できません」エラーを表示する
4. The Group Subject Master Service shall ドロップ後に循環参照チェックを実行し、問題があればエラーを表示してロールバックする
5. The Group Subject Master Service shall ドラッグ中にドロップ可能な位置を視覚的に示す
6. While ユーザーが子会社でログインしている時, the Group Subject Master Service shall ドラッグ＆ドロップ操作を無効化する

---

### Requirement 7: 科目のコピー＆ペースト

**Objective:** As a 親会社経営企画担当者, I want 科目をコピーして別の集計科目に追加できること, so that 同じ科目を複数の集計に含めることができる

#### Acceptance Criteria

1. While ユーザーが親会社でログインしている時, when ユーザーが科目を選択してコピーを実行した時, the Group Subject Master Service shall クリップボードに科目参照を保持する
2. When ユーザーが集計科目を選択してペーストを実行した時, the Group Subject Master Service shall 新しい rollup 関係を作成する
3. The Group Subject Master Service shall ペースト時にデフォルト係数 +1 を設定する（後から編集可能）
4. If ペースト先に同一科目が既に存在する場合, the Group Subject Master Service shall 「この構成科目は既に追加されています」エラーを表示する
5. The Group Subject Master Service shall ペースト後に循環参照チェックを実行する
6. While ユーザーが子会社でログインしている時, the Group Subject Master Service shall コピー＆ペースト操作を無効化する

---

### Requirement 8: 連結勘定科目の無効化

**Objective:** As a 親会社システム管理者, I want 連結勘定科目を無効化できること, so that 使用しなくなった科目を一覧から除外しつつ履歴は保持できる

#### Acceptance Criteria

1. While ユーザーが親会社でログインしている時, when ユーザーが有効な連結勘定科目に対して無効化を実行した時, the Group Subject Master Service shall is_active を false に更新する
2. When 無効化が正常に完了した時, the Group Subject Master Service shall 更新後の科目詳細情報を返す
3. If 無効化対象の科目が存在しない場合, the Group Subject Master Service shall 「連結勘定科目が見つかりません」エラーを返す
4. If 既に無効化されている科目を無効化しようとした場合, the Group Subject Master Service shall 「この科目は既に無効化されています」エラーを返す
5. When 集計科目を無効化した時, the Group Subject Master Service shall その科目が親となっている rollup 関係を削除する（子科目自体は無効化せず、有効なまま残る）
6. The Group Subject Master Service shall 無効化時に updated_at / updated_by を記録する
7. While ユーザーが子会社でログインしている時, the Group Subject Master Service shall 無効化操作を拒否する

---

### Requirement 9: 連結勘定科目の再有効化

**Objective:** As a 親会社システム管理者, I want 無効化された連結勘定科目を再有効化できること, so that 再び使用する科目を管理対象に戻すことができる

#### Acceptance Criteria

1. While ユーザーが親会社でログインしている時, when ユーザーが無効な連結勘定科目に対して再有効化を実行した時, the Group Subject Master Service shall is_active を true に更新する
2. When 再有効化が正常に完了した時, the Group Subject Master Service shall 更新後の科目詳細情報を返す
3. If 再有効化対象の科目が存在しない場合, the Group Subject Master Service shall 「連結勘定科目が見つかりません」エラーを返す
4. If 既に有効な科目を再有効化しようとした場合, the Group Subject Master Service shall 「この科目は既に有効です」エラーを返す
5. The Group Subject Master Service shall 再有効化時に updated_at / updated_by を記録する
6. While ユーザーが子会社でログインしている時, the Group Subject Master Service shall 再有効化操作を拒否する

---

### Requirement 10: 連結勘定科目のフィルタリング・検索

**Objective:** As a 経営企画担当者, I want 連結勘定科目をフィルタリング・検索できること, so that 大量の科目から必要なものを素早く見つけられる

#### Acceptance Criteria

1. When ユーザーが検索キーワードを入力した時, the Group Subject Master Service shall 連結勘定科目コードまたは科目名に部分一致する科目をハイライト表示する
2. When ユーザーが科目タイプ（FIN/KPI）でフィルタリングした時, the Group Subject Master Service shall 該当する科目のみを表示する
3. When ユーザーが科目クラス（BASE/AGGREGATE）でフィルタリングした時, the Group Subject Master Service shall 該当する科目のみを表示する
4. When ユーザーが有効フラグでフィルタリングした時, the Group Subject Master Service shall 有効または無効の科目のみを表示する
5. The Group Subject Master Service shall 複数のフィルタ条件を AND 結合で適用する
6. When フィルタ適用時に該当科目が集計構造の途中にある場合, the Group Subject Master Service shall 親ノードを自動展開して該当科目を表示する

---

### Requirement 11: 親会社権限の判定

**Objective:** As a システム運営者, I want 親会社と子会社を正しく判定できること, so that 権限制御を適切に行える

#### Acceptance Criteria

1. The Group Subject Master Service shall ログイン時の会社情報（company_id）から companies.parent_company_id を参照して親子判定を行う
2. If companies.parent_company_id IS NULL の場合, the Group Subject Master Service shall 当該会社を親会社として判定する
3. If companies.parent_company_id IS NOT NULL の場合, the Group Subject Master Service shall 当該会社を子会社として判定する
4. The Group Subject Master Service shall 親会社判定結果を画面ヘッダーまたはコンテキストに表示する

---

### Requirement 12: マルチテナント・データ分離

**Objective:** As a システム運営者, I want テナント間のデータが完全に分離されること, so that 情報漏洩リスクを排除できる

#### Acceptance Criteria

1. The Group Subject Master Service shall すべての操作において tenant_id による絞り込みを実施する
2. The Group Subject Master Service shall Repository レイヤーで tenant_id を必須パラメータとして受け取る
3. The Group Subject Master Service shall PostgreSQL の Row Level Security (RLS) と併用してデータ分離を担保する（double-guard）
4. If 異なるテナントの連結勘定科目にアクセスしようとした場合, the Group Subject Master Service shall アクセスを拒否する

---

### Requirement 13: テナント単位の一意性制約

**Objective:** As a システム管理者, I want 連結勘定科目コードがテナント内で一意であること, so that 科目を確実に識別できる

#### Acceptance Criteria

1. The Group Subject Master Service shall tenant_id + group_subject_code の組み合わせで一意性を担保する
2. If 同一テナント内で重複する連結勘定科目コードを登録・更新しようとした場合, the Group Subject Master Service shall 重複エラーを返す

---

### Requirement 14: 監査ログ

**Objective:** As a 内部統制担当者, I want 誰がいつ連結勘定科目情報を変更したかを追跡できること, so that 監査・コンプライアンス要件を満たせる

#### Acceptance Criteria

1. The Group Subject Master Service shall 登録・更新・無効化・再有効化のすべての操作において操作ユーザーIDを記録する
2. The Group Subject Master Service shall 操作日時（created_at / updated_at）を自動的に記録する
3. The Group Subject Master Service shall 操作ユーザー（created_by / updated_by）を自動的に記録する

---

### Requirement 15: 循環参照の防止

**Objective:** As a システム管理者, I want 集計構造に循環参照が発生しないこと, so that 無限ループによるシステム障害を防止できる

#### Acceptance Criteria

1. When 新しい rollup 関係を作成する時, the Group Subject Master Service shall 循環参照チェックを実行する
2. If 循環参照が検出された場合, the Group Subject Master Service shall 「循環参照が発生するため、この構成を追加できません」エラーを返す
3. The Group Subject Master Service shall ドラッグ＆ドロップ操作時にも循環参照チェックを実行する
4. The Group Subject Master Service shall 循環参照チェックはグラフ探索アルゴリズム（DFS/BFS）で実装する
5. If 循環参照チェックでエラーが発生した場合, the Group Subject Master Service shall 操作をロールバックしてデータ整合性を保つ

---

## Out of Scope（本機能のスコープ外）

以下は別機能として実装予定であり、本機能のスコープには含まない：

- **group_subject_mappings**: 会社COA→連結COAのマッピング機能（group-subject-mapping として別Feature）
- 連結勘定科目の物理削除（FK参照があるため無効化のみサポート）
- 一括インポート／エクスポート機能
- 複数テナント間での連結勘定科目コピー機能
- 連結勘定科目コードの自動採番機能
- 連結集計計算結果のプレビュー機能（レポート機能で実装予定）
- 期間管理（valid_from/valid_to）による集計構造のバージョン管理（Phase 2 以降）
- 係数の柔軟な設定（+1/-1 以外の係数はPhase 2 以降）

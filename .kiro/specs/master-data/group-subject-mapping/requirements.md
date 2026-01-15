# Requirements Document

## Introduction

連結科目マッピング（group-subject-mapping）は、EPM SaaSにおける「会社COA（会社科目）から連結COA（グループ科目）へのマッピング」を管理する機能である。

本機能により、各個社が自社の会社科目を連結勘定科目にマッピングすることで、連結財務レポートにおける科目変換・集計の基盤を提供する。

マッピングは**1会社科目 = 1連結勘定科目**のシンプルな1:1構造とし、各個社が自社分のマッピングを設定する。係数（coefficient）は原則+1、控除科目は-1を使用する（Phase 1では+1/-1のみサポート）。

group_subject_mappings.id は物理削除可能だが、論理削除（is_active = false）での運用も可能。

### 対象ユーザー
- 親会社の経営企画/経理財務部門の担当者（自社マッピング設定）
- 子会社の経理財務部門（自社マッピング設定）
- システム管理者

### ビジネス目的
- 会社別の勘定科目体系を連結用の統一科目にマッピングする
- 連結財務レポートにおける科目変換ルールを明確に定義する
- 各個社が自社の科目マッピングを自律的に管理できるようにする

---

## Entity Reference（必須）

本機能で使用するエンティティ定義を `.kiro/specs/entities/*.md` から確認し、以下を記載する：

### 対象エンティティ
- group_subject_mappings: `.kiro/specs/entities/01_各種マスタ.md` セクション 9.2
- subjects: `.kiro/specs/entities/01_各種マスタ.md` セクション 6.1（会社科目参照用）
- group_subjects: `.kiro/specs/entities/01_各種マスタ.md` セクション 9.1（連結科目参照用）
- group_subject_rollup_items: `.kiro/specs/entities/01_各種マスタ.md` セクション 9.3（連結科目ツリー構造参照用）
- subject_fin_attrs: `.kiro/specs/entities/01_各種マスタ.md` セクション 6.3（FIN科目の控除科目フラグ参照用）
- companies: `.kiro/specs/entities/01_各種マスタ.md` セクション 1.2（会社参照用）

### エンティティ整合性確認
- [x] 対象エンティティのカラム・型・制約を確認した
- [x] エンティティ補足のビジネスルールを要件に反映した
- [x] スコープ外の関連エンティティを Out of Scope に明記した

---

## Requirements

### Requirement 1: 会社科目マッピング一覧の表示

**Objective:** As a 経理財務担当者, I want 自社の会社科目と連結科目のマッピング状況を一覧で確認できること, so that マッピング漏れや設定状況を把握できる

#### Acceptance Criteria

1. When ユーザーがマッピング管理画面を開いた時, the Group Subject Mapping Service shall 当該会社（company_id）の会社科目一覧とそのマッピング状況を表示する
2. The Group Subject Mapping Service shall 各会社科目に対して、マッピング先の連結科目（存在する場合）を表示する
3. The Group Subject Mapping Service shall マッピング未設定の会社科目を視覚的に区別して表示する
4. The Group Subject Mapping Service shall 会社科目コード、会社科目名、連結科目コード、連結科目名、係数、有効状態を一覧に表示する
5. The Group Subject Mapping Service shall マッピング設定済み件数/全会社科目件数を画面上部に表示する

---

### Requirement 2: マッピング詳細の表示・編集

**Objective:** As a 経理財務担当者, I want 会社科目のマッピング詳細を閲覧・編集できること, so that マッピング設定を正確に管理できる

#### Acceptance Criteria

1. When ユーザーが会社科目を選択した時, the Group Subject Mapping Service shall マッピング詳細パネルに会社科目情報とマッピング情報を表示する
2. The Group Subject Mapping Service shall 詳細パネルに会社科目コード、会社科目名、科目クラス、科目タイプ、マッピング先連結科目、係数、マッピングメモ、有効フラグ、作成日時、更新日時を表示する
3. When ユーザーが編集モードに切り替えた時, the Group Subject Mapping Service shall 編集可能なフィールド（マッピング先連結科目、係数、マッピングメモ、有効フラグ）を入力可能状態にする
4. When ユーザーが編集内容を保存した時, the Group Subject Mapping Service shall group_subject_mappings レコードを更新する
5. The Group Subject Mapping Service shall 更新時に updated_at / updated_by を記録する

---

### Requirement 3: マッピングの新規登録

**Objective:** As a 経理財務担当者, I want 会社科目に連結科目をマッピングできること, so that 連結レポートで使用する科目変換ルールを定義できる

#### Acceptance Criteria

1. When ユーザーがマッピング未設定の会社科目を選択して「マッピング設定」を実行した時, the Group Subject Mapping Service shall 連結科目選択ダイアログを表示する
2. When ユーザーが連結科目を選択してマッピングを確定した時, the Group Subject Mapping Service shall 新しい group_subject_mappings レコードを作成する
3. The Group Subject Mapping Service shall 係数（coefficient）のデフォルト値を +1 に設定する
4. The Group Subject Mapping Service shall 係数として +1 または -1 のみを許可する（Phase 1）
5. If 会社科目がFIN科目かつ subject_fin_attrs.is_contra = true（控除科目）の場合, the Group Subject Mapping Service shall 係数のデフォルト値を -1 に設定する
6. If 同一会社科目に対して既にマッピングが存在する場合, the Group Subject Mapping Service shall 「この会社科目は既にマッピングされています」エラーを返す
7. The Group Subject Mapping Service shall 新規登録時に is_active を true として初期化する
8. The Group Subject Mapping Service shall 登録時に created_by / updated_by に操作ユーザーIDを記録する

---

### Requirement 4: 連結科目の選択UI

**Objective:** As a 経理財務担当者, I want 連結科目を簡単に選択できること, so that マッピング設定を効率的に行える

#### Acceptance Criteria

1. When 連結科目選択ダイアログを開いた時, the Group Subject Mapping Service shall 有効な連結科目一覧を group_subject_rollup_items の関係に基づくツリー形式で表示する
2. When ユーザーが検索キーワードを入力した時, the Group Subject Mapping Service shall 連結科目コードまたは科目名に部分一致する科目をフィルタリングする
3. When ユーザーが科目タイプ（FIN/KPI）でフィルタリングした時, the Group Subject Mapping Service shall 該当する科目のみを表示する
4. The Group Subject Mapping Service shall 会社科目の科目タイプと同じ科目タイプの連結科目を推奨としてハイライト表示する
5. When ユーザーが連結科目を選択した時, the Group Subject Mapping Service shall 選択された科目情報を確定し、ダイアログを閉じる

---

### Requirement 5: マッピングの変更

**Objective:** As a 経理財務担当者, I want 既存のマッピング先を変更できること, so that 組織変更や科目体系の見直しに対応できる

#### Acceptance Criteria

1. When ユーザーがマッピング済み科目を選択して「マッピング変更」を実行した時, the Group Subject Mapping Service shall 連結科目選択ダイアログを表示する
2. The Group Subject Mapping Service shall 現在のマッピング先科目を選択状態で表示する
3. When ユーザーが別の連結科目を選択して確定した時, the Group Subject Mapping Service shall group_subject_mappings.group_subject_id を更新する
4. The Group Subject Mapping Service shall 変更時に updated_at / updated_by を記録する

---

### Requirement 6: マッピングの削除

**Objective:** As a 経理財務担当者, I want マッピングを削除できること, so that 不要なマッピングを解除できる

#### Acceptance Criteria

1. When ユーザーがマッピング済み科目を選択して「マッピング解除」を実行した時, the Group Subject Mapping Service shall 確認ダイアログを表示する
2. When ユーザーが確認ダイアログで「削除」を選択した時, the Group Subject Mapping Service shall group_subject_mappings レコードを削除する
3. When マッピング解除が完了した時, the Group Subject Mapping Service shall 一覧の該当行を「マッピング未設定」状態に更新する
4. If 削除対象のマッピングが存在しない場合, the Group Subject Mapping Service shall 「マッピングが見つかりません」エラーを返す

---

### Requirement 7: 一括マッピング設定

**Objective:** As a 経理財務担当者, I want 複数の会社科目を一括でマッピング設定できること, so that 初期設定や大量の科目マッピングを効率的に行える

#### Acceptance Criteria

1. When ユーザーが複数の会社科目を選択して「一括マッピング」を実行した時, the Group Subject Mapping Service shall 一括マッピングダイアログを表示する
2. When ユーザーが連結科目を選択して確定した時, the Group Subject Mapping Service shall 選択された全会社科目に対して同一の連結科目へのマッピングを作成する
3. The Group Subject Mapping Service shall 既にマッピング済みの科目はスキップし、スキップされた件数を結果として表示する
4. The Group Subject Mapping Service shall 一括登録の成功件数、スキップ件数を結果として表示する

---

### Requirement 8: マッピングのフィルタリング・検索

**Objective:** As a 経理財務担当者, I want マッピング一覧をフィルタリング・検索できること, so that 大量の科目から必要なものを素早く見つけられる

#### Acceptance Criteria

1. When ユーザーが検索キーワードを入力した時, the Group Subject Mapping Service shall 会社科目コード、会社科目名、連結科目コード、連結科目名に部分一致するマッピングを表示する
2. When ユーザーが「マッピング済み」でフィルタリングした時, the Group Subject Mapping Service shall マッピングが設定されている科目のみを表示する
3. When ユーザーが「マッピング未設定」でフィルタリングした時, the Group Subject Mapping Service shall マッピングが設定されていない科目のみを表示する
4. When ユーザーが科目タイプ（FIN/KPI）でフィルタリングした時, the Group Subject Mapping Service shall 該当する科目のみを表示する
5. When ユーザーが科目クラス（BASE/AGGREGATE）でフィルタリングした時, the Group Subject Mapping Service shall 該当する科目のみを表示する
6. When ユーザーが有効フラグでフィルタリングした時, the Group Subject Mapping Service shall 有効または無効のマッピングのみを表示する
7. The Group Subject Mapping Service shall 複数のフィルタ条件を AND 結合で適用する

---

### Requirement 9: マッピングの無効化

**Objective:** As a 経理財務担当者, I want マッピングを無効化できること, so that 一時的に無効にしたいマッピングを削除せずに保持できる

#### Acceptance Criteria

1. When ユーザーが有効なマッピングに対して無効化を実行した時, the Group Subject Mapping Service shall is_active を false に更新する
2. When 無効化が正常に完了した時, the Group Subject Mapping Service shall 更新後のマッピング情報を返す
3. If 既に無効化されているマッピングを無効化しようとした場合, the Group Subject Mapping Service shall 「このマッピングは既に無効化されています」エラーを返す
4. The Group Subject Mapping Service shall 無効化時に updated_at / updated_by を記録する

---

### Requirement 10: マッピングの再有効化

**Objective:** As a 経理財務担当者, I want 無効化されたマッピングを再有効化できること, so that 再び使用するマッピングを有効に戻せる

#### Acceptance Criteria

1. When ユーザーが無効なマッピングに対して再有効化を実行した時, the Group Subject Mapping Service shall is_active を true に更新する
2. When 再有効化が正常に完了した時, the Group Subject Mapping Service shall 更新後のマッピング情報を返す
3. If 既に有効なマッピングを再有効化しようとした場合, the Group Subject Mapping Service shall 「このマッピングは既に有効です」エラーを返す
4. The Group Subject Mapping Service shall 再有効化時に updated_at / updated_by を記録する

---

### Requirement 11: 自社マッピングのみ操作可能

**Objective:** As a システム運営者, I want 各会社が自社のマッピングのみを操作できること, so that 他社のマッピングを誤って変更するリスクを防止できる

#### Acceptance Criteria

1. The Group Subject Mapping Service shall ログイン時の会社情報（company_id）と一致するマッピングのみを表示・編集可能にする
2. The Group Subject Mapping Service shall 他社のマッピング情報へのアクセスを拒否する
3. If 他社のマッピングを参照・操作しようとした場合, the Group Subject Mapping Service shall アクセス拒否エラーを返す

---

### Requirement 12: マルチテナント・データ分離

**Objective:** As a システム運営者, I want テナント間のデータが完全に分離されること, so that 情報漏洩リスクを排除できる

#### Acceptance Criteria

1. The Group Subject Mapping Service shall すべての操作において tenant_id による絞り込みを実施する
2. The Group Subject Mapping Service shall Repository レイヤーで tenant_id を必須パラメータとして受け取る
3. The Group Subject Mapping Service shall PostgreSQL の Row Level Security (RLS) と併用してデータ分離を担保する（double-guard）
4. If 異なるテナントのマッピングにアクセスしようとした場合, the Group Subject Mapping Service shall アクセスを拒否する

---

### Requirement 13: 1:1マッピングの一意性制約

**Objective:** As a システム管理者, I want 1会社科目に対して1連結科目のみマッピングできること, so that マッピングの重複を防止できる

#### Acceptance Criteria

1. The Group Subject Mapping Service shall tenant_id + company_id + company_subject_id の組み合わせで一意性を担保する
2. If 同一会社科目に対して複数のマッピングを登録しようとした場合, the Group Subject Mapping Service shall 「この会社科目は既にマッピングされています」エラーを返す

---

### Requirement 14: 監査ログ

**Objective:** As a 内部統制担当者, I want 誰がいつマッピング情報を変更したかを追跡できること, so that 監査・コンプライアンス要件を満たせる

#### Acceptance Criteria

1. The Group Subject Mapping Service shall 登録・更新・削除・無効化・再有効化のすべての操作において操作ユーザーIDを記録する
2. The Group Subject Mapping Service shall 操作日時（created_at / updated_at）を自動的に記録する
3. The Group Subject Mapping Service shall 操作ユーザー（created_by / updated_by）を自動的に記録する

---

### Requirement 15: 係数の制約

**Objective:** As a システム管理者, I want 係数が+1または-1のみに制限されること, so that Phase 1の仕様に準拠した運用ができる

#### Acceptance Criteria

1. The Group Subject Mapping Service shall 係数（coefficient）として +1.0000 または -1.0000 のみを許可する
2. If +1/-1 以外の係数を設定しようとした場合, the Group Subject Mapping Service shall 「係数は+1または-1のみ指定できます」エラーを返す
3. The Group Subject Mapping Service shall 係数入力UIでプルダウン選択（+1 / -1）を提供する

---

## Out of Scope（本機能のスコープ外）

以下は別機能として実装予定であり、本機能のスコープには含まない：

- **group_subjects**: 連結勘定科目マスタの管理（group-subject-master として別Feature）
- **group_subject_rollup_items**: 連結集計構造の定義（group-subject-master として別Feature）
- 一括インポート／エクスポート機能（CSV/Excel）
- マッピング履歴の詳細閲覧機能
- 期間管理（valid_from/valid_to）によるマッピングのバージョン管理（Phase 2 以降）
- 按分マッピング（coefficient = 0.5 等）のサポート（Phase 2 以降）
- 会社科目1つを複数連結科目にマッピングする機能（N:M マッピング、Phase 2 以降）
- 自動マッピング推奨機能（科目コード・名称の類似度に基づく）
- マッピングテンプレート機能（他社のマッピングを参考にコピー）

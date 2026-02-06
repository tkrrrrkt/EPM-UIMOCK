# Requirements Document

## Introduction

本ドキュメントは、EPM（Enterprise Performance Management）システムにおける多次元分析（OLAP）UI機能の要件を定義する。経営管理者・FP&A担当者が、予算・実績・見込データを多次元的に分析し、経営判断に必要なインサイトを得るための機能を提供する。

AG Grid Enterprise Pivot をベースとし、ドラッグ＆ドロップによる柔軟なレイアウト構成、ドリルダウン・ドリルスルーによる詳細分析を可能とする。

---

## Spec Reference（INPUT情報）

本要件を作成するにあたり、以下の情報を確認した：

### 仕様概要（確定済み仕様）
- **参照ファイル**: `.kiro/specs/仕様概要/ディメンション管理.md`
- **確認日**: 2026-02-05
- **主要な仕様ポイント**:
  - 3層ディメンション構造（dimensions → dimension_values → dimension_members）
  - Factへの付与は Group（dimension_values）のみ
  - IRセグメントは Fact固定列（NULL可）

### 仕様検討（経緯・背景）※参考
- **参照ファイル**: V0プロジェクト `/Users/ktkrr/root/99_work/multidimensional-analysis-workbench`
- **経緯メモ**: V0でOLAP UIのプロトタイプを作成。Zustandによる状態管理、DnDによるフィールド配置、AG Grid/SyncFusion切替機能を実装済み。本機能ではAG Grid Enterprise Pivotベースで再実装する。

---

## Entity Reference（必須）

本機能で使用するエンティティ定義を `.kiro/specs/entities/*.md` から確認し、以下を記載する：

### 対象エンティティ
- **fact_amounts**: `.kiro/specs/entities/02_トランザクション・残高.md` セクション 3.1
- **fact_dimension_links**: `.kiro/specs/entities/02_トランザクション・残高.md` セクション 3.2
- **dimensions**: `.kiro/specs/entities/01_各種マスタ.md` セクション ディメンション関連
- **dimension_values**: `.kiro/specs/entities/01_各種マスタ.md` セクション ディメンション関連
- **subjects**: `.kiro/specs/entities/01_各種マスタ.md` セクション 科目
- **departments**: `.kiro/specs/entities/01_各種マスタ.md` セクション 組織
- **accounting_periods**: `.kiro/specs/entities/01_各種マスタ.md` セクション 会計期間

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

### Requirement 1: ピボットレイアウト構成

**Objective:** As a FP&A担当者, I want ドラッグ＆ドロップでピボットの行・列・値・フィルターを自由に構成したい, so that 分析目的に応じた最適なレイアウトで経営数値を確認できる

#### Acceptance Criteria

1. When ユーザーがフィールドパレットからフィールドをドラッグして行ゾーンにドロップしたとき, the Multidim Analysis Service shall 当該フィールドをピボットの行軸に追加し、グリッドを再描画する

2. When ユーザーがフィールドパレットからフィールドをドラッグして列ゾーンにドロップしたとき, the Multidim Analysis Service shall 当該フィールドをピボットの列軸に追加し、グリッドを再描画する

3. When ユーザーがフィールドパレットからフィールドをドラッグして値ゾーンにドロップしたとき, the Multidim Analysis Service shall 当該メジャーをピボットの値領域に追加し、グリッドを再描画する

4. When ユーザーがフィールドパレットからフィールドをドラッグしてフィルターゾーンにドロップしたとき, the Multidim Analysis Service shall 当該フィールドをフィルター条件として追加し、グリッドを再描画する

5. If 行軸に既に2つのフィールドが配置されている状態で3つ目のフィールドを追加しようとしたとき, the Multidim Analysis Service shall エラーメッセージ「行軸は最大2つまでです」を表示し、追加を拒否する

6. While ピボットレイアウトが構成されている間, the Multidim Analysis Service shall 現在のレイアウト状態をローカルストレージに永続化する

7. The Multidim Analysis Service shall フィールドの表示名を日本語で表示する

---

### Requirement 2: グローバルフィルター

**Objective:** As a 経営企画担当者, I want 期間・シナリオ・バージョン・表示単位を一括で指定したい, so that 分析対象のデータ範囲を明確に制御できる

#### Acceptance Criteria

1. When ユーザーが期間範囲（From/To）を変更したとき, the Multidim Analysis Service shall 指定された期間範囲のデータのみを集計対象として再クエリする

2. When ユーザーがシナリオ（BUDGET/FORECAST/ACTUAL）を変更したとき, the Multidim Analysis Service shall 指定されたシナリオタイプのデータのみを集計対象として再クエリする

3. When ユーザーがバージョンを変更したとき, the Multidim Analysis Service shall 指定されたプランバージョンのデータのみを集計対象として再クエリする

4. When ユーザーが表示単位（円/千円/百万円）を変更したとき, the Multidim Analysis Service shall セル値を選択された単位で換算して表示する

5. The Multidim Analysis Service shall デフォルト期間として当年度（4月〜翌3月）を設定する

6. The Multidim Analysis Service shall デフォルトシナリオとして「ACTUAL」を設定する

7. The Multidim Analysis Service shall デフォルト表示単位として「千円」を設定する

---

### Requirement 3: ピボット集計・表示

**Objective:** As a FP&A担当者, I want レイアウト構成に応じたピボットテーブルを表示したい, so that 経営数値を多次元的に分析できる

#### Acceptance Criteria

1. When ピボットレイアウトが有効な状態でクエリが実行されたとき, the Multidim Analysis Service shall AG Grid Enterprise Pivot を使用してピボットテーブルを描画する

2. When ピボットテーブルが描画されたとき, the Multidim Analysis Service shall 行ヘッダーと列ヘッダーを階層的に表示する

3. When ピボットテーブルが描画されたとき, the Multidim Analysis Service shall 数値セルに3桁カンマ区切りフォーマットを適用する

4. While データをロード中, the Multidim Analysis Service shall ローディングインジケーターを表示する

5. If クエリ結果が0件のとき, the Multidim Analysis Service shall 「該当するデータがありません」メッセージを表示する

6. The Multidim Analysis Service shall 行の小計・総計を自動計算して表示する

7. The Multidim Analysis Service shall 列の小計・総計を自動計算して表示する

8. When 集計結果の行数が1000行を超えるとき, the Multidim Analysis Service shall サーバーサイド集計（SSRM）を使用してページング処理を行う

---

### Requirement 4: 分析モード

**Objective:** As a FP&A担当者, I want 標準分析モードとプロジェクト分析モードを切り替えたい, so that 部門別分析とプロジェクト別分析を適切に使い分けられる

#### Acceptance Criteria

1. When ユーザーが「標準分析モード」を選択したとき, the Multidim Analysis Service shall DimX系フィールド（得意先グループ・担当社員・商品カテゴリ）を使用可能にする

2. When ユーザーが「プロジェクト分析モード」を選択したとき, the Multidim Analysis Service shall プロジェクトフィールドを使用可能にし、DimX系フィールドを無効化する

3. If 標準分析モードでプロジェクトフィールドをドロップしようとしたとき, the Multidim Analysis Service shall エラーメッセージ「プロジェクトはPJ分析モードでのみ使用できます」を表示し、追加を拒否する

4. If プロジェクト分析モードでDimX系フィールドをドロップしようとしたとき, the Multidim Analysis Service shall エラーメッセージ「PJ分析モードではDimXは使用できません」を表示し、追加を拒否する

5. When 分析モードを切り替えたとき, the Multidim Analysis Service shall 現在のレイアウトから無効になるフィールドを自動的に除去する

---

### Requirement 5: DimX相互排他ルール

**Objective:** As a FP&A担当者, I want DimX系フィールドの同時使用を制限したい, so that 分析の一貫性を保てる

#### Acceptance Criteria

1. If 既にDimX系フィールド（得意先グループ/担当社員/商品カテゴリ）が配置されている状態で、異なるDimX系フィールドを追加しようとしたとき, the Multidim Analysis Service shall エラーメッセージ「DimXは同時に1つまでしか使用できません」を表示し、追加を拒否する

2. When 同一のDimX系フィールドを別のゾーンに移動したとき, the Multidim Analysis Service shall 元のゾーンからフィールドを削除し、新しいゾーンに追加する

3. The Multidim Analysis Service shall DimX相互排他ルールを行軸・列軸・フィルターのすべてのゾーンに適用する

---

### Requirement 6: ドリルダウン

**Objective:** As a 経営企画担当者, I want セルをクリックして下位階層の内訳を確認したい, so that 差異の要因を特定できる

#### Acceptance Criteria

1. When ユーザーがピボットセルをクリックしたとき, the Multidim Analysis Service shall セル情報（行条件・列条件・値）をドリルパネルに表示する

2. When ユーザーがドリルダウンディメンションを選択したとき, the Multidim Analysis Service shall 選択されたセル条件に基づき、指定ディメンションの内訳を取得して表示する

3. When ドリルダウン結果が表示されたとき, the Multidim Analysis Service shall 各内訳項目の金額と構成比率を表示する

4. The Multidim Analysis Service shall ドリルダウン結果をTop N（デフォルト10件）で制限する

5. When ユーザーがドリルダウン結果の項目をクリックしたとき, the Multidim Analysis Service shall さらに下位のドリルダウンを実行する

---

### Requirement 7: ドリルスルー

**Objective:** As a FP&A担当者, I want セルの元データ（明細）を確認したい, so that 集計値の根拠を確認できる

#### Acceptance Criteria

1. When ユーザーがセルを選択してドリルスルーを実行したとき, the Multidim Analysis Service shall 当該セルの集計条件に合致する明細データを取得する

2. When ドリルスルー結果が表示されたとき, the Multidim Analysis Service shall 明細データを日付・組織・科目・金額・ディメンション値を含むテーブル形式で表示する

3. The Multidim Analysis Service shall ドリルスルー結果をページング形式で表示する（デフォルト20件/ページ）

4. When ユーザーがドリルスルー結果でページングを操作したとき, the Multidim Analysis Service shall 次/前のページのデータを取得して表示する

5. The Multidim Analysis Service shall ドリルスルー結果の総件数を表示する

---

### Requirement 8: レイアウトプリセット

**Objective:** As a 経営企画担当者, I want よく使うレイアウトをプリセットとして呼び出したい, so that 分析作業を効率化できる

#### Acceptance Criteria

1. When ユーザーがプリセット一覧からプリセットを選択したとき, the Multidim Analysis Service shall 保存されたレイアウト設定をピボットに適用する

2. The Multidim Analysis Service shall システム定義のプリセット（部門別売上、科目別推移、得意先別分析等）を提供する

3. When ユーザーがレイアウトをリセットしたとき, the Multidim Analysis Service shall デフォルトレイアウト（行:組織・科目、列:期間、値:金額）を適用する

---

### Requirement 9: URL共有

**Objective:** As a FP&A担当者, I want 現在の分析状態をURLとして共有したい, so that チームメンバーと同じ視点で分析を共有できる

#### Acceptance Criteria

1. When ユーザーが「URLをコピー」を実行したとき, the Multidim Analysis Service shall 現在のレイアウト状態をBase64エンコードしたURLをクリップボードにコピーする

2. When レイアウトパラメータを含むURLでページにアクセスしたとき, the Multidim Analysis Service shall URLからレイアウト状態を復元してピボットを描画する

3. If URLのレイアウトパラメータが不正なとき, the Multidim Analysis Service shall デフォルトレイアウトで表示し、エラーメッセージをログに記録する

---

### Requirement 10: 権限・マルチテナント

**Objective:** As a システム管理者, I want 多次元分析へのアクセスを権限で制御したい, so that データセキュリティを確保できる

#### Acceptance Criteria

1. The Multidim Analysis Service shall 権限 `epm.multidim.read` を持つユーザーのみアクセスを許可する

2. The Multidim Analysis Service shall すべてのクエリに tenant_id を含めてマルチテナント分離を保証する

3. The Multidim Analysis Service shall RLS（Row Level Security）による二重防御でデータ分離を実現する

4. If 権限を持たないユーザーがアクセスしたとき, the Multidim Analysis Service shall 403エラーを返しアクセスを拒否する

---

## Out of Scope

本要件のスコープ外とする項目：

1. **レイアウトの個人保存機能** - プリセットはシステム定義のみ（v1）
2. **Excelエクスポート機能** - 将来バージョンで対応予定
3. **グラフ表示機能** - ダッシュボードウィジェットで対応
4. **リアルタイム共同編集** - 本機能は読み取り専用
5. **連結会計データ対応** - 単体会計のみ対象（v1）
6. **タグ（内訳情報）によるフィルター** - ディメンションのみ対応（v1）

---

## Non-Functional Requirements

### パフォーマンス
- 100万行以下のファクトデータに対して、ピボット集計を5秒以内に完了すること
- 1000行超の結果はサーバーサイド集計（SSRM）でページング処理すること

### 可用性
- API障害時はエラーメッセージを表示し、ユーザー操作をブロックしないこと

### 監査
- ピボットクエリの実行をログに記録すること（tenant_id, user_id, 実行時刻, クエリ条件）

---

## 変更履歴

| 日付 | 変更内容 | 担当 |
|------|---------|------|
| 2026-02-05 | 初版作成 | Claude Code |

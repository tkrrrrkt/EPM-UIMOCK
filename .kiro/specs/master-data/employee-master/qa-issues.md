# QA Issues: Employee Master

## 概要

社員マスタ機能のReq/Design/エンティティ定義を確認し、機能仕様・UI構成・実装可能性の観点から課題を抽出しました。

---

## 🔴 Critical Issues（実装前に解決必須）

### Issue 1: company_id の取得・指定方法が不明確

**問題点**:
- **Req 1.1**: 「当該会社（company_id）に所属する社員一覧を取得」とあるが、company_id をどう取得するかが不明確
- **Design Open Questions Q1**: 「認証コンテキストから取得（tenant 内で 1 company 前提）」とあるが、複数会社を持つテナントでの運用が考慮されていない
- **BffCreateEmployeeRequest**: company_id が含まれていない（エンティティ定義では company_id は必須）
- **Repository.findMany**: companyId を必須パラメータとして受け取るが、UI からどう渡すかが不明確

**影響範囲**:
- 一覧取得時のフィルタリング
- 新規登録時の company_id 指定
- 複数会社を持つテナントでの運用

**推奨解決策**:

**✅ 決定: 権限に応じた会社選択UI（ハイブリッド）**
- ユーザーの権限情報を取得し、アクセス可能な会社一覧を表示
- **複数会社へのアクセス権限がある場合**: 会社選択ドロップダウンを表示（選択必須）
- **単一会社へのアクセス権限のみの場合**: 会社選択UIを表示せず、自動的に当該会社を選択
- 選択された company_id は BFF リクエストに含め、Domain API で権限チェックを実施
- **前提**: 1 テナント = 複数会社（連結グループ）、権限管理システムと連携
- **UI**: 権限に応じて会社選択ドロップダウンを条件付き表示

**修正箇所**:
1. **requirements.md**: 
   - Req 1 に会社選択の要件を追加（権限に応じた表示制御）
   - Req 3 に新規登録時の会社選択要件を追加
   - Req 10 を新規追加（会社選択の要件）
2. **design.md**:
   - BffCreateEmployeeRequest に companyId を追加（必須）
   - BffListEmployeesRequest に companyId を追加（必須）
   - Authentication / Tenant Context セクションに会社選択の仕様を明記
   - UI の責務に会社選択UIを追加
   - Domain API の責務に company_id へのアクセス権限チェックを追加
   - Error Contracts に COMPANY_NOT_FOUND, COMPANY_ACCESS_DENIED を追加
   - Business Rules に company_id へのアクセス権限チェックを追加
3. **Open Questions Q1**: 解決策を明確化（権限に応じた会社選択UI）

---

### Issue 2: 新規登録時の company_id バリデーション不足

**問題点**:
- **Req 3.1**: 新規登録時の必須項目として「社員コード、氏名」のみが明記されている
- **エンティティ定義**: company_id は NOT NULL（必須）
- **Design Business Rules**: company_id の存在チェックは記載されているが、必須チェックが不明確

**影響範囲**:
- 新規登録時のバリデーション
- エラーハンドリング

**推奨解決策**:
- **Req 3.4**: 必須項目に company_id を追加（または認証コンテキストから自動取得することを明記）
- **Design Business Rules**: company_id の必須チェックを明記
- **Error Contracts**: COMPANY_NOT_FOUND エラーを追加（company_id が存在しない場合）

**修正箇所**:
1. **requirements.md**: Req 3.4 に company_id の必須チェックを追加
2. **design.md**: Business Rules に company_id 必須チェックを明記
3. **design.md**: Error Contracts に COMPANY_NOT_FOUND を追加

---

## 🟡 Medium Issues（設計レビューで確認推奨）

### Issue 3: 一覧取得時の company_id フィルタリング UI が未定義

**問題点**:
- **Req 1.1**: 「当該会社（company_id）に所属する社員一覧」とあるが、UI で会社を選択する仕様が不明確
- **Design**: BFF Endpoints に company_id フィルタリングの仕様が記載されていない
- **既存実装**: company-master では会社選択 UI がない（テナント内全社員を表示）

**影響範囲**:
- UI 構成
- ユーザー体験

**✅ 解決済み**: 権限に応じた会社選択UIを実装
- **複数会社へのアクセス権限がある場合**: 会社選択ドロップダウンを表示（選択必須）
- **単一会社へのアクセス権限のみの場合**: 会社選択UIを表示せず、自動的に当該会社を選択

**修正箇所**:
1. **design.md**: BffListEmployeesRequest に companyId を追加（必須）
2. **design.md**: UI の責務に「会社選択UI（権限に応じた表示制御）」を追加
3. **requirements.md**: Req 1, 3, 10 に会社選択の要件を追加

---

### Issue 4: 退職日（leave_date）のバリデーション不足

**問題点**:
- **エンティティ定義**: hire_date, leave_date は任意（NULL 可）
- **Req/Design**: hire_date と leave_date の前後関係チェックが記載されていない
- **ビジネスルール**: 退職日は入社日より後であるべき

**影響範囲**:
- データ整合性
- バリデーション

**推奨解決策**:
- **Design Business Rules**: leave_date が指定されている場合、hire_date より後であることをチェック
- **Error Contracts**: VALIDATION_ERROR の details に日付前後関係エラーを追加

**修正箇所**:
1. **design.md**: Business Rules に「退職日は入社日より後であること」を追加
2. **requirements.md**: Req 3.4, 4.1 に日付前後関係チェックを追加（オプショナル）

---

### Issue 5: 社員コードの形式制約が不明確

**問題点**:
- **エンティティ定義**: employee_code は varchar(30) のみ（形式制約なし）
- **Design Security Considerations**: 「英数字・ハイフン許可」とあるが、Req に反映されていない
- **既存実装**: project-master では「英数字・ハイフンのみ、最大 50 文字」と明記

**影響範囲**:
- バリデーション
- データ整合性

**推奨解決策**:
- **Design Business Rules**: 社員コードの形式制約を明記（英数字・ハイフンのみ、最大 30 文字）
- **Req 3.4**: 社員コードの形式バリデーションを追加

**修正箇所**:
1. **design.md**: Business Rules に社員コード形式制約を明記
2. **requirements.md**: Req 3.4 に社員コード形式バリデーションを追加

---

## 🟢 Low Issues（実装時に確認）

### Issue 6: 一覧表示項目の不足

**問題点**:
- **Req 1.5**: 一覧に「社員コード、氏名、メール、入社日、有効状態」を表示とある
- **BffEmployeeSummary**: 上記項目は含まれているが、会社名（company_name）が含まれていない
- **複数会社運用**: 複数会社を持つテナントでは、どの会社の社員か識別できない

**影響範囲**:
- UI 表示
- ユーザー体験

**推奨解決策**:
- **初期実装**: 認証コンテキストから取得した company_id のみ表示するため、会社名は不要
- **将来拡張**: 複数会社表示時は BffEmployeeSummary に companyName を追加

**修正箇所**:
1. **design.md**: BffEmployeeSummary に companyName を追加（オプショナル、将来拡張用）

---

### Issue 7: 詳細表示項目の不足

**問題点**:
- **Req 2.2**: 詳細画面に「社員コード、氏名、氏名カナ、メール、入社日、退職日、有効フラグ、作成日時、更新日時」を表示とある
- **BffEmployeeDetailResponse**: 上記項目は含まれているが、会社名（company_name）が含まれていない
- **監査情報**: created_by, updated_by のユーザー名が表示されていない

**影響範囲**:
- UI 表示
- 監査トレーサビリティ

**推奨解決策**:
- **初期実装**: 会社名は認証コンテキストから取得可能なため、レスポンスに含めなくても可
- **監査情報**: created_by, updated_by は UUID のみで、ユーザー名解決は別機能（将来拡張）

**修正箇所**:
1. **design.md**: BffEmployeeDetailResponse に companyName を追加（オプショナル）
2. **requirements.md**: Req 2.2 に監査情報（作成者・更新者）の表示を追加（オプショナル）

---

## 📋 修正優先度

| Issue | 優先度 | 修正箇所 | 影響範囲 |
|-------|--------|---------|---------|
| Issue 1 | 🔴 Critical | requirements.md, design.md | 全機能 |
| Issue 2 | 🔴 Critical | requirements.md, design.md | 新規登録 |
| Issue 3 | 🟡 Medium | design.md | UI 構成 |
| Issue 4 | 🟡 Medium | requirements.md, design.md | バリデーション |
| Issue 5 | 🟡 Medium | requirements.md, design.md | バリデーション |
| Issue 6 | 🟢 Low | design.md | UI 表示 |
| Issue 7 | 🟢 Low | requirements.md, design.md | UI 表示 |

---

## ✅ 確認済み（問題なし）

1. **エンティティ整合性**: 全カラムが DTO/Prisma に反映されている ✅
2. **型の一致**: varchar→String, date→DateTime? 等が正確 ✅
3. **制約の反映**: UNIQUE 制約、FK 制約が反映されている ✅
4. **ビジネスルール**: 物理削除禁止、employee_assignments 分離が反映されている ✅
5. **NULL 許可**: エンティティ定義通りに設定されている ✅
6. **Requirements Traceability**: 全要件が設計に反映されている ✅

---

## 📝 次のアクション

1. **Issue 1, 2 を優先的に修正**（Critical）
2. **Issue 3, 4, 5 を設計レビューで確認**（Medium）
3. **Issue 6, 7 は実装時に確認**（Low）

---

## 参考: 既存実装パターン

### company-master
- company_id の選択 UI なし（テナント内全法人を表示）
- 認証コンテキストから company_id を取得する仕様は未実装

### project-master
- company_id の取得方法: 「認証コンテキストから取得（tenant 内で 1 company 前提）」
- 同様の課題が存在

### organization-master
- company_id の取得方法: 同様の課題が存在

**結論**: 社員マスタは既存マスタ機能と同様の課題を抱えており、統一的な解決策が必要


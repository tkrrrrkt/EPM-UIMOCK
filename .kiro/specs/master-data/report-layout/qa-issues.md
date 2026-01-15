# 仕様QA確認結果: master-data/report-layout

## 確認日時
2026-01-04

## 確認観点
- RequirementsとDesignの整合性
- エンティティ定義との整合性
- ビジネスロジックの一貫性
- エッジケースの考慮
- データ整合性

---

## 🔴 Critical Issues（要対応）

### Issue 1: 科目選択時のcompany_idフィルタリングが不明確

**問題点**:
- レイアウトに`company_id`が指定されている場合、科目選択時も同じ`company_id`の科目のみを表示すべきかが不明確
- エンティティ定義によると、`subjects`は`company_id`必須（6.1）
- レイアウトが`company_id=NULL`（テナント共通）の場合、どの会社の科目を選択可能とするかが不明確

**影響**:
- 会社A専用レイアウトに会社Bの科目を紐付ける可能性がある
- テナント共通レイアウトで科目選択時に会社選択が必要になる可能性がある

**推奨対応**:
1. **レイアウトにcompany_idが指定されている場合**: 科目選択時は同じ`company_id`の科目のみ表示
2. **レイアウトがcompany_id=NULL（テナント共通）の場合**: 
   - オプションA: 全会社の科目を表示（会社選択UI追加が必要）
   - オプションB: 科目選択時に会社を指定（会社選択必須）
   - オプションC: テナント共通レイアウトでは科目選択不可（account行不可）

**該当箇所**:
- Requirements: 13.3（科目選択の補助）
- Design: SubjectSearchService（213行目）

---

### Issue 2: account行のdisplay_nameの扱いが不明確

**問題点**:
- Requirement 7.3では「account行はsubject_id必須」とあるが、`display_name`の扱いが不明確
- design.mdのテストケース（939行目）には「displayNameは科目名で自動設定」とあるが、要件・設計に明記されていない
- エンティティ定義では`display_name`はNULL許可（7.2）

**影響**:
- account行で`display_name`を手動入力可能か、科目名で自動設定かが不明確
- UI実装時に迷いが生じる

**推奨対応**:
- **Option A（推奨）**: account行の`display_name`は科目名（`subjects.subject_name`）で自動設定し、手動編集不可
- **Option B**: account行でも`display_name`を手動入力可能（科目名は参照用に表示）

**該当箇所**:
- Requirements: 7.3（レイアウト行の追加）
- Design: Line Service（199行目）、テストケース（939行目）

---

### Issue 3: 科目の無効化時の整合性チェックが不足

**問題点**:
- account行に紐付いている科目が無効化（`is_active=false`）された場合の扱いが不明確
- 無効化された科目を参照しているaccount行の表示・編集はどうするか？

**影響**:
- 無効化された科目を参照している行が表示できなくなる可能性
- レイアウト編集時にエラーが発生する可能性

**推奨対応**:
- **Option A**: 無効化された科目を参照しているaccount行は表示するが、編集不可（科目名に「（無効）」表示）
- **Option B**: 無効化された科目を参照しているaccount行は科目選択を必須とする（科目変更を促す）
- **Option C**: 科目無効化時に、その科目を参照しているレイアウト行を一括で警告表示

**該当箇所**:
- Requirements: 13.6（有効科目のみ表示）は科目選択時の話で、既存行の扱いは未記載
- Design: 未記載

---

## 🟡 Medium Issues（検討推奨）

### Issue 4: レイアウトのcompany_id変更時の整合性チェック

**問題点**:
- Requirement 3ではレイアウト編集が可能だが、`company_id`を変更した場合の整合性チェックが不明確
- 既存のaccount行の`subject_id`が別会社の科目を参照している可能性がある

**影響**:
- 会社Aのレイアウトを会社Bに変更した場合、会社Aの科目を参照している行が残る

**推奨対応**:
- `company_id`変更時は、既存のaccount行の`subject_id`が新しい`company_id`の科目を参照しているかチェック
- 参照できない場合は警告を表示し、行の削除または科目変更を促す

**該当箇所**:
- Requirements: 3（レイアウトの編集）
- Design: Layout Service（190行目）

---

### Issue 5: subject_fin_attrsが存在しない科目の扱い

**問題点**:
- 科目選択時に`subject_fin_attrs`が存在しない科目（KPI科目など）を除外する必要がある
- 現在の設計では「fin_stmt_class = layout_type」でフィルタリングとあるが、`subject_fin_attrs`が存在しない科目の扱いが不明確

**影響**:
- KPI科目（`subject_type='KPI'`）は`subject_fin_attrs`を持たないため、科目選択時に表示されない（これは正しい挙動）
- ただし、要件・設計に明記されていない

**推奨対応**:
- 科目選択時は`subject_type='FIN'`かつ`subject_fin_attrs`が存在する科目のみ表示することを明記
- または、`subject_fin_attrs`が存在しない科目は自動的に除外されることを明記

**該当箇所**:
- Requirements: 13.3（PL/BSフィルタ）
- Design: SubjectSearchService（213行目）

---

### Issue 6: レイアウト複製時のcompany_idの扱い

**問題点**:
- Requirement 12（レイアウトの複製）では、新しいレイアウトコードと名前を入力として受け取るが、`company_id`の扱いが不明確
- 複製元の`company_id`を引き継ぐか、新規指定可能かが不明確

**影響**:
- 会社A専用レイアウトを複製する場合、会社B専用として複製できるかが不明確

**推奨対応**:
- **Option A**: 複製元の`company_id`を引き継ぐ（デフォルト）
- **Option B**: 複製時に`company_id`を新規指定可能
- **Option C**: 複製時は`company_id=NULL`（テナント共通）として作成

**該当箇所**:
- Requirements: 12（レイアウトの複製）
- Design: LayoutCopyService（208行目）

---

## 🟢 Minor Issues（改善推奨）

### Issue 7: 行削除時の確認メッセージの詳細化

**問題点**:
- Requirement 9.1では「この行を削除しますか？」という確認ダイアログを表示とあるが、account行の場合は科目名も表示した方が親切

**推奨対応**:
- account行の場合は「科目「売上高」を削除しますか？」のように科目名を含める

**該当箇所**:
- Requirements: 9.1（行削除確認ダイアログ）

---

### Issue 8: プレビュー表示時の科目名表示

**問題点**:
- Requirement 11.3では「科目行（account）を科目名とともにインデント付きで表示する」とあるが、`display_name`と科目名のどちらを表示するかが不明確

**推奨対応**:
- account行の場合は科目名（`subjects.subject_name`）を表示し、`display_name`は補助情報として表示

**該当箇所**:
- Requirements: 11.3（プレビュー表示）

---

## 確認済み（問題なし）

✅ エンティティ定義との整合性: 全カラムが適切に反映されている
✅ 制約の反映: UNIQUE、CHECK、FK制約が適切に反映されている
✅ マルチテナント対応: tenant_idによる二重ガードが適切に設計されている
✅ 種別変更時の行削除: トランザクション境界が明確
✅ 行の並べ替え: line_noの再計算ロジックが明確

---

## 推奨アクション

### 優先度: 高（実装前に要対応）
1. **Issue 1**: 科目選択時のcompany_idフィルタリングを明確化
2. **Issue 2**: account行のdisplay_nameの扱いを明確化
3. **Issue 3**: 科目無効化時の整合性チェックを追加

### 優先度: 中（設計レビュー時に検討）
4. **Issue 4**: レイアウトのcompany_id変更時の整合性チェック
5. **Issue 5**: subject_fin_attrsが存在しない科目の扱いを明記
6. **Issue 6**: レイアウト複製時のcompany_idの扱いを明確化

### 優先度: 低（実装時に改善）
7. **Issue 7**: 行削除時の確認メッセージの詳細化
8. **Issue 8**: プレビュー表示時の科目名表示の明確化

---

## 次のステップ

1. 上記のIssueについて、ビジネス要件を確認
2. Requirements.mdとDesign.mdを更新
3. 必要に応じてDesign Reviewを再実施


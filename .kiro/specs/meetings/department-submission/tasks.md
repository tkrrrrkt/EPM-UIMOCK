# 部門報告登録 Tasks

> **ステータス**: Phase 1 実装済み
> **作成日**: 2026-01-25
> **スコープ**: C1（報告登録）

---

## Design Completeness Gate

- [x] requirements.md 完成
- [x] design.md 完成
- [x] 実装完了

---

## Decisions

| 決定事項 | 内容 |
|----------|------|
| Backend実装 | BFF ServiceでMock APIレスポンス |
| フォーム構造 | Mock Dataで静的定義（Phase 2でDB連携） |
| 見通し入力 | Phase 2で実装 |
| ファイル添付 | Phase 2で実装 |

---

## Task 1: Contracts定義 ✅

_Requirements: FR-1_

### Task 1.1: Submission DTO定義

- [x] `packages/contracts/src/bff/meetings/enums/SubmissionStatus.ts`
- [x] `packages/contracts/src/bff/meetings/enums/SubmissionLevel.ts`
- [x] `packages/contracts/src/bff/meetings/meeting-submission/MeetingSubmissionDto.ts`
- [x] `packages/contracts/src/bff/meetings/meeting-submission/MeetingSubmissionValueDto.ts`
- [x] `packages/contracts/src/bff/meetings/meeting-submission/SaveSubmissionDto.ts`
- [x] `packages/contracts/src/bff/meetings/meeting-submission/index.ts`

---

## Task 2: BFF実装 ✅

_Requirements: FR-1_

### Task 2.1: Controller実装

- [x] GET /bff/meetings/submissions/:eventId/:deptId
- [x] POST /bff/meetings/submissions
- [x] POST /bff/meetings/submissions/:id/submit

### Task 2.2: Service実装

- [x] getSubmission() - 部門報告取得（または新規フォーム）
- [x] saveSubmission() - 報告保存（下書き）
- [x] submitSubmission() - 報告提出

### Task 2.3: Mock Data

- [x] MOCK_FORM_FIELDS（標準テンプレート）
- [x] MOCK_SUBMISSIONS（サンプルデータ）

---

## Task 3: UI実装（v0隔離） ✅

_Requirements: FR-1_

### Task 3.1: C1 - 報告登録フォーム

- [x] `components/submission/submission-form-page.tsx`
- [x] 会議情報ヘッダー
- [x] 部門情報コンテキストバー
- [x] 動的フォームセクション
- [x] フィールドタイプ別入力（TEXT, RICH_TEXT, NUMBER, DATE）
- [x] 下書き保存ボタン
- [x] 提出ボタン
- [x] 提出確認ダイアログ
- [x] 離脱確認ダイアログ

### Task 3.2: 共通コンポーネント

- [x] `components/shared/status-badge.tsx` - SubmissionStatusBadge

---

## Task 4: UI実装（本番移行）

_Requirements: NFR-2, NFR-3_

### Task 4.1: Structure Guard

- [ ] `npx tsx scripts/structure-guards.ts` 実行
- [ ] 全チェックPASS確認

### Task 4.2: 本番ディレクトリ移行

- [ ] `apps/web/src/features/meetings/management-meeting-report/` へコピー
- [ ] Import修正

### Task 4.3: App Router登録

- [ ] `apps/web/src/app/meetings/events/[eventId]/submissions/[deptId]/page.tsx` - C1

---

## Phase 2 Tasks（未実装）

### 見通し入力（FR-3）

- [ ] OutlookType SELECT入力
- [ ] 見通しバッジ表示

### ファイル添付（FR-4）

- [ ] ファイルアップロードUI
- [ ] ファイル一覧表示
- [ ] ファイル削除

### 事業部用報告（C2）

- [ ] 事業部レベルの報告フォーム
- [ ] 部門報告の集約表示

### 報告確認（C3）

- [ ] 承認フロー

---

## 変更履歴

| 日付 | 変更内容 |
|------|----------|
| 2026-01-25 | 初版作成（Phase 1スコープ） |
| 2026-01-25 | Spec分割により独立化、実装ステータス反映 |

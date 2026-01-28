# 会議イベント管理 Tasks

> **ステータス**: Phase 2 実装中
> **作成日**: 2026-01-25
> **スコープ**: B1（イベント一覧）、B2（イベント作成）、B3（登録状況管理）、B4（会議クローズ）、B5（議事録登録）

---

## Design Completeness Gate

- [x] requirements.md 完成
- [x] design.md 完成
- [x] 実装完了

---

## Decisions

| 決定事項 | 内容 |
|----------|------|
| Backend実装 | BFF ServiceでMock APIレスポンス（Domain API連携は後続） |
| UIスコープ | B1（一覧）、B2（作成ウィザード） |
| Error Policy | Pass-through（Domain APIエラーをそのまま返却） |

---

## Task 1: Contracts定義 ✅

_Requirements: FR-1, FR-2_

### Task 1.1: MeetingEvent DTO定義

- [x] `packages/contracts/src/bff/meetings/enums/MeetingEventStatus.ts`
- [x] `packages/contracts/src/bff/meetings/meeting-event/MeetingEventDto.ts`
- [x] `packages/contracts/src/bff/meetings/meeting-event/MeetingEventListDto.ts`
- [x] `packages/contracts/src/bff/meetings/meeting-event/CreateMeetingEventDto.ts`
- [x] `packages/contracts/src/bff/meetings/meeting-event/UpdateMeetingEventDto.ts`
- [x] `packages/contracts/src/bff/meetings/meeting-event/UpdateMeetingEventStatusDto.ts`
- [x] `packages/contracts/src/bff/meetings/meeting-event/GetMeetingEventsQueryDto.ts`
- [x] `packages/contracts/src/bff/meetings/meeting-event/index.ts`

---

## Task 2: BFF実装 ✅

_Requirements: FR-1, FR-2_

### Task 2.1: Controller実装

- [x] GET /bff/meetings/events
- [x] GET /bff/meetings/events/:id
- [x] POST /bff/meetings/events
- [x] PUT /bff/meetings/events/:id
- [x] POST /bff/meetings/events/:id/status

### Task 2.2: Service実装

- [x] getEvents() - 会議イベント一覧（フィルタ、ページング）
- [x] getEventById() - 会議イベント詳細
- [x] createEvent() - 会議イベント作成
- [x] updateEvent() - 会議イベント更新
- [x] updateEventStatus() - ステータス変更

### Task 2.3: Mock Data

- [x] MOCK_MEETING_EVENTS（5件）
- [x] MOCK_MEETING_TYPES（3種類）

---

## Task 3: UI実装（v0隔離） ✅

_Requirements: FR-1, FR-2_

### Task 3.1: B1 - 会議イベント一覧

- [x] `components/event-list/event-list-page.tsx`
- [x] フィルタバー（キーワード、会議種別、ステータス、年度）
- [x] イベントテーブル
- [x] ページネーション
- [x] ローディング・空状態

### Task 3.2: B2 - 会議イベント作成

- [x] `components/event-create/event-create-wizard.tsx`
- [x] Step 1: 基本情報
- [x] Step 2: スケジュール
- [x] Step 3: 確認
- [x] プログレスステップ表示

### Task 3.3: 共通コンポーネント

- [x] `components/shared/status-badge.tsx` - MeetingEventStatusBadge

---

## Task 4: UI実装（本番移行）

_Requirements: NFR-2, NFR-3_

### Task 4.1: Structure Guard

- [ ] `npx tsx scripts/structure-guards.ts` 実行
- [ ] 全チェックPASS確認

### Task 4.2: 本番ディレクトリ移行

- [ ] `apps/web/src/features/meetings/management-meeting-report/` へコピー
- [ ] Import修正（`@/shared/ui`, `@epm/contracts/bff/meetings`）

### Task 4.3: App Router登録

- [ ] `apps/web/src/app/meetings/events/page.tsx` - B1
- [ ] `apps/web/src/app/meetings/events/new/page.tsx` - B2

---

## Task 5: Phase 2 Contracts定義

_Requirements: FR-4, FR-5, FR-6_

### Task 5.1: SubmissionTracking DTO定義（B3用）

- [ ] `packages/contracts/src/bff/meetings/submission-tracking/SubmissionTrackingDto.ts`
- [ ] `packages/contracts/src/bff/meetings/submission-tracking/SubmissionTrackingItemDto.ts`
- [ ] `packages/contracts/src/bff/meetings/submission-tracking/RemindSubmissionDto.ts`
- [ ] `packages/contracts/src/bff/meetings/submission-tracking/index.ts`

### Task 5.2: CloseEvent DTO定義（B4用）

- [ ] `packages/contracts/src/bff/meetings/enums/SnapshotType.ts`
- [ ] `packages/contracts/src/bff/meetings/meeting-event/CloseEventDto.ts`
- [ ] `packages/contracts/src/bff/meetings/meeting-event/CloseEventResultDto.ts`

### Task 5.3: MeetingMinutes DTO定義（B5用）

- [ ] `packages/contracts/src/bff/meetings/meeting-minutes/MeetingMinutesDto.ts`
- [ ] `packages/contracts/src/bff/meetings/meeting-minutes/SaveMeetingMinutesDto.ts`
- [ ] `packages/contracts/src/bff/meetings/meeting-minutes/AttachmentDto.ts`
- [ ] `packages/contracts/src/bff/meetings/meeting-minutes/index.ts`

---

## Task 6: Phase 2 BFF実装

_Requirements: FR-4, FR-5, FR-6_

### Task 6.1: Controller追加

- [ ] GET /bff/meetings/events/:id/submission-tracking
- [ ] POST /bff/meetings/events/:id/remind
- [ ] POST /bff/meetings/events/:id/close
- [ ] GET /bff/meetings/events/:id/minutes
- [ ] POST /bff/meetings/events/:id/minutes

### Task 6.2: Service追加

- [ ] getSubmissionTracking() - 登録状況詳細
- [ ] remindSubmission() - 催促メール送信
- [ ] closeEvent() - 会議クローズ
- [ ] getMinutes() - 議事録取得
- [ ] saveMinutes() - 議事録保存

### Task 6.3: Mock Data追加

- [ ] MOCK_SUBMISSION_TRACKING（詳細版）
- [ ] MOCK_MEETING_MINUTES（議事録サンプル）

---

## Task 7: Phase 2 UI実装（v0隔離）

_Requirements: FR-4, FR-5, FR-6_

### Task 7.1: B3 - 登録状況管理

- [ ] `components/submission-tracking/submission-tracking-page.tsx`
- [ ] サマリーカード（提出率、ステータス別件数）
- [ ] フィルタバー（ステータス）
- [ ] 部門別一覧テーブル
- [ ] 締切超過の強調表示
- [ ] 催促ボタン（個別/一括）

### Task 7.2: B4 - 会議クローズ

- [ ] `components/event-close/event-close-page.tsx`
- [ ] 会議情報表示
- [ ] スナップショット設定（チェックボックス）
- [ ] クローズ備考入力
- [ ] クローズ確認ダイアログ

### Task 7.3: B5 - 議事録登録

- [ ] `components/minutes/minutes-form-page.tsx`
- [ ] リッチテキストエディタ（議事録本文）
- [ ] 決定事項リスト（動的追加/削除）
- [ ] 出席者入力
- [ ] 添付ファイルアップロード（UI only、Mock）

### Task 7.4: BffClient拡張

- [ ] bff-client.ts インターフェース追加
- [ ] mock-bff-client.ts Mock実装追加
- [ ] http-bff-client.ts HTTP実装追加

---

## Task 8: Phase 2 UI実装（本番移行）

_Requirements: NFR-2, NFR-3_

### Task 8.1: Structure Guard

- [ ] `npx tsx scripts/structure-guards.ts` 実行
- [ ] 全チェックPASS確認

### Task 8.2: 本番ディレクトリ移行

- [ ] `apps/web/src/features/meetings/management-meeting-report/` へコピー
- [ ] Import修正

### Task 8.3: App Router登録

- [ ] `apps/web/src/app/meetings/events/[eventId]/tracking/page.tsx` - B3
- [ ] `apps/web/src/app/meetings/events/[eventId]/close/page.tsx` - B4
- [ ] `apps/web/src/app/meetings/events/[eventId]/minutes/page.tsx` - B5

---

## 変更履歴

| 日付 | 変更内容 |
|------|----------|
| 2026-01-25 | 初版作成（Phase 1スコープ） |
| 2026-01-25 | Spec分割により独立化、実装ステータス反映 |
| 2026-01-25 | Phase 2タスク追加（B3, B4, B5） |

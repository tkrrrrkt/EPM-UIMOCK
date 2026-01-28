# レポート閲覧 Tasks

> **ステータス**: Phase 1 実装済み
> **作成日**: 2026-01-25
> **スコープ**: D1（レポートメイン）、D2（サマリー）

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
| KPIデータ | Mock Data（Phase 2で財務データ連携） |
| Phase 2タブ | 部門報告、資料タブはプレースホルダー |

---

## Task 1: Contracts定義 ✅

_Requirements: FR-1, FR-2_

### Task 1.1: Report DTO定義

- [x] `packages/contracts/src/bff/meetings/enums/KpiCardStatus.ts`
- [x] `packages/contracts/src/bff/meetings/meeting-submission/SubmissionStatusDto.ts`
- [x] `packages/contracts/src/bff/meetings/meeting-submission/SubmissionStatusSummaryDto.ts`
- [x] `packages/contracts/src/bff/meetings/meeting-report/KpiCardDto.ts`
- [x] `packages/contracts/src/bff/meetings/meeting-report/KpiCardListDto.ts`
- [x] `packages/contracts/src/bff/meetings/meeting-report/index.ts`

---

## Task 2: BFF実装 ✅

_Requirements: FR-1, FR-2_

### Task 2.1: Controller実装

- [x] GET /bff/meetings/events/:id（※ meeting-event-management と共有）
- [x] GET /bff/meetings/events/:id/submission-status
- [x] GET /bff/meetings/events/:id/kpi-cards
- [x] POST /bff/meetings/events/:id/status（※ meeting-event-management と共有）

### Task 2.2: Service実装

- [x] getSubmissionStatus() - 提出状況一覧
- [x] getKpiCards() - KPIカード一覧

### Task 2.3: Mock Data

- [x] MOCK_SUBMISSION_STATUS（部門別提出状況）
- [x] MOCK_KPI_CARDS（4指標）

---

## Task 3: UI実装（v0隔離） ✅

_Requirements: FR-1, FR-2_

### Task 3.1: D1 - レポートメイン

- [x] `components/report/report-main-page.tsx`
- [x] 会議情報ヘッダー
- [x] スケジュール情報バー
- [x] タブコンテナ（Tabs）
- [x] ステータス変更ドロップダウン

### Task 3.2: D2 - サマリーダッシュボード

- [x] `components/report/summary-dashboard.tsx`
- [x] 提出状況サマリーカード
- [x] 順調/注意/要注意カウントカード
- [x] KPIカードグリッド
- [x] 要注目事項リスト（AT_RISKフィルタ）
- [x] 部門別提出状況一覧

### Task 3.3: KPIカード

- [x] `components/report/kpi-card.tsx`
- [x] 数値フォーマット（億円、万円）
- [x] プログレスバー
- [x] 達成率・差異表示
- [x] ステータスバッジ

### Task 3.4: 共通コンポーネント

- [x] `components/shared/status-badge.tsx` - KpiCardStatusBadge

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

- [ ] `apps/web/src/app/meetings/events/[eventId]/page.tsx` - D1

---

## Phase 2 Tasks（未実装）

### 部門報告閲覧（D4）

- [ ] 部門報告タブの実装
- [ ] 部門選択・報告詳細表示

### KPI・アクション（D5）

- [ ] KPI詳細ドリルダウン
- [ ] アクションプラン表示

### 詳細分析（D3）

- [ ] チャート/グラフ表示
- [ ] 月次トレンド

### 前回比較（D7）

- [ ] 前月/前年同期比較

### 議事録閲覧（D8）

- [ ] 議事録タブの実装

### URLパラメータ対応（FR-1.6）

- [ ] タブ状態のURL保持
- [ ] ディープリンク対応

---

## 変更履歴

| 日付 | 変更内容 |
|------|----------|
| 2026-01-25 | 初版作成（Phase 1スコープ） |
| 2026-01-25 | Spec分割により独立化、実装ステータス反映 |

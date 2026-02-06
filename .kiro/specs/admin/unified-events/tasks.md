# Implementation Plan: unified-events

> CCSDD / SDD 前提：**contracts-first**（bff → api → shared）を最優先し、境界違反を guard で止める。
> Phase 1 は **UI + MockBffClient** のみ。Domain API / BFF 実装は Phase 2。

---

## 0. Design Completeness Gate（Blocking）

> Phase 1 スコープのため、BFF/API実装に関するGateは Phase 2 で確認。

- [x] 0.1 Designの「BFF Specification（apps/bff）」が埋まっている
  - BFF endpoints（UIが叩く）が記載されている
  - Request/Response DTO（packages/contracts/src/bff）が列挙されている
  - **Paging/Sorting正規化（必須）が明記されている**
  - エラー整形方針（**contracts/bff/errors** に準拠）が記載されている
  - tenant_id/user_id の取り回し（Phase 1 は Mock 固定値）が記載されている

- [x] 0.2 Designの「Contracts Summary（This Feature）」が埋まっている
  - packages/contracts/src/bff 側の追加・変更DTOが列挙されている
  - Enum / Error の配置ルールが明記されている
  - 「UIは packages/contracts/src/api を参照しない」ルールが明記されている

- [x] 0.3 Requirements Traceability が更新されている
  - 全8要件が設計要素に紐づいている

- [ ] 0.4 v0生成物の受入・移植ルールが確認されている
  - v0生成物は `apps/web/_v0_drop/admin/unified-events/src` に一次格納
  - UIは MockBffClient で動作確認（BFF未接続状態）

---

## 1. Contracts 定義

- [ ] 1.1 (P) BFF コントラクト作成
  - 統一イベント管理用の Enum 定義（UnifiedEventType, SubmissionStatus）
  - Request DTO 定義（BffUnifiedEventListRequest, BffSubmissionListRequest, BffSendReminderRequest）
  - Response DTO 定義（BffUnifiedEvent, BffUnifiedEventListResponse, BffUnifiedEventDetailResponse, BffSubmissionSummary, BffDepartmentSubmission, BffSubmissionListResponse, BffSendReminderResponse）
  - Error Code 定義（UnifiedEventsErrorCode, UnifiedEventsError）
  - 配置先: `packages/contracts/src/bff/unified-events/index.ts`
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1_

---

## 2. UI基盤（v0 Phase 1: UI-MOCK）

- [ ] 2.1 Feature 骨格生成
  - `apps/web/_v0_drop/admin/unified-events/` ディレクトリ作成
  - `apps/web/src/features/admin/unified-events/` ディレクトリ作成（移植先）
  - BffClient インターフェース定義
  - _Requirements: 8.1_

- [ ] 2.2 (P) MockBffClient 実装
  - 全イベント種別（BUDGET/FORECAST/MEETING/MTP/GUIDELINE）のサンプルデータ
  - 複数の登録ステータス（未着手/入力中/提出済/承認済/差戻し）のサンプルデータ
  - 部門階層（親部門-子部門）を持つサンプルデータ
  - イベント一覧・詳細・登録状況の各メソッド実装
  - contracts/bff DTO 形状でレスポンス返却
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

---

## 3. UIコンポーネント実装

- [ ] 3.1 イベント一覧ページ
  - イベント種別・年度・ステータスのフィルタUI
  - イベント一覧テーブル（種別アイコン、名称、対象期間、ステータス、進捗率）
  - ページネーションコンポーネント（1ページ20件）
  - イベント行クリックで詳細画面への遷移
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [ ] 3.2 イベント詳細ページ
  - 基本情報カード（イベント名、種別、対象期間、締切日、ステータス、作成日）
  - タブ切替UI（概要 / 登録状況 / 履歴）
  - 登録状況タブの有効・無効制御（BUDGET/FORECAST/MEETINGのみ有効）
  - 一覧への戻るリンク
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 3.3 登録状況サマリーカード
  - 進捗率のプログレスバー表示
  - ステータス別件数表示（未着手/入力中/提出済/承認済/差戻し/期限超過）
  - 締切までの残日数表示
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 3.4 部門別登録状況テーブル
  - 部門階層のツリー表示
  - 各部門のステータス・最終更新・担当者・承認段階表示
  - ステータス別アイコン・色分け
  - ステータス・部門フィルタ機能
  - 行選択機能（催促対象選択用）
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ] 3.5 催促ダイアログ
  - 選択部門一覧表示
  - メッセージ入力欄
  - 提出済・承認済部門の除外と警告表示
  - 確認・キャンセルボタン
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

---

## 4. ステータスマッピング・表示ロジック

- [ ] 4.1 (P) イベントステータス表示ロジック
  - イベント種別ごとの元ステータス→統一表示ラベル変換
  - BUDGET/FORECAST: DRAFT→下書き, SUBMITTED→受付中, APPROVED→承認済, FIXED→確定済
  - MEETING: DRAFT→下書き, OPEN→受付開始, COLLECTING→受付中, HELD→開催済, CLOSED→完了
  - MTP: DRAFT→下書き, CONFIRMED→確定済
  - GUIDELINE: DRAFT→下書き, DISTRIBUTED→配布済, CLOSED→完了
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 4.2 (P) 登録状況ステータス表示ロジック
  - 統一ステータス定義（NOT_STARTED, IN_PROGRESS, SUBMITTED, APPROVED, REJECTED, OVERDUE）
  - ステータス別アイコン・色定義
  - 期限超過判定ロジック
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

---

## 5. 統合・動作確認

- [ ] 5.1 v0_drop 配置と構造確認
  - `apps/web/_v0_drop/admin/unified-events/` への配置確認
  - layout.tsx が存在しないことを確認（AppShell殻禁止）
  - MockBffClient で全画面が動作することを確認
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 5.2 画面遷移・フロー確認
  - イベント一覧→詳細画面への遷移
  - タブ切替の動作確認
  - フィルタ・ページネーションの動作確認
  - 催促ダイアログの表示・操作確認
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

- [ ]*5.3 コンポーネントテスト（オプション）
  - 主要コンポーネントのレンダリングテスト
  - フィルタ操作のユニットテスト
  - モックデータ返却のテスト
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

---

## 6. 本実装への移植（Phase 1 完了後）

- [ ] 6.1 features ディレクトリへの移植
  - `_v0_drop/admin/unified-events/` から `features/admin/unified-events/` へコピー
  - インポートパス調整
  - contracts/bff 参照確認（api 参照がないこと）
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

- [ ] 6.2 ルーティング・メニュー登録
  - `/admin/unified-events` ルート追加
  - `/admin/unified-events/:eventType/:eventId` ルート追加
  - ナビゲーションメニューへの追加（管理者メニュー配下）
  - _Requirements: 1.1, 2.1_

---

## Requirements Coverage Matrix

| Requirement | Tasks | Status |
|-------------|-------|--------|
| 1.1-1.6 イベント一覧表示 | 1.1, 3.1, 5.2, 6.1, 6.2 | ✅ |
| 2.1-2.5 イベント詳細表示 | 1.1, 3.2, 5.2, 6.1, 6.2 | ✅ |
| 3.1-3.5 登録状況サマリー | 1.1, 3.3, 5.2 | ✅ |
| 4.1-4.6 部門別登録状況 | 1.1, 3.4, 5.2 | ✅ |
| 5.1-5.4 催促機能 | 1.1, 3.5, 5.2 | ✅ |
| 6.1-6.5 イベントステータスマッピング | 1.1, 4.1 | ✅ |
| 7.1-7.8 登録状況ステータスマッピング | 1.1, 4.2 | ✅ |
| 8.1-8.6 モックデータ対応 | 2.1, 2.2, 5.1, 5.3 | ✅ |

---

## Phase 2 予定タスク（参考）

> 以下は Phase 2 以降で実装予定。本タスクファイルでは管理しない。

- Domain API 実装（イベント一覧API、登録状況API）
- BFF 実装（アダプターパターン、ステータスマッピング）
- HttpBffClient 実装
- 既存画面への遷移リンク
- 催促メール送信の実処理
- CSV出力機能
- 履歴タブの実装

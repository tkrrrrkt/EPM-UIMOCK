# 議事録登録 Implementation Tasks

> **ステータス**: 計画中（Phase 2以降実装予定）
> **スコープ**: C2「議事録」タブの実装
> **対象**: Phase 2（BFF実装時）

---

## 0. Design Completeness Gate

- [x] 0.1 Overview が完成している
- [x] 0.2 Architecture & Boundary が確定している
- [x] 0.3 BFF Specification が完成している
- [x] 0.4 UI Specification が完成している
- [x] 0.5 Data Model が参照されている
- [x] 0.6 Contracts が明記されている

---

## Phase 1: UI + Mock（現在 - 承認待ち）

本フェーズは会議レポート表示画面（C2）の「議事録」タブをUIとして実装し、MockBffClient で動作確認する。

### 1. Mock Data 準備

- [ ] 1.1 MockBffClient に `getMinutesForm()` 実装
  - 報告フォーム設定から MEETING_MINUTES セクションを取得するシミュレーション
  - 議論内容、決定事項、課題・リスク、フォローアップ セクション定義
  - 標準フィールド定義（TEXT/TEXTAREA/DATE/SELECT）

- [ ] 1.2 MockBffClient に `saveMinutes()` 実装
  - 入力データをメモリに保存
  - 次回表示時に復元可能

### 2. UI Component 実装

- [ ] 2.1 MinutesFormTab コンポーネントを実装
  - props: { eventId: string, client: BffClient }
  - 状態管理: form values, errors, loading, saved
  - マウント時に フォーム定義とデータを取得

- [ ] 2.2 Form Section Renderer を実装
  - セクションごとのグループ化
  - セクションタイトル表示
  - セクション内フィールド配列

- [ ] 2.3 Form Field Input Components を実装
  - TextInput（TEXT タイプ）
  - TextAreaInput（TEXTAREA タイプ）
  - DateInput（DATE タイプ）
  - SelectInput（SELECT タイプ）
  - フィールド値の Formik バインディング

- [ ] 2.4 Form Validation を実装
  - 必須フィールド検証
  - フィールドタイプ別バリデーション（DATE形式など）
  - エラーメッセージ表示

- [ ] 2.5 Form Actions を実装
  - 「保存」ボタン → saveMinutes() 呼び出し
  - 「キャンセル」ボタン → フォームリセット
  - 保存成功時: トースト表示 + フォームリセット
  - 保存失敗時: エラーメッセージ表示

### 3. Integration

- [ ] 3.1 report-main-page.tsx に MinutesFormTab を組み込む
  - 既存の「議事録」TabsContent に置き換え
  - eventId, client を props で渡す

- [ ] 3.2 Formik または React Hook Form で状態管理
  - フォーム値の集中管理
  - バリデーション自動実行

### 4. UI 動作確認

- [ ] 4.1 MockBffClient での動作テスト
  - フォーム表示確認
  - フィールド入力確認
  - 保存・復元動作確認
  - バリデーション動作確認

---

## Phase 2: BFF + Backend（将来 - Phase 2以降）

### 1. Contracts 定義

- [ ] 1.1 `MeetingMinutesDto` を定義
  - packages/contracts/src/bff/meetings/

- [ ] 1.2 `MeetingMinutesError` を定義
  - MeetingMinutesNotFoundError
  - MeetingMinutesSaveError

### 2. BFF Layer 実装

- [ ] 2.1 BFF Endpoints を実装
  - GET /bff/meetings/minutes/:eventId （フォーム定義）
  - GET /bff/meetings/minutes/:eventId/data （保存データ）
  - POST /bff/meetings/minutes/:eventId （新規保存）
  - PUT /bff/meetings/minutes/:eventId （更新）

- [ ] 2.2 MinutesService を実装
  - フォーム定義取得ロジック
  - バリデーション実装
  - データ永続化ロジック

- [ ] 2.3 MinutesController を実装
  - エンドポイント公開
  - リクエスト/レスポンス処理

### 3. Domain API 実装

- [ ] 3.1 MinutesService（Domain層）を実装
  - ビジネスロジック（バリデーション、制約チェック）

- [ ] 3.2 MinutesRepository を実装
  - tenant_id ガード
  - RLS ポリシー適用
  - CRUD 操作

### 4. Database Schema

- [ ] 4.1 `meeting_minutes` テーブル実装
  - id, tenant_id, event_id, created_at, updated_at, created_by_user_id

- [ ] 4.2 `meeting_minutes_field_values` テーブル実装
  - minutes_id, form_field_id, field_value（JSON）

- [ ] 4.3 RLS ポリシー適用
  - tenant_id 検証

### 5. UI 切り替え

- [ ] 5.1 HttpBffClient への切り替え
  - MockBffClient → HttpBffClient 置き換え
  - 既存 UI コンポーネント流用

- [ ] 5.2 エラーハンドリング強化
  - ネットワークエラー対応
  - リトライロジック

### 6. テスト

- [ ] 6.1 Unit Tests（Domain API）
- [ ] 6.2 Integration Tests（BFF）
- [ ] 6.3 E2E Tests（UI）

---

## Out of Scope（将来検討）

- [ ] 議事録の削除機能
- [ ] 議事録の承認フロー
- [ ] 議事録の配信・メール通知
- [ ] 議事録の検索・フィルタ
- [ ] 議事録の一覧表示
- [ ] 複数会議の議事録比較

---

## Dependencies

- Phase 1 実装開始前に:
  - ✅ 報告フォーム設定（meeting-form-settings）のMock実装完了
  - ✅ FormFieldDto の定義確定

- Phase 2 実装開始前に:
  - ✅ Domain API フレームワーク確立
  - ✅ RLS ポリシー実装完了

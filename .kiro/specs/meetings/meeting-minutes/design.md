# 議事録登録 Design

> **ステータス**: 設計完了（承認待ち）
> **作成日**: 2026-01-30
> **スコープ**: A2b（議事録タブ）

---

## Overview

議事録登録は会議レポート表示画面（C2）の「議事録」タブをコンポーネント化し、報告フォーム設定で定義された「MEETING_MINUTES」セクションを読み込んで、フォーム入力UIとして表示する機能である。

**Key Design Decision**:
- ✅ 報告フォーム設定の既存インフラを再利用（スキーマ変更不要）
- ✅ `sectionCode='MEETING_MINUTES'` で固定管理
- ✅ 入力スコープ不使用（全社共通、1件のみ）
- ✅ Phase 1: Mock実装、Phase 2以降: 永続化実装

---

## Architecture

### Architecture Pattern & Boundary Map

**Pattern**:
- UI（apps/web） → BFF（apps/bff） → Domain API（apps/api） → DB
- Phase 1: UI直接MOCK
- Phase 2: BFF経由API連携

**Contracts**:
- UI ↔ BFF: `packages/contracts/src/bff/meetings/`（FormFieldDto利用）
- 新規 Error: `MeetingMinutesNotFoundError`, `MeetingMinutesSaveError`

### Component Hierarchy

```
MeetingReportPage (C2)
  ├─ TabsList
  │  └─ TabsTrigger: 「議事録」
  │
  └─ TabsContent: 議事録タブ
     └─ MinutesFormTab
        ├─ FormSectionRenderer
        │  ├─ SectionHeader
        │  └─ FormFieldArray
        │     ├─ TextFieldInput
        │     ├─ TextAreaInput
        │     ├─ DateInput
        │     ├─ FileUploadInput
        │     └─ ...
        │
        └─ FormActions
           ├─ SaveButton
           └─ CancelButton
```

---

## BFF Specification

### Endpoints

| Method | Endpoint | Purpose | Request | Response |
|--------|----------|---------|---------|----------|
| GET | `/bff/meetings/minutes/:eventId` | 議事録フォーム定義取得 | - | MinutesFormDto |
| GET | `/bff/meetings/minutes/:eventId/data` | 議事録データ取得 | - | MeetingMinutesDataDto |
| POST | `/bff/meetings/minutes/:eventId` | 議事録新規保存 | SaveMeetingMinutesDto | MeetingMinutesDto |
| PUT | `/bff/meetings/minutes/:eventId` | 議事録更新 | SaveMeetingMinutesDto | MeetingMinutesDto |

### DTO Definitions

**MinutesFormDto**:
```typescript
interface MinutesFormDto {
  eventId: string
  sections: {
    id: string
    sectionCode: 'MEETING_MINUTES'  // Fixed
    sectionName: string
    description?: string
    fields: FormFieldDto[]  // Reuse existing DTO
  }[]
}
```

**MeetingMinutesDataDto**:
```typescript
interface MeetingMinutesDataDto {
  eventId: string
  minutesId?: string  // null if not yet saved
  fieldValues: {
    formFieldId: string
    value: string | number | boolean | Date | File[]
  }[]
  createdAt?: Date
  createdByUserName?: string
}
```

**SaveMeetingMinutesDto**:
```typescript
interface SaveMeetingMinutesDto {
  eventId: string
  fieldValues: {
    formFieldId: string
    value: string | number | boolean | Date | File[]
  }[]
}
```

### Error Handling

| Error | HTTP | Message | Handling |
|-------|------|---------|----------|
| MeetingEventNotFoundError | 404 | 会議が見つかりません | Show error toast |
| MeetingMinutesFormNotFoundError | 404 | 議事録フォームが設定されていません | Show notice, disable form |
| ValidationError | 422 | フィールド検証エラー | Highlight fields, show errors |
| SaveError | 500 | 保存に失敗しました | Show retry dialog |

---

## UI Specification

### MinutesFormTab Component

**Props**:
```typescript
interface MinutesFormTabProps {
  eventId: string
  client: BffClient  // Or HttpBffClient in Phase 2
}
```

**State**:
```typescript
{
  form: FormikValues  // { [formFieldId]: value }
  loading: boolean
  saved: boolean
  errors: Record<string, string>
}
```

**Behavior**:

1. **On Mount**:
   - Fetch form definition from FormSettingsService
   - Fetch existing minutes data (if exists)
   - Populate form fields

2. **On Field Change**:
   - Update form state
   - Clear validation errors for that field

3. **On Save**:
   - Validate required fields
   - Show validation errors if any
   - Call BFF save endpoint
   - Show success toast
   - Reset form state

### Form Field Rendering

**Render Rules by FieldType**:

| Type | UI Component | Validation |
|------|--------------|-----------|
| TEXT | Input[type=text] | maxLength, pattern |
| TEXTAREA | Textarea | maxLength |
| NUMBER | Input[type=number] | min, max |
| DATE | Input[type=date] | ISO8601 format |
| SELECT | Select dropdown | required options |
| MULTI_SELECT | Checkboxes/Multi-select | required count |
| FILE | File upload | max 10MB, accept types |

### Sample Layout

```
┌─────────────────────────────────────────┐
│           議事録タブ                    │
├─────────────────────────────────────────┤
│                                         │
│  議論内容                               │
│  ├─ 主要テーマ [Text input]             │
│  └─ 内容詳細 [Textarea]                 │
│                                         │
│  決定事項                               │
│  ├─ 決定内容 [Textarea]                 │
│  └─ 実行期限 [Date picker]              │
│                                         │
│  課題・リスク                           │
│  ├─ 課題名 [Text input]                 │
│  ├─ 優先度 [Select: 高/中/低]          │
│  └─ 対応予定者 [Multi-select]           │
│                                         │
│  フォローアップ                         │
│  ├─ 対応内容 [Textarea]                 │
│  └─ 次回進捗確認日 [Date picker]        │
│                                         │
│ ┌─ [保存] [キャンセル] ──────────────┐  │
│                                         │
└─────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: UI + Mock（現在）

- ✅ MinutesFormTab コンポーネント作成
- ✅ MockBffClient: `getMinutesForm()`, `saveMinutes()` 実装
- ✅ フォーム入力・バリデーション
- ✅ UI動作確認

**Out of Scope**:
- DBへのデータ永続化
- 複数編集・削除機能

### Phase 2: Backend（将来）

- Domain API 実装: `/api/meetings/minutes/*`
- Repository層: RLS対応
- BFF: Mock → API切り替え
- `meeting_minutes` テーブル実装

---

## Data Flow Diagram

```
┌─────────────┐
│   UI Layer  │
│  (Phase 1)  │
└──────┬──────┘
       │ getMinutesForm(eventId)
       ▼
┌────────────────────┐
│  MockBffClient     │
│  (Phase 1)         │
├────────────────────┤
│ - formDefinition   │
│ - savedData        │
└──────┬─────────────┘
       │ (Phase 2 cut-over)
       │ HttpBffClient
       ▼
┌────────────────────┐
│  BFF Layer         │
│  (Phase 2)         │
├────────────────────┤
│ MinutesController  │
│ MinutesService     │
└──────┬─────────────┘
       │ API calls
       ▼
┌────────────────────┐
│  Domain API        │
│  (Phase 2)         │
├────────────────────┤
│ MinutesService     │
│ MinutesRepository  │
└──────┬─────────────┘
       │ SQL + RLS
       ▼
┌────────────────────┐
│  Database          │
│                    │
│ meeting_minutes    │
│ (Phase 2 future)   │
└────────────────────┘
```

---

## Testing Strategy

### Unit Tests (MinutesFormTab)

- Form initialization
- Field validation
- Save submission
- Error handling

### Mock Tests (MockBffClient)

- `getMinutesForm()` returns form structure
- `saveMinutes()` stores data
- Data persistence across sessions

### Integration Tests (Phase 2)

- BFF endpoint responses
- Database constraints
- RLS enforcement

---

## Future Enhancements

- [ ] 議事録テンプレート（Form Settingsから自動適用）
- [ ] 議事録の配信・通知
- [ ] 議事録の検索・フィルタ
- [ ] 議事録の承認フロー
- [ ] 複数会議の議事録一覧表示
- [ ] 議事録の削除（現在は禁止）

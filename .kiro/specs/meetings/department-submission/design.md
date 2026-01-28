# 部門報告登録 Design

> **ステータス**: Phase 1 実装済み
> **作成日**: 2026-01-25
> **スコープ**: C1（報告登録）

---

## Spec Reference

- **requirements.md**: [./requirements.md](./requirements.md)
- **仕様概要**: [.kiro/specs/仕様概要/経営会議レポート機能.md](../../仕様概要/経営会議レポート機能.md)
- **共通Contracts**: `packages/contracts/src/bff/meetings/`

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              UI Layer                                    │
│  apps/web/_v0_drop/meetings/management-meeting-report/                  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ C1: SubmissionFormPage                                           │   │
│  │ 部門報告登録フォーム                                             │   │
│  │                                                                   │   │
│  │ - 会議情報ヘッダー                                               │   │
│  │ - 動的フォームセクション                                         │   │
│  │ - 下書き保存 / 提出ボタン                                        │   │
│  └──────────────────────────────────┬────────────────────────────────┘   │
│                                     │                                    │
│                               BffClient                                  │
│                                     │                                    │
└─────────────────────────────────────┼────────────────────────────────────┘
                                      │ HTTP (JSON)
                                      │ /api/bff/meetings/submissions/*
┌─────────────────────────────────────┼────────────────────────────────────┐
│                                BFF Layer                                 │
│  apps/bff/src/modules/meetings/management-meeting-report/               │
│                                                                          │
│  ManagementMeetingReportController                                       │
│    - GET  /bff/meetings/submissions/:eventId/:deptId                    │
│    - POST /bff/meetings/submissions                                      │
│    - POST /bff/meetings/submissions/:id/submit                          │
│                                                                          │
│  ManagementMeetingReportService                                          │
│    - getSubmission()                                                     │
│    - saveSubmission()                                                    │
│    - submitSubmission()                                                  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## BFF Specification

### Endpoints（本Spec対象）

| Method | Path | 説明 | Request DTO | Response DTO |
|--------|------|------|-------------|--------------|
| GET | `/bff/meetings/submissions/:eventId/:deptId` | 部門報告取得 | - | MeetingSubmissionDto |
| POST | `/bff/meetings/submissions` | 報告保存 | SaveSubmissionDto | MeetingSubmissionDto |
| POST | `/bff/meetings/submissions/:id/submit` | 報告提出 | - | MeetingSubmissionDto |

### Error Policy

**選択: [x] Option A: Pass-through**

---

## Contracts Summary

### 使用するContracts

**配置先**: `packages/contracts/src/bff/meetings/`

#### Enums（本Spec関連）

```typescript
export type SubmissionStatus =
  | 'NOT_STARTED'
  | 'DRAFT'
  | 'SUBMITTED';

export type SubmissionLevel =
  | 'DEPARTMENT'
  | 'BUSINESS_UNIT'
  | 'COMPANY';

export type FormFieldType =
  | 'TEXT'
  | 'NUMBER'
  | 'DATE'
  | 'RICH_TEXT'
  | 'JSON';
```

#### DTOs（本Spec関連）

| DTO | 用途 |
|-----|------|
| `MeetingSubmissionDto` | 部門報告（フォーム全体） |
| `MeetingSubmissionValueDto` | 報告項目値（個別フィールド） |
| `SaveSubmissionDto` | 報告保存リクエスト |
| `SaveSubmissionValueDto` | 保存する項目値 |

---

## UI Implementation

### ディレクトリ構成

```
apps/web/_v0_drop/meetings/management-meeting-report/src/
├── components/
│   ├── submission/
│   │   ├── submission-form-page.tsx   # C1 メインページ
│   │   └── index.ts
│   └── shared/
│       └── status-badge.tsx           # SubmissionStatusBadge
├── api/
│   └── ...
└── index.ts
```

### UIパターン適用

| 画面 | パターン | 参照 |
|------|----------|------|
| C1 | フォームパターン（Form Pattern） | v0プロンプト Pattern 2 |

### フォームパターン仕様（C1）

```
┌────────────────────────────────────────────────────────────┐
│ [← 戻る] 報告登録                          [作成中] Badge  │
│ 6月度経営会議への報告を入力してください                    │
├────────────────────────────────────────────────────────────┤
│ [Context Bar]                                              │
│ 📄 会議: 6月度経営会議 [収集中]                            │
│ 🏢 部門: 営業部                                            │
│ ⏰ 提出期限: 2026年6月15日 17:00                           │
├────────────────────────────────────────────────────────────┤
│ [Card: セクション1 - 概要]                                 │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ 当月ハイライト *                                       │ │
│ │ ┌────────────────────────────────────────────────────┐ │ │
│ │ │ [Rich Text Area]                                   │ │ │
│ │ └────────────────────────────────────────────────────┘ │ │
│ │                                                        │ │
│ │ 課題・リスク *                                         │ │
│ │ ┌────────────────────────────────────────────────────┐ │ │
│ │ │ [Rich Text Area]                                   │ │ │
│ │ └────────────────────────────────────────────────────┘ │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                            │
│ [Card: セクション2 - 施策]                                 │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ アクションプラン                                       │ │
│ │ ┌────────────────────────────────────────────────────┐ │ │
│ │ │ [Rich Text Area]                                   │ │ │
│ │ └────────────────────────────────────────────────────┘ │ │
│ └────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────┤
│ [Footer Actions]                                           │
│                                    [💾 下書き保存] [📤 提出]│
└────────────────────────────────────────────────────────────┘
```

### ステータス遷移

```
NOT_STARTED ──[初回保存]──> DRAFT ──[提出]──> SUBMITTED
                             ↑
                             └───[再編集]───┘

※ SUBMITTED後は編集不可（Phase 1）
```

---

## Data Model

### エンティティ参照

| テーブル | 用途 | 本Specでの使用 |
|----------|------|----------------|
| meeting_form_sections | フォームセクション定義 | 参照（フォーム構造） |
| meeting_form_fields | フォーム項目定義 | 参照（入力項目定義） |
| meeting_submissions | 部門報告 | CRUD対象 |
| meeting_submission_values | 報告項目値 | CRUD対象 |

---

## Requirements Traceability

| 要件ID | 要件 | 設計セクション | 実装責務 |
|--------|------|----------------|----------|
| FR-1.1 | 会議情報表示 | UI Context Bar | UI |
| FR-1.3 | セクション別フォーム | UI submission-form-page.tsx | UI |
| FR-1.7 | 下書き保存 | BFF POST /submissions | BFF + UI |
| FR-1.8 | 提出 | BFF POST /submissions/:id/submit | BFF + UI |
| FR-1.10 | 提出確認ダイアログ | UI AlertDialog | UI |
| FR-1.11 | 離脱確認 | UI AlertDialog | UI |

---

## 変更履歴

| 日付 | 変更内容 |
|------|----------|
| 2026-01-25 | 初版作成（Phase 1スコープ） |
| 2026-01-25 | Spec分割により独立化 |

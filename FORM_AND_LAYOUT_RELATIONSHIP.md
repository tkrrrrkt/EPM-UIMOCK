# 報告フォーム設定 vs レポートレイアウト設定の関係性

## 簡潔な説明

```
会議イベント (evt-004: 7月度経営会議)
├── meetingTypeId: mt-1 (月次経営会議)
│   └── ③ 報告フォーム設定で定義されたフォーム
│       └── 各部門が **提出する内容** を定義
│
└── reportLayoutId: layout-1 (月次標準レイアウト)
    └── ④ レポートレイアウト設定で定義されたレイアウト
        └── 会議資料を **表示・プレビュー** する方法を定義
```

---

## 1. 報告フォーム設定（Form Settings）

### 目的
各部門（営業部、開発部など）が会議イベントに **提出する報告の内容構造** を定義

### 何が定義されるか
- **セクション**: 報告書の章立て
  - 業績サマリー
  - 差異要因
  - リスク・課題
  - アクション
- **フィールド**: 各セクション内の入力項目
  - 売上見通し (SELECT)
  - 利益見通し (SELECT)
  - サマリーコメント (TEXTAREA)
  - 売上差異の主要因 (TEXTAREA)
  - etc...

### 関連ファイル
- `/apps/web/src/features/meetings/meeting-form-settings/`
- MOCK: `mock-bff-client.ts` に mockSections, mockFields...* が定義

### UI上の位置
```
会議イベント表示画面
├─ [サマリー] タブ ← エグゼクティブサマリー表示
├─ [提出状況] タブ ← 各部門の提出状況
├─ [KPI・AP] タブ ← KPI表示
├─ [議事録] タブ ← 議事録フォーム表示
└─ [前回比較] タブ ← 前回との比較

↓ ここで 報告フォーム が使われる ↓

各部門が提出する場所: /meetings/management-meeting-report/evt-004/minutes
（または管理画面で提出内容を編集する際）
```

### 実際の動作
```
営業部が報告を提出する流れ:
1. "提出状況" タブで「営業部を選択」
2. 報告フォーム設定に基づいて生成されたフォームが表示される
3. 各フィールドに入力
4. 提出ボタンをクリック
5. データベースに保存
```

---

## 2. レポートレイアウト設定（Layout Settings）

### 目的
会議資料を **表示・可視化** するためのレイアウト構造を定義

### 何が定義されるか
- **ページ**: レイアウトの構成ページ
  - エグゼクティブサマリー (page-1)
  - 部門報告 (page-2)
  - KPI・アクション (page-3)
- **コンポーネント**: 各ページに配置するビジュアル要素
  - KPI_CARD: KPI指標の表示
  - CHART: グラフ表示
  - TABLE: 表形式データ
  - SUBMISSION_DISPLAY: 提出内容の表示
  - etc...

### 関連ファイル
- `/apps/web/src/features/meetings/meeting-report-layout/`
- MOCK: `mock-bff-client.ts` に mockPages, mockComponents が定義

### UI上の位置
```
会議イベント表示画面
├─ [サマリー] タブ ← 💡 レイアウト-1 page-1 (エグゼクティブサマリー) を表示
│  ├─ comp-1: KPI_CARD (主要KPIカード)
│  ├─ comp-2: CHART (損益ウォーターフォール)
│  ├─ comp-3: TABLE (予実対比表)
│  └─ comp-4: SUBMISSION_DISPLAY (差異コメント)
│
├─ [提出状況] タブ
├─ [KPI・AP] タブ ← 💡 レイアウト-1 page-3 (KPI・アクション) を表示
│  ├─ comp-6: KPI_DASHBOARD (KPI一覧)
│  └─ comp-7: AP_PROGRESS (AP進捗)
│
├─ [議事録] タブ
└─ [前回比較] タブ
```

### 実際の動作
```
会議資料を確認する流れ:
1. イベント詳細画面を開く
2. [サマリー] タブが表示される (layout-1 の page-1)
3. KPI指標のカード、グラフ、表がレイアウト設定に基づいて表示される
4. [KPI・AP] タブをクリック
5. layout-1 の page-3 がロードされて表示される
6. 「プレビュー」ボタンで全ページをプレビュー可能
```

---

## 3. 二つの関係性：整理図

```
申请イベント定義
  ↓
┌─────────────────────────────────────────────────┐
│ evt-004 (7月度経営会議)                          │
├─────────────────────────────────────────────────┤
│ • eventName: 7月度経営会議                       │
│ • meetingTypeId: mt-1 (月次経営会議)              │
│ • reportLayoutId: layout-1 (月次標準レイアウト)  │
│ • targetPeriodName: 2026年7月度                 │
│ • status: DRAFT                                │
└─────────────────────────────────────────────────┘
  ↓                                ↓
  ├─ mt-1 に紐づく                  └─ layout-1 に紐づく
  │  「報告フォーム定義」               「レポートレイアウト定義」
  │
  └─ mockFormFieldsByMeetingType['mt-1']
     ├─ Section: 業績サマリー
     │  ├─ 売上見通し (SELECT)
     │  ├─ 利益見通し (SELECT)
     │  └─ サマリーコメント (TEXTAREA)
     ├─ Section: 差異要因
     │  ├─ 売上差異の主要因 (TEXTAREA)
     │  └─ 粗利差異の主要因 (TEXTAREA)
     ├─ Section: リスク・課題
     │  └─ リスク項目 (TEXTAREA)
     └─ Section: アクション
        └─ アクション項目 (TEXTAREA)

                              └─ mockPages['layout-1']
                                 └─ page-1: エグゼクティブサマリー
                                    ├─ comp-1: KPI_CARD
                                    ├─ comp-2: CHART
                                    ├─ comp-3: TABLE
                                    └─ comp-4: SUBMISSION_DISPLAY
                                 └─ page-2: 部門報告
                                    └─ comp-5: SUBMISSION_DISPLAY
                                 └─ page-3: KPI・アクション
                                    ├─ comp-6: KPI_DASHBOARD
                                    └─ comp-7: AP_PROGRESS
```

---

## 4. 実装における役割の違い

### 報告フォーム設定の使用箇所

**A) フォーム生成時** (meeting-report-layout/api/mock-bff-client.ts の getSubmission メソッド)
```typescript
async getSubmission(eventId: string, departmentStableId: string) {
  const event = mockEvents.find((e) => e.id === eventId)
  // ↓ eventId から meetingTypeId を取得
  const meetingTypeId = event.meetingTypeId // 'mt-1'
  // ↓ meetingTypeId に基づいてフォーム構造を選択
  const formFields = mockFormFieldsByMeetingType[meetingTypeId]
  // ↓ フォームオブジェクトを返す
  return {
    values: formFields.map((f) => ({ ... }))
  }
}
```

**B) 各部門の報告フォーム画面**
```
/meetings/management-meeting-report/evt-004/minutes
└─ MinutesFormPage コンポーネント
   └─ getSubmission() で取得したフォーム構造を表示
      └─ 営業部、開発部、管理部など各部門が入力
```

### レポートレイアウト設定の使用箇所

**A) 会議イベント表示時** (management-meeting-report/components/report/report-main-page.tsx)
```typescript
// layout-1 から page-1, page-2, page-3 を取得
const pages = await getPages('layout-1')
// ↓ 各ページ用のコンポーネントをロード
const components = await getComponents('page-1')
// ↓ タブUIで表示
<Tabs>
  <TabsTrigger value="page-1">エグゼクティブサマリー</TabsTrigger>
  <TabsContent value="page-1">
    <ComponentRenderer components={components} />
  </TabsContent>
</Tabs>
```

**B) プレビューダイアログ**
```
「プレビュー」ボタンクリック
└─ LayoutPreviewDialog を開く
   └─ layout-1 の全ページを表示
      ├─ page-1: KPI_CARD, CHART, TABLE, SUBMISSION_DISPLAY
      ├─ page-2: SUBMISSION_DISPLAY
      └─ page-3: KPI_DASHBOARD, AP_PROGRESS
```

---

## 5. データフロー図：完全版

```
┌──────────────────────────────────────────────────────────────┐
│ ユーザー: 会議資料を確認 & 部門報告を提出                      │
└──────────────────────────────────────────────────────────────┘
  ↓
┌──────────────────────────────────────────────────────────────┐
│ Step 1: 会議イベント詳細ページを開く                          │
│ URL: /meetings/management-meeting-report/evt-004             │
└──────────────────────────────────────────────────────────────┘
  ↓
┌──────────────────────────────────────────────────────────────┐
│ Step 2a: レイアウト情報をロード                              │
│ • evt-004.reportLayoutId = 'layout-1'                       │
│ • 会議資料を表示するための構造情報を取得                      │
│ • layout-1 の pages と components を取得                     │
└──────────────────────────────────────────────────────────────┘
  ↓
┌──────────────────────────────────────────────────────────────┐
│ Step 2b: フォーム情報をロード                                │
│ • evt-004.meetingTypeId = 'mt-1'                            │
│ • 報告を提出するためのフォーム構造を取得                      │
│ • mockFormFieldsByMeetingType['mt-1'] をロード               │
└──────────────────────────────────────────────────────────────┘
  ↓
┌──────────────────────────────────────────────────────────────┐
│ Step 3: UI表示                                               │
│                                                              │
│ [サマリー] ← layout-1, page-1, components表示               │
│ ├─ KPI_CARD (comp-1)                                       │
│ ├─ CHART (comp-2)                                          │
│ ├─ TABLE (comp-3)                                          │
│ └─ SUBMISSION_DISPLAY (comp-4)                             │
│                                                              │
│ [KPI・AP] ← layout-1, page-3, components表示               │
│ ├─ KPI_DASHBOARD (comp-6)                                  │
│ └─ AP_PROGRESS (comp-7)                                    │
│                                                              │
│ [議事録] ← mt-1 のフォーム定義を使用して表示                 │
│ └─ Form (7フィールド, 4セクション)                          │
│    ├─ Section: 業績サマリー                                 │
│    ├─ Section: 差異要因                                     │
│    ├─ Section: リスク・課題                                 │
│    └─ Section: アクション                                   │
│        ↑ ここで営業部が入力して提出                          │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. 具体例：evt-004 の場合

### 会議タイプが同じでも、レイアウトが異なる場合

```
evt-001 (6月度経営会議)
├─ meetingTypeId: mt-1 (月次経営会議) ← 同じ
├─ reportLayoutId: layout-1 (月次標準)
└─ 報告フォーム: 7フィールド (mt-1で定義)
   提出内容表示: layout-1 の page-1, page-2, page-3

evt-005 (4月度経営会議)
├─ meetingTypeId: mt-1 (月次経営会議) ← 同じ
├─ reportLayoutId: layout-2 (月次簡易)
└─ 報告フォーム: 7フィールド (mt-1で定義) ← 同じ
   提出内容表示: layout-2 の page-4, page-5 ← 異なる！

→ 同じフォームを使用するが、会議資料の見せ方（レイアウト）が異なる
```

### 会議タイプが異なる場合

```
evt-004 (7月度経営会議)
├─ meetingTypeId: mt-1 (月次経営会議)
├─ reportLayoutId: layout-1
└─ 報告フォーム: 7フィールド, 4セクション

evt-003 (Q1経営会議)
├─ meetingTypeId: mt-2 (四半期経営会議) ← 異なる
├─ reportLayoutId: layout-3
└─ 報告フォーム: 5フィールド, 4セクション ← 異なる

→ 会議タイプ自体が異なるため、フォーム構造も、レイアウトも異なる
```

---

## 結論

| 項目 | 報告フォーム設定 | レポートレイアウト設定 |
|------|------|------|
| **定義するもの** | 提出フォームの構造 | 会議資料の表示方法 |
| **使用者** | 各部門（営業部など） | 会議司会者・参加者 |
| **操作** | フォームに記入・提出 | 会議資料を閲覧・分析 |
| **データ単位** | meetingTypeId 単位 | reportLayoutId 単位 |
| **関連ファイル** | meeting-form-settings/ | meeting-report-layout/ |
| **具体例** | 「営業部が売上見通しを入力」 | 「KPI指標をカード表示」 |
| **UI場所** | [議事録] タブ | [サマリー] / [KPI・AP] タブ |


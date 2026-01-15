# v0 Prompt: Group Subject Mapping (連結科目マッピング)

---

## 1. Design System

```
Use the EPM Design System from: https://epm-registry-6xtkaywr0-tkoizumi-hira-tjps-projects.vercel.app

Theme: Deep Teal & Royal Indigo
- Primary: oklch(0.52 0.13 195) - Deep Teal
- Secondary: oklch(0.48 0.15 280) - Royal Indigo
```

---

## 2. Context

```markdown
You are generating UI for an EPM SaaS.

**Boundary Rules (MUST FOLLOW):**
- UI → BFF only（Domain API 直接呼び出し禁止）
- Use `packages/contracts/src/bff` DTOs only（api 参照禁止）
- Components from `@/shared/ui` only（base UI を feature 内に作成禁止）
- No layout.tsx（AppShell 内で描画）
- No raw colors（semantic tokens のみ: bg-primary, text-foreground, etc.）
- Start with MockBffClient → later switch to HttpBffClient
```

---

## 3. Feature

```markdown
**master-data/group-subject-mapping**: 連結科目マッピング管理（会社COA→連結COAのマッピング）

### 主要ユースケース
1. 自社の会社科目一覧とマッピング状況の表示
2. マッピング詳細の表示・編集
3. 会社科目への連結科目マッピング設定
4. 連結科目の選択（ツリー形式のダイアログ）
5. マッピング先の変更・削除
6. 一括マッピング設定
7. マッピングのフィルタリング・検索
8. マッピングの無効化・再有効化
```

---

## 4. Screens

```markdown
### Screen 1: MappingList（メイン画面）
- **Purpose**: 自社の会社科目一覧とマッピング状況を表示
- **Layout**: 上：統計バー + フィルタパネル、中：マッピング一覧テーブル、下：ページネーション
- **Table Columns**:
  - チェックボックス（一括選択用）
  - 会社科目コード
  - 会社科目名
  - 科目クラス（BASE/AGGREGATE）
  - 科目タイプ（FIN/KPI）
  - マッピング先連結科目コード
  - マッピング先連結科目名
  - 係数（+1/-1）
  - 状態（有効/無効/未設定）
  - 操作ボタン
- **Interactions**:
  - 行クリックで詳細パネル表示
  - 「マッピング未設定」行は視覚的に区別（背景色薄く等）
  - 統計バー: 「マッピング済み XX件」「未設定 XX件」をカード形式で表示（進捗ゲージ・パーセント表示は不要）
  - フィルタ: キーワード、マッピング状態（済/未設定）、科目タイプ、科目クラス、有効状態

### Screen 2: MappingDetailPanel（詳細パネル）
- **Purpose**: 選択した会社科目のマッピング詳細を表示・編集
- **Trigger**: 一覧で行選択
- **Display Fields**:
  - 会社科目コード、会社科目名、科目クラス、科目タイプ
  - 控除科目フラグ（FIN科目のみ）
  - マッピング先連結科目（コード + 名称）
  - 係数（+1 / -1）
  - マッピングメモ
  - 有効フラグ
  - 作成日時、更新日時
- **Actions**: マッピング設定 / マッピング変更 / マッピング解除 / 無効化 / 再有効化

### Screen 3: GroupSubjectSelectDialog（連結科目選択ダイアログ）
- **Purpose**: 連結科目をツリー形式で選択
- **Trigger**: 「マッピング設定」「マッピング変更」ボタン
- **Layout**: 上：検索・フィルタ、中：連結科目ツリー（rollup関係に基づく）
- **Features**:
  - キーワード検索（コード・名称部分一致）
  - 科目タイプフィルタ（FIN/KPI）
  - 会社科目と同じ科目タイプを推奨としてハイライト表示（isRecommended）
  - ツリー構造: nodes（親子関係あり）+ unassigned（親なし）
- **Actions**: 選択確定 / キャンセル

### Screen 4: CreateMappingForm（マッピング設定フォーム）
- **Purpose**: 会社科目に連結科目をマッピング
- **Trigger**: 未設定科目で「マッピング設定」
- **Form Fields**:
  - 連結科目* (required) - ダイアログで選択
  - 係数*: +1 / -1 (required, default: +1、控除科目の場合 default: -1)
  - マッピングメモ (optional)
- **Actions**: 登録 / キャンセル

### Screen 5: BulkMappingDialog（一括マッピングダイアログ）
- **Purpose**: 複数の会社科目を同一連結科目にまとめてマッピング
- **Trigger**: 複数行選択後「一括マッピング」ボタン
- **Form Fields**:
  - 選択された会社科目一覧（読み取り専用）
  - 連結科目* (required) - ダイアログで選択
  - 係数*: +1 / -1 (required, default: +1)
- **Result Display**:
  - 成功件数、スキップ件数（既存マッピング）
  - スキップされた科目一覧
- **Actions**: 実行 / キャンセル

### Screen 6: ConfirmDeleteDialog（マッピング解除確認）
- **Purpose**: マッピング解除の確認
- **Trigger**: 「マッピング解除」ボタン
- **Message**: 「このマッピングを解除しますか？」
- **Actions**: 解除実行 / キャンセル
```

---

## 5. BFF Contract

### Endpoints

| Method | Endpoint | Purpose | Request DTO | Response DTO |
|--------|----------|---------|-------------|--------------|
| GET | /api/bff/master-data/group-subject-mapping | マッピング一覧取得 | BffMappingListRequest | BffMappingListResponse |
| GET | /api/bff/master-data/group-subject-mapping/:id | マッピング詳細取得 | - | BffMappingDetailResponse |
| POST | /api/bff/master-data/group-subject-mapping | マッピング新規登録 | BffCreateMappingRequest | BffMappingDetailResponse |
| PATCH | /api/bff/master-data/group-subject-mapping/:id | マッピング更新 | BffUpdateMappingRequest | BffMappingDetailResponse |
| DELETE | /api/bff/master-data/group-subject-mapping/:id | マッピング削除 | - | { success: true } |
| POST | /api/bff/master-data/group-subject-mapping/:id/deactivate | マッピング無効化 | - | BffMappingDetailResponse |
| POST | /api/bff/master-data/group-subject-mapping/:id/reactivate | マッピング再有効化 | - | BffMappingDetailResponse |
| POST | /api/bff/master-data/group-subject-mapping/bulk | 一括マッピング登録 | BffBulkMappingRequest | BffBulkMappingResponse |
| GET | /api/bff/master-data/group-subject-mapping/group-subjects/tree | 連結科目選択用ツリー取得 | BffGroupSubjectSelectRequest | BffGroupSubjectSelectTreeResponse |

### DTOs

```typescript
// Request DTOs
interface BffMappingListRequest {
  page?: number;
  pageSize?: number;
  sortBy?: 'subjectCode' | 'subjectName' | 'groupSubjectCode' | 'groupSubjectName';
  sortOrder?: 'asc' | 'desc';
  keyword?: string;
  subjectType?: 'FIN' | 'KPI';
  subjectClass?: 'BASE' | 'AGGREGATE';
  mappingStatus?: 'mapped' | 'unmapped';
  isActive?: boolean;
}

interface BffCreateMappingRequest {
  companySubjectId: string;
  groupSubjectId: string;
  coefficient?: 1 | -1;            // default: +1（控除科目は-1）
  mappingNote?: string;
}

interface BffUpdateMappingRequest {
  groupSubjectId?: string;
  coefficient?: 1 | -1;
  mappingNote?: string;
  isActive?: boolean;
}

interface BffBulkMappingRequest {
  companySubjectIds: string[];     // 複数の会社科目ID
  groupSubjectId: string;          // 1つの連結科目にまとめてマッピング
  coefficient?: 1 | -1;            // default: +1
}

interface BffGroupSubjectSelectRequest {
  keyword?: string;
  subjectType?: 'FIN' | 'KPI';
}

// Response DTOs
interface BffMappingListItem {
  id: string | null;                        // マッピングID（未設定の場合null）
  companySubjectId: string;
  companySubjectCode: string;
  companySubjectName: string;
  companySubjectClass: 'BASE' | 'AGGREGATE';
  companySubjectType: 'FIN' | 'KPI';
  companySubjectIsContra: boolean;          // 控除科目フラグ（FIN科目のみ、KPIはfalse）
  groupSubjectId: string | null;            // マッピング先（未設定の場合null）
  groupSubjectCode: string | null;
  groupSubjectName: string | null;
  coefficient: 1 | -1 | null;
  mappingNote: string | null;
  isActive: boolean | null;
  isMapped: boolean;                        // マッピング設定済みフラグ
}

interface BffMappingListResponse {
  items: BffMappingListItem[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  statistics: {
    mappedCount: number;                    // マッピング設定済み件数
    unmappedCount: number;                  // マッピング未設定件数
    totalCount: number;
  };
}

interface BffMappingDetailResponse {
  id: string;
  companySubjectId: string;
  companySubjectCode: string;
  companySubjectName: string;
  companySubjectClass: 'BASE' | 'AGGREGATE';
  companySubjectType: 'FIN' | 'KPI';
  companySubjectIsContra: boolean;
  groupSubjectId: string;
  groupSubjectCode: string;
  groupSubjectName: string;
  groupSubjectClass: 'BASE' | 'AGGREGATE';
  groupSubjectType: 'FIN' | 'KPI';
  coefficient: 1 | -1;
  mappingNote: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BffBulkMappingResponse {
  successCount: number;
  skippedCount: number;                     // 既存マッピングでスキップされた件数
  skippedSubjectIds: string[];              // スキップされた会社科目ID
}

interface BffGroupSubjectSelectTreeNode {
  id: string;
  groupSubjectCode: string;
  groupSubjectName: string;
  subjectClass: 'BASE' | 'AGGREGATE';
  subjectType: 'FIN' | 'KPI';
  isRecommended: boolean;                   // 会社科目と同タイプの推奨マーク
  children: BffGroupSubjectSelectTreeNode[];  // rollup関係に基づく子ノード
}

interface BffGroupSubjectSelectTreeResponse {
  nodes: BffGroupSubjectSelectTreeNode[];     // ルートノード（親を持たない科目）
  unassigned: BffGroupSubjectSelectTreeNode[]; // どの集計科目にも属さないBASE科目
}
```

### Errors → UI Messages

| Error Code | UI Message |
|------------|-----------|
| MAPPING_NOT_FOUND | 「マッピングが見つかりません」 |
| MAPPING_ALREADY_EXISTS | 「この会社科目は既にマッピングされています」 |
| MAPPING_ALREADY_INACTIVE | 「このマッピングは既に無効化されています」 |
| MAPPING_ALREADY_ACTIVE | 「このマッピングは既に有効です」 |
| COMPANY_SUBJECT_NOT_FOUND | 「会社科目が見つかりません」 |
| GROUP_SUBJECT_NOT_FOUND | 「連結科目が見つかりません」 |
| INVALID_COEFFICIENT | 「係数は+1または-1のみ指定できます」 |
| COMPANY_MISMATCH | 「他社のマッピングは操作できません」 |
| VALIDATION_ERROR | フィールド別インラインエラー |

### DTO Import（MANDATORY）

```typescript
import type {
  BffMappingListRequest,
  BffMappingListResponse,
  BffMappingListItem,
  BffMappingDetailResponse,
  BffCreateMappingRequest,
  BffUpdateMappingRequest,
  BffBulkMappingRequest,
  BffBulkMappingResponse,
  BffGroupSubjectSelectRequest,
  BffGroupSubjectSelectTreeResponse,
  BffGroupSubjectSelectTreeNode,
} from "@epm/contracts/bff/group-subject-mapping";
```

---

## 6. UI Components

```markdown
### Tier 1（使用必須 - @/shared/ui から）
- Button, Input, Textarea, Select, Checkbox, Label
- Table, Pagination, Card, Dialog, Alert, Badge, Tabs
- Toast/Sonner, Popover, Tooltip
- Scroll Area（ツリースクロール用）

### Tier 2（必要時のみ）
- Form (react-hook-form)

### Feature-specific Components（v0 が生成）
- MappingList.tsx（マッピング一覧テーブル）
- MappingFilterPanel.tsx（フィルタパネル）
- MappingStatsBar.tsx（統計バー）
- MappingDetailPanel.tsx（詳細パネル）
- GroupSubjectSelectDialog.tsx（連結科目選択ダイアログ）
- GroupSubjectSelectTree.tsx（ツリー表示部分）
- CreateMappingForm.tsx（マッピング設定フォーム）
- BulkMappingDialog.tsx（一括マッピングダイアログ）
- ConfirmDeleteDialog.tsx（削除確認ダイアログ）
- api/BffClient.ts, MockBffClient.ts, HttpBffClient.ts
```

---

## 7. Mock Data

### Sample Data（BFF Response 形状と一致必須）

```typescript
const mockMappingList: BffMappingListResponse = {
  items: [
    {
      id: "map-001",
      companySubjectId: "sub-001",
      companySubjectCode: "4010",
      companySubjectName: "売上高",
      companySubjectClass: "BASE",
      companySubjectType: "FIN",
      companySubjectIsContra: false,
      groupSubjectId: "gs-001",
      groupSubjectCode: "NET_SALES",
      groupSubjectName: "売上高",
      coefficient: 1,
      mappingNote: null,
      isActive: true,
      isMapped: true,
    },
    {
      id: "map-002",
      companySubjectId: "sub-002",
      companySubjectCode: "4020",
      companySubjectName: "売上割引",
      companySubjectClass: "BASE",
      companySubjectType: "FIN",
      companySubjectIsContra: true,
      groupSubjectId: "gs-001",
      groupSubjectCode: "NET_SALES",
      groupSubjectName: "売上高",
      coefficient: -1,
      mappingNote: "控除科目のためマイナス係数",
      isActive: true,
      isMapped: true,
    },
    {
      id: null,
      companySubjectId: "sub-003",
      companySubjectCode: "5010",
      companySubjectName: "仕入高",
      companySubjectClass: "BASE",
      companySubjectType: "FIN",
      companySubjectIsContra: false,
      groupSubjectId: null,
      groupSubjectCode: null,
      groupSubjectName: null,
      coefficient: null,
      mappingNote: null,
      isActive: null,
      isMapped: false,  // マッピング未設定
    },
    {
      id: null,
      companySubjectId: "sub-010",
      companySubjectCode: "K001",
      companySubjectName: "従業員数",
      companySubjectClass: "BASE",
      companySubjectType: "KPI",
      companySubjectIsContra: false,
      groupSubjectId: null,
      groupSubjectCode: null,
      groupSubjectName: null,
      coefficient: null,
      mappingNote: null,
      isActive: null,
      isMapped: false,  // KPI科目、マッピング未設定
    },
  ],
  pagination: {
    page: 1,
    pageSize: 50,
    totalCount: 125,
    totalPages: 3,
  },
  statistics: {
    mappedCount: 98,
    unmappedCount: 27,
    totalCount: 125,
  },
};

const mockGroupSubjectSelectTree: BffGroupSubjectSelectTreeResponse = {
  nodes: [
    {
      id: "gs-010",
      groupSubjectCode: "GROSS_PROFIT",
      groupSubjectName: "売上総利益",
      subjectClass: "AGGREGATE",
      subjectType: "FIN",
      isRecommended: true,  // 会社科目がFINの場合
      children: [
        {
          id: "gs-001",
          groupSubjectCode: "NET_SALES",
          groupSubjectName: "売上高",
          subjectClass: "AGGREGATE",
          subjectType: "FIN",
          isRecommended: true,
          children: [
            {
              id: "gs-002",
              groupSubjectCode: "PRODUCT_SALES",
              groupSubjectName: "製品売上高",
              subjectClass: "BASE",
              subjectType: "FIN",
              isRecommended: true,
              children: [],
            },
          ],
        },
        {
          id: "gs-011",
          groupSubjectCode: "COGS",
          groupSubjectName: "売上原価",
          subjectClass: "BASE",
          subjectType: "FIN",
          isRecommended: true,
          children: [],
        },
      ],
    },
  ],
  unassigned: [
    {
      id: "gs-100",
      groupSubjectCode: "MISC_INCOME",
      groupSubjectName: "雑収入",
      subjectClass: "BASE",
      subjectType: "FIN",
      isRecommended: true,
      children: [],
    },
  ],
};

const mockMappingDetail: BffMappingDetailResponse = {
  id: "map-001",
  companySubjectId: "sub-001",
  companySubjectCode: "4010",
  companySubjectName: "売上高",
  companySubjectClass: "BASE",
  companySubjectType: "FIN",
  companySubjectIsContra: false,
  groupSubjectId: "gs-001",
  groupSubjectCode: "NET_SALES",
  groupSubjectName: "売上高",
  groupSubjectClass: "AGGREGATE",
  groupSubjectType: "FIN",
  coefficient: 1,
  mappingNote: null,
  isActive: true,
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-05T10:30:00Z",
};
```

### States to Cover
- 通常状態（マッピング済み/未設定混在）
- 全マッピング完了状態
- マッピング未設定のみ表示（フィルタ適用）
- 空状態（会社科目なし）
- 一括選択状態
- ローディング状態
- エラー状態（重複エラー、権限エラー等）

---

## 8. Output Structure

### 出力先（v0 プロジェクト内）

v0 プレビュー用:
```
app/master-data/group-subject-mapping/
├── page.tsx
└── components/
    ├── MappingList.tsx
    ├── MappingFilterPanel.tsx
    ├── MappingStatsBar.tsx
    ├── MappingDetailPanel.tsx
    ├── GroupSubjectSelectDialog.tsx
    ├── GroupSubjectSelectTree.tsx
    ├── CreateMappingForm.tsx
    ├── BulkMappingDialog.tsx
    ├── ConfirmDeleteDialog.tsx
    └── api/
        ├── BffClient.ts
        ├── MockBffClient.ts
        └── HttpBffClient.ts
```

**Note**: v0 生成後、Claude Code が `_v0_drop/` へ移植・整形を行う

### OUTPUT.md（必須生成）

v0 は以下を含む `OUTPUT.md` を生成すること:

1. **Generated Files Tree** - 生成したファイル一覧
2. **Imports Used** - @/shared/ui から使用したコンポーネント、DTO インポート
3. **Missing Components (TODO)** - 不足している shared component があれば記載
4. **Compliance Checklist**:
   - [ ] Components from @/shared/ui only
   - [ ] DTOs from @epm/contracts/bff only
   - [ ] No raw colors (bg-[#...]) - semantic tokens only
   - [ ] No layout.tsx
   - [ ] No base UI recreated in feature
   - [ ] MockBffClient returns DTO-shaped data
   - [ ] Error codes mapped to user messages

---

## 9. 禁止事項（v0 への最終リマインダー）

```markdown
❌ PROHIBITED:
- `packages/contracts/src/api` からのインポート
- Domain API 直接呼び出し（/api/domain/...）
- fetch() を HttpBffClient 外で使用
- layout.tsx の生成
- base UI コンポーネント（button.tsx, input.tsx 等）の作成
- 生カラー（bg-[#14b8a6], bg-teal-500 等）
- 任意スペーシング（p-[16px], gap-[20px] 等）
- Sidebar/Header/Shell の独自作成

✅ REQUIRED:
- @/shared/ui からコンポーネント使用
- @epm/contracts/bff から DTO 使用
- semantic tokens（bg-primary, text-foreground, border-input 等）
- Tailwind scale（p-4, gap-4, rounded-lg 等）
- MockBffClient でモックデータ提供
- OUTPUT.md 生成
- isMapped フラグによるマッピング未設定行の視覚的区別
- 統計バーで件数表示（マッピング済み XX件 / 未設定 XX件）※進捗ゲージ・パーセント表示は不要
- 連結科目選択ダイアログのツリー表示
```

---

## 10. 特記事項（Feature固有）

```markdown
### マッピング状態の視覚的区別
- isMapped = true: 通常表示
- isMapped = false: 背景色を薄くするなど視覚的に区別
- isActive = false: 無効化状態を表示（Badge等で「無効」表示）

### 連結科目選択ダイアログのツリー表示
- group_subject_rollup_items のrollup関係に基づいてツリー構造で表示
- nodes: 親を持つ科目はAGGREGATE科目の子として表示
- unassigned: どの集計科目にも属さないBASE科目
- isRecommended: 会社科目と同じ科目タイプ（FIN/KPI）の場合、推奨マーク表示

### 控除科目と係数デフォルト
- companySubjectIsContra = true（FIN科目の控除科目）の場合
  - 係数のデフォルト値を -1 に設定
- companySubjectIsContra = false または KPI科目の場合
  - 係数のデフォルト値を +1 に設定

### 一括マッピングの挙動
- 既にマッピング済みの科目はスキップ
- 結果ダイアログで成功件数・スキップ件数を表示
- スキップされた科目IDを表示

### 統計表示
- 「マッピング済み XX件」「未設定 XX件」をカード形式で表示
- 進捗ゲージ・パーセント表示は不要
```

---

# Template End

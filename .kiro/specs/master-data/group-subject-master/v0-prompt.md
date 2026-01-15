# v0 Prompt: Group Subject Master (連結勘定科目マスタ)

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
**master-data/group-subject-master**: 連結勘定科目マスタ管理（ツリー形式の連結COA管理）

### 主要ユースケース
1. 連結勘定科目のツリー表示（AGGREGATE/BASE の階層構造）
2. 科目詳細の表示・編集（親会社のみ編集可能）
3. 通常科目（BASE）・集計科目（AGGREGATE）の新規登録
4. 集計構造（Rollup）の定義・編集（構成科目追加・削除・係数設定）
5. ドラッグ＆ドロップによる構造編集
6. 科目の無効化・再有効化
7. フィルタリング・キーワード検索
```

---

## 4. Screens

```markdown
### Screen 1: GroupSubjectTree（メイン画面）
- **Purpose**: 連結勘定科目をツリー形式で表示し、構造を視覚的に管理
- **Layout**: 左：フィルタパネル + ツリービュー、右：詳細パネル（選択時）
- **Interactions**:
  - ツリーノードの展開/折りたたみ
  - ノード選択で詳細パネル表示
  - 親会社ユーザーのみ編集ボタン表示（isParentCompany フラグで制御）
  - ドラッグ＆ドロップでツリー構造変更（親会社のみ）
  - フィルタ: キーワード、科目タイプ（FIN/KPI）、科目クラス（BASE/AGGREGATE）、有効状態

### Screen 2: GroupSubjectDetailPanel（詳細パネル）
- **Purpose**: 選択した科目の全属性を表示・編集
- **Trigger**: ツリーでノード選択
- **Display Fields**:
  - 連結勘定科目コード、科目名、科目名略称
  - 科目クラス（BASE/AGGREGATE）、科目タイプ（FIN/KPI）
  - 計上可否、メジャー種別、単位、スケール、集計方法
  - 財務属性（FINのみ）: 財務諸表区分、勘定要素、正常残高、控除科目フラグ
  - 有効フラグ、備考
  - 作成日時、更新日時
- **Actions**: 編集（親会社のみ）/ 無効化 / 再有効化

### Screen 3: CreateGroupSubjectDialog（新規登録ダイアログ）
- **Purpose**: 通常科目（BASE）または集計科目（AGGREGATE）の新規登録
- **Trigger**: 「通常科目を追加」「集計科目を追加」ボタン（親会社のみ表示）
- **Form Fields**:
  - 連結勘定科目コード* (required)
  - 科目名* (required)
  - 科目名略称 (optional)
  - 科目タイプ*: FIN / KPI (required)
  - メジャー種別* (required)
  - 単位 (optional)
  - スケール (optional, default: 0)
  - 集計方法*: SUM / EOP / AVG / MAX / MIN (required)
  - 財務属性（FIN選択時のみ）: 財務諸表区分、勘定要素、正常残高、控除科目フラグ
  - 備考 (optional)
- **Actions**: 登録 / キャンセル

### Screen 4: AddRollupDialog（構成科目追加ダイアログ）
- **Purpose**: 集計科目に構成科目を追加
- **Trigger**: AGGREGATE科目選択時の「構成科目を追加」ボタン（親会社のみ）
- **Form Fields**:
  - 構成科目* (required) - ツリー形式で選択
  - 係数*: +1 / -1 (required, default: +1)
  - 表示順 (optional)
- **Actions**: 追加 / キャンセル
- **Validation**: 循環参照チェック、BASE科目の下には追加不可

### Screen 5: ConfirmDeactivateDialog（無効化確認ダイアログ）
- **Purpose**: 科目無効化の確認
- **Trigger**: 「無効化」ボタン
- **Message**:
  - 集計科目の場合: 「この科目を無効化すると、子となっているrollup関係が削除されます。子科目自体は有効なまま残ります。無効化しますか？」
  - 通常科目の場合: 「この科目を無効化しますか？」
- **Actions**: 無効化実行 / キャンセル
```

---

## 5. BFF Contract

### Endpoints

| Method | Endpoint | Purpose | Request DTO | Response DTO |
|--------|----------|---------|-------------|--------------|
| GET | /api/bff/master-data/group-subject-master/tree | ツリー取得 | BffGroupSubjectTreeRequest | BffGroupSubjectTreeResponse |
| GET | /api/bff/master-data/group-subject-master/:id | 詳細取得 | - | BffGroupSubjectDetailResponse |
| POST | /api/bff/master-data/group-subject-master | 新規登録 | BffCreateGroupSubjectRequest | BffGroupSubjectDetailResponse |
| PATCH | /api/bff/master-data/group-subject-master/:id | 更新 | BffUpdateGroupSubjectRequest | BffGroupSubjectDetailResponse |
| POST | /api/bff/master-data/group-subject-master/:id/deactivate | 無効化 | - | BffGroupSubjectDetailResponse |
| POST | /api/bff/master-data/group-subject-master/:id/reactivate | 再有効化 | - | BffGroupSubjectDetailResponse |
| POST | /api/bff/master-data/group-subject-master/:parentId/rollup | 構成科目追加 | BffAddGroupRollupRequest | BffGroupSubjectTreeResponse |
| PATCH | /api/bff/master-data/group-subject-master/:parentId/rollup/:componentId | 構成科目更新 | BffUpdateGroupRollupRequest | BffGroupSubjectTreeResponse |
| DELETE | /api/bff/master-data/group-subject-master/:parentId/rollup/:componentId | 構成科目削除 | - | BffGroupSubjectTreeResponse |
| POST | /api/bff/master-data/group-subject-master/move | D&D移動 | BffMoveGroupSubjectRequest | BffGroupSubjectTreeResponse |

### DTOs

```typescript
// Request DTOs
interface BffGroupSubjectTreeRequest {
  keyword?: string;
  subjectType?: 'FIN' | 'KPI';
  subjectClass?: 'BASE' | 'AGGREGATE';
  isActive?: boolean;
}

interface BffCreateGroupSubjectRequest {
  groupSubjectCode: string;
  groupSubjectName: string;
  groupSubjectNameShort?: string;
  subjectClass: 'BASE' | 'AGGREGATE';
  subjectType: 'FIN' | 'KPI';
  postingAllowed?: boolean;       // BASE default: true, AGGREGATE forced: false
  measureKind: string;
  unit?: string;
  scale?: number;
  aggregationMethod: 'SUM' | 'EOP' | 'AVG' | 'MAX' | 'MIN';
  finStmtClass?: 'PL' | 'BS';     // FIN のみ
  glElement?: string;              // FIN のみ
  normalBalance?: 'debit' | 'credit'; // FIN のみ
  isContra?: boolean;
  notes?: string;
}

interface BffUpdateGroupSubjectRequest {
  groupSubjectCode?: string;
  groupSubjectName?: string;
  groupSubjectNameShort?: string;
  measureKind?: string;
  unit?: string;
  scale?: number;
  aggregationMethod?: 'SUM' | 'EOP' | 'AVG' | 'MAX' | 'MIN';
  finStmtClass?: 'PL' | 'BS';
  glElement?: string;
  normalBalance?: 'debit' | 'credit';
  isContra?: boolean;
  notes?: string;
}

interface BffAddGroupRollupRequest {
  componentGroupSubjectId: string;
  coefficient: 1 | -1;            // Phase 1: +1 or -1 only
  sortOrder?: number;
}

interface BffUpdateGroupRollupRequest {
  coefficient?: 1 | -1;
  sortOrder?: number;
}

interface BffMoveGroupSubjectRequest {
  groupSubjectId: string;
  fromParentId?: string;          // null = ルートから
  toParentId?: string;            // null = ルートへ
  coefficient?: 1 | -1;           // default: 1
}

// Response DTOs
interface BffGroupSubjectTreeNode {
  id: string;
  groupSubjectCode: string;
  groupSubjectName: string;
  subjectClass: 'BASE' | 'AGGREGATE';
  subjectType: 'FIN' | 'KPI';
  isActive: boolean;
  coefficient?: 1 | -1;           // rollup 関係の係数（子ノードのみ）
  children: BffGroupSubjectTreeNode[];
}

interface BffGroupSubjectTreeResponse {
  nodes: BffGroupSubjectTreeNode[];
  unassigned: BffGroupSubjectTreeNode[];  // どの集計科目にも属さない科目
  isParentCompany: boolean;               // 親会社フラグ（編集可否判定用）
}

interface BffGroupSubjectDetailResponse {
  id: string;
  groupSubjectCode: string;
  groupSubjectName: string;
  groupSubjectNameShort: string | null;
  subjectClass: 'BASE' | 'AGGREGATE';
  subjectType: 'FIN' | 'KPI';
  postingAllowed: boolean;
  measureKind: string;
  unit: string | null;
  scale: number;
  aggregationMethod: string;
  finStmtClass: 'PL' | 'BS' | null;
  glElement: string | null;
  normalBalance: 'debit' | 'credit' | null;
  isContra: boolean;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  isParentCompany: boolean;               // 親会社フラグ
}
```

### Errors → UI Messages

| Error Code | UI Message |
|------------|-----------|
| GROUP_SUBJECT_NOT_FOUND | 「連結勘定科目が見つかりません」 |
| GROUP_SUBJECT_CODE_DUPLICATE | 「連結勘定科目コードが重複しています」 |
| GROUP_SUBJECT_ALREADY_INACTIVE | 「この科目は既に無効化されています」 |
| GROUP_SUBJECT_ALREADY_ACTIVE | 「この科目は既に有効です」 |
| GROUP_ROLLUP_ALREADY_EXISTS | 「この構成科目は既に追加されています」 |
| GROUP_ROLLUP_NOT_FOUND | 「構成科目の関係が見つかりません」 |
| CIRCULAR_REFERENCE_DETECTED | 「循環参照が発生するため、この構成を追加できません」 |
| CANNOT_ADD_CHILD_TO_BASE | 「通常科目の下には配置できません」 |
| NOT_PARENT_COMPANY | 「この操作は親会社のみ実行可能です」 |
| INVALID_COEFFICIENT | 「係数は+1または-1のみ指定できます」 |
| VALIDATION_ERROR | フィールド別インラインエラー |

### DTO Import（MANDATORY）

```typescript
import type {
  BffGroupSubjectTreeRequest,
  BffGroupSubjectTreeResponse,
  BffGroupSubjectTreeNode,
  BffGroupSubjectDetailResponse,
  BffCreateGroupSubjectRequest,
  BffUpdateGroupSubjectRequest,
  BffAddGroupRollupRequest,
  BffUpdateGroupRollupRequest,
  BffMoveGroupSubjectRequest,
} from "@epm/contracts/bff/group-subject-master";
```

---

## 6. UI Components

```markdown
### Tier 1（使用必須 - @/shared/ui から）
- Button, Input, Textarea, Select, Checkbox, Label
- Table (for detail fields), Card, Dialog, Alert, Badge, Tabs
- Toast/Sonner, Popover, Tooltip
- Scroll Area（ツリースクロール用）

### Tier 2（必要時のみ）
- Form (react-hook-form)

### Feature-specific Components（v0 が生成）
- GroupSubjectTree.tsx（ツリービュー本体）
- GroupSubjectTreeNode.tsx（ツリーノード）
- GroupSubjectDetailPanel.tsx（詳細パネル）
- GroupSubjectFilterPanel.tsx（フィルタパネル）
- CreateGroupSubjectDialog.tsx（新規登録ダイアログ）
- AddRollupDialog.tsx（構成科目追加ダイアログ）
- ConfirmDeactivateDialog.tsx（無効化確認ダイアログ）
- api/BffClient.ts, MockBffClient.ts, HttpBffClient.ts
```

---

## 7. Mock Data

### Sample Data（BFF Response 形状と一致必須）

```typescript
const mockGroupSubjectTree: BffGroupSubjectTreeResponse = {
  nodes: [
    {
      id: "gs-001",
      groupSubjectCode: "NET_SALES",
      groupSubjectName: "売上高",
      subjectClass: "AGGREGATE",
      subjectType: "FIN",
      isActive: true,
      children: [
        {
          id: "gs-002",
          groupSubjectCode: "PRODUCT_SALES",
          groupSubjectName: "製品売上高",
          subjectClass: "BASE",
          subjectType: "FIN",
          isActive: true,
          coefficient: 1,
          children: [],
        },
        {
          id: "gs-003",
          groupSubjectCode: "SERVICE_SALES",
          groupSubjectName: "サービス売上高",
          subjectClass: "BASE",
          subjectType: "FIN",
          isActive: true,
          coefficient: 1,
          children: [],
        },
      ],
    },
    {
      id: "gs-010",
      groupSubjectCode: "GROSS_PROFIT",
      groupSubjectName: "売上総利益",
      subjectClass: "AGGREGATE",
      subjectType: "FIN",
      isActive: true,
      children: [
        {
          id: "gs-001",
          groupSubjectCode: "NET_SALES",
          groupSubjectName: "売上高",
          subjectClass: "AGGREGATE",
          subjectType: "FIN",
          isActive: true,
          coefficient: 1,
          children: [],
        },
        {
          id: "gs-011",
          groupSubjectCode: "COGS",
          groupSubjectName: "売上原価",
          subjectClass: "BASE",
          subjectType: "FIN",
          isActive: true,
          coefficient: -1,
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
      isActive: true,
      children: [],
    },
  ],
  isParentCompany: true,  // 親会社ログイン時
};

const mockGroupSubjectDetail: BffGroupSubjectDetailResponse = {
  id: "gs-001",
  groupSubjectCode: "NET_SALES",
  groupSubjectName: "売上高",
  groupSubjectNameShort: "売上",
  subjectClass: "AGGREGATE",
  subjectType: "FIN",
  postingAllowed: false,
  measureKind: "AMOUNT",
  unit: "JPY",
  scale: 0,
  aggregationMethod: "SUM",
  finStmtClass: "PL",
  glElement: "REVENUE",
  normalBalance: "credit",
  isContra: false,
  isActive: true,
  notes: "連結売上高の集計科目",
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-05T10:30:00Z",
  isParentCompany: true,
};
```

### States to Cover
- 通常状態（ツリーデータあり、親会社ログイン）
- 子会社ログイン状態（編集ボタン非表示）
- 空状態（科目なし）
- ローディング状態
- エラー状態（循環参照検出、権限エラー等）

---

## 8. Output Structure

### 出力先（v0 プロジェクト内）

v0 プレビュー用:
```
app/master-data/group-subject-master/
├── page.tsx
└── components/
    ├── GroupSubjectTree.tsx
    ├── GroupSubjectTreeNode.tsx
    ├── GroupSubjectDetailPanel.tsx
    ├── GroupSubjectFilterPanel.tsx
    ├── CreateGroupSubjectDialog.tsx
    ├── AddRollupDialog.tsx
    ├── ConfirmDeactivateDialog.tsx
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
- isParentCompany フラグによる編集ボタン表示/非表示制御
- ツリー構造のドラッグ＆ドロップ対応（dnd-kit または react-beautiful-dnd）
```

---

## 10. 特記事項（Feature固有）

```markdown
### 親会社権限制御
- isParentCompany = true の場合のみ編集系ボタン表示
- isParentCompany = false の場合は参照のみ（ツリー表示 + 詳細閲覧）

### ツリー表示の特徴
- nodes: 親を持つ科目はAGGREGATE科目の子として表示
- unassigned: どの集計科目にも属さない科目（ルートレベル）
- coefficient: 子ノードの場合のみ表示（+1/-1）

### 科目無効化時の挙動
- 集計科目を無効化した場合、その科目が親となっている rollup 関係を削除
- 子科目自体は無効化せず、有効なまま残る（unassigned に移動）

### 循環参照チェック
- ドラッグ＆ドロップ/構成科目追加時に循環参照を検出した場合はエラー表示
```

---

# Template End

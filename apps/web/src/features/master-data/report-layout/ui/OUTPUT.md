# Report Layout Master - Output Documentation

## 1) Generated files (tree)

```
apps/web/_v0_drop/master-data/report-layout/src/
├── api/
│   ├── BffClient.ts                 # BffClient interface definition
│   ├── MockBffClient.ts             # Mock implementation with sample data
│   ├── HttpBffClient.ts             # HTTP implementation for real BFF
│   └── client.ts                    # Client factory (switchable mock/real)
├── components/
│   ├── LayoutListTable.tsx          # Layout list table component
│   ├── LayoutFilters.tsx            # Search/filter component
│   ├── CreateLayoutDialog.tsx       # Layout creation dialog
│   ├── LineListTable.tsx            # Line list table with drag & drop
│   ├── LineDialog.tsx               # Line create/edit dialog
│   ├── SubjectSelectionDialog.tsx   # Subject selection dialog
│   └── LayoutPreview.tsx            # Layout preview component
├── lib/
│   ├── error-messages.ts            # Error message mappings
│   ├── line-type-labels.ts          # Line type labels and icons
│   └── layout-type-labels.ts        # Layout type labels
├── pages/
│   ├── page.tsx                     # Layout list page
│   └── [id]/
│       └── page.tsx                 # Layout detail page (1画面統合型)
└── OUTPUT.md                        # This file
```

## 2) Key imports / dependency notes

### BFF Contract DTOs
All DTOs are imported from `@epm/contracts/bff/report-layout`:
- `BffLayoutListRequest`, `BffLayoutListResponse`, `BffLayoutSummary`, `BffLayoutDetailResponse`
- `BffCreateLayoutRequest`, `BffUpdateLayoutRequest`, `BffCopyLayoutRequest`
- `BffLineListResponse`, `BffLineSummary`, `BffLineDetailResponse`
- `BffCreateLineRequest`, `BffUpdateLineRequest`, `BffMoveLineRequest`
- `BffSubjectSearchRequest`, `BffSubjectSearchResponse`, `BffSubjectSummary`
- `LayoutType`, `LineType`, `SignDisplayPolicy`

### UI Components
All UI components are imported from `@/shared/ui` (Tier 1):
- Layout: `Card`, `CardContent`, `CardHeader`, `CardTitle`, `Separator`
- Forms: `Input`, `Select`, `Button`
- Data: `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`
- Feedback: `Alert`, `Badge`
- Overlay: `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter`

### BFF Client Architecture
- `BffClient` interface defines all BFF operations
- `MockBffClient` implements mock data (currently active)
- `HttpBffClient` implements real HTTP calls (ready to use)
- `client.ts` exports a switchable client (change `USE_MOCK` flag)

### Drag & Drop
Using `@dnd-kit` library for line reordering:
- `DndContext`, `SortableContext`, `useSortable`
- Implemented in `LineListTable.tsx` and `pages/[id]/page.tsx`

## 3) Missing Shared Component / Pattern (TODO)

### Pagination Component
**Location:** `apps/web/src/shared/ui/components/pagination.tsx`

**Description:** Reusable pagination component with previous/next buttons and page indicator.

**Props:**
```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
```

**Current workaround:** Manually implemented pagination controls in page components.

### Confirmation Dialog Hook
**Location:** `apps/web/src/shared/ui/hooks/use-confirmation.tsx`

**Description:** Hook for showing confirmation dialogs with customizable messages.

**Interface:**
```typescript
interface UseConfirmationOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

function useConfirmation(): {
  confirm: (options: UseConfirmationOptions) => Promise<boolean>;
  ConfirmationDialog: React.ComponentType;
}
```

**Current workaround:** Manual Dialog implementation for delete confirmation.

## 4) Migration notes (_v0_drop → features)

### Step-by-step migration plan

1. **Move the entire `src/` folder:**
   ```
   mv apps/web/_v0_drop/master-data/report-layout/src/* \
      apps/web/src/features/master-data/report-layout/
   ```

2. **Update import paths:**
   - All imports of `@/shared/ui` should remain unchanged (assumes barrel export exists)
   - All imports from `@epm/contracts/bff/report-layout` should remain unchanged
   - Update relative imports within feature folder if structure changes

3. **Register routes:**
   - Add route entries in Next.js App Router structure
   - Update navigation menu in `apps/web/src/shared/navigation/menu.ts`:
     ```typescript
     {
       id: "report-layout",
       label: "レポートレイアウトマスタ",
       href: "/master-data/report-layout",
       icon: "LayoutIcon",
     }
     ```

4. **Switch to real BFF client:**
   - Change `USE_MOCK` to `false` in `api/client.ts`
   - Ensure BFF endpoints are implemented and accessible

5. **Integrate authentication/session:**
   - Add company selection logic based on user permissions
   - Pass `companyId` from session context to BFF requests
   - Handle multi-company scenarios

6. **Add missing shared components:**
   - Implement `Pagination` component in shared UI
   - Implement `useConfirmation` hook in shared UI
   - Refactor feature code to use these shared components

7. **Testing:**
   - Test all CRUD operations with real BFF
   - Test drag & drop line reordering
   - Test subject selection dialog filtering
   - Test error handling and validation

## 5) Constraint compliance checklist

- [x] Code written ONLY under `apps/web/_v0_drop/master-data/report-layout/src`
- [x] UI components imported ONLY from `@/shared/ui`
- [x] DTO types imported from `packages/contracts/src/bff` (no UI re-definition)
- [x] No imports from `packages/contracts/src/api`
- [x] No Domain API direct calls (/api/)
- [x] No direct fetch() outside `api/HttpBffClient.ts`
- [x] No layout.tsx generated
- [x] No base UI components created under features
- [x] No raw color literals (bg-[#...], etc.)
- [x] No new sidebar/header/shell created inside the feature

## Additional Notes

### Design System
- Uses EPM Design System with Deep Teal & Royal Indigo theme
- All components follow Tier 1 component patterns
- Semantic design tokens used throughout (bg-background, text-foreground, etc.)

### State Management
- Local state management using React hooks (useState, useEffect)
- No global state management (SWR or Redux) implemented yet
- Consider adding SWR for data caching and sync in future iterations

### Error Handling
- All errors are caught and displayed using Alert component
- Error messages are mapped to user-friendly Japanese messages
- Validation errors shown inline per field

### Accessibility
- Semantic HTML structure maintained
- Form labels properly associated with inputs
- Button states (disabled, loading) communicated clearly
- Screen reader considerations for table navigation

### Performance Considerations
- Mock data includes delay simulation (300ms) for realistic UX testing
- Pagination implemented to limit data rendering
- Drag & drop uses efficient library (@dnd-kit)
- Components are split appropriately to enable code splitting

### Known Limitations
1. Company selection dropdown not implemented (assumes single company context)
2. Sort functionality in list page not fully implemented
3. Layout type change warning dialog not implemented
4. Inactive subject alert in preview not implemented
5. Real-time validation for duplicate layout codes not implemented

### Future Enhancements
1. Add real-time search with debouncing
2. Implement optimistic UI updates for better UX
3. Add keyboard shortcuts for common actions
4. Implement bulk operations (multi-select delete, etc.)
5. Add export/import functionality for layouts
6. Implement layout templates for quick creation
```

EPM SaaSのレポートレイアウトマスタ管理機能のUIモジュールを生成しました。主な特徴:

**生成されたファイル構成:**
- **API層**: BffClient インターフェース、MockBffClient（モックデータ）、HttpBffClient（実装準備済み）
- **コンポーネント**: レイアウト一覧テーブル、フィルタ、ダイアログ、行管理、プレビュー等
- **ページ**: 一覧ページと詳細ページ（1画面統合型）
- **ユーティリティ**: エラーメッセージマッピング、ラベル定義

**実装された機能:**
1. レイアウト一覧表示（検索・フィルタ・ページネーション対応）
2. レイアウト詳細表示と編集（基本情報＋行リストを同じ画面で管理）
3. 行の追加・編集・削除・並べ替え（ドラッグ＆ドロップ対応）
4. 科目選択ダイアログ（検索・ページネーション対応）
5. レイアウトプレビュー表示
6. 無効化/再有効化/複製機能

**設計のポイント:**
- BFF経由のみでデータ取得（Domain API直接呼び出しなし）
- `@epm/contracts/bff`のDTOを使用
- EPMデザインシステム（Deep Teal & Royal Indigo）を適用
- モックデータから開始、実装準備済みのHttpClientへ切り替え可能

OUTPUT.mdに詳細な移行手順と制約チェックリストを記載しています。

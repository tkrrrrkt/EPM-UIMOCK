# Architectural Decision: Simplified Layout System

**Status**: ACCEPTED
**Date**: 2026-01-29
**Context**: Meeting Report Layout Architecture Simplification

---

## Context

### Initial Design
The original specification defined a **flexible 3-tier layout system**:
- Layout → Pages (FIXED/PER_DEPARTMENT/PER_BU) → Components
- Multiple pages per layout with dynamic expansion
- 9 component types with complex configuration
- 5 functional requirements (FR-5 to FR-9) for page CRUD operations

### Reality Check
1. **UI Implementation**: Already uses **hardcoded fixed tabs**, not dynamic pages
2. **User Needs**: Most meeting reports use **standardized tab structure**
3. **Complexity**: Multi-page CRUD adds 74% more implementation scope
4. **Time to Market**: Simplified architecture can ship 30-40% faster

---

## Decision

**Simplify to**: One layout → One auto-managed page → N components per meeting type

**Strategy**: Keep 3-tier structure with constraints (Option A)
- ✅ Keep `meeting_report_layouts` → `meeting_report_pages` → `meeting_report_components`
- ✅ Add constraint: Each layout has **exactly ONE page** (auto-created, system-managed)
- ✅ Page is **auto-created** when layout is created (pageCode='DASHBOARD', pageType='FIXED')
- ✅ Page is **system-managed** (users cannot add/edit/delete pages)
- ✅ Users configure **components only**
- ✅ No contract/entity changes needed
- ✅ No database schema changes needed (since tables don't exist yet)

**Fixed Tab Structure**:
- **サマリー**: Dashboard from layout settings (configurable components)
- **部門報告**: Display using form settings structure (fixed, all sections)
- **KPI・AP**: Fixed display (embedded KPI feature)
- **詳細分析**: Fixed display (report links)
- **前回比較**: Phase 3 (on hold)
- **議事録**: Registration form using form settings (fixed, MEETING_MINUTES sections only)

**Minutes (議事録) Strategy**:
- Reuse form settings infrastructure (no schema changes)
- Meeting minutes form is **ONE fixed form per meeting type**
- Identified by `sectionCode='MEETING_MINUTES'` in meeting_form_sections
- Contains predefined sections: 議論内容、決定事項、課題・リスク、フォローアップ
- Manager enters minutes **after** meeting (not submission-based like department reports)
- Stored in separate `meeting_minutes` transaction table (future implementation)

---

## Consequences

### Positive ✅
- **74% complexity reduction**: 4×10×20 → 3×3×12 MOCK data
- **60% spec reduction**: Remove 5 functional requirements
- **Clear UX**: Users focus on component placement, not page management
- **Fast implementation**: Eliminate page CRUD UI (~2+ days saved)
- **No breaking changes**: Keep existing contracts intact
- **Future-proof**: Can relax constraints later if needed (no schema migration)

### Negative ⚠️
- **3 tables instead of 2**: Page table still exists (minimal cost)
- **Blocked endpoints**: Page CRUD operations return 4xx errors
- **Lost flexibility**: Cannot create per-department dynamic pages
- **UI updates needed**: Remove page management components

### Mitigation
- Document constraints clearly in specs and UI tooltips
- Add validation layer in BFF service to block page operations
- Keep entity structure for potential future enhancement
- Provide clear error messages for blocked operations

---

## Alternatives Considered

### Option B: 2-Tier (Layout → Components)
**Rejected** because:
- ❌ Breaking change to all contracts (high risk)
- ❌ Loss of page-level metadata (name, sort order, type)
- ❌ UI preview logic assumes Page concept exists
- ❌ High rollback risk if requirements change
- ❌ May need changes when tables are implemented

### Option C: Full Multi-Page Dynamic
**Rejected** because:
- ❌ UI already uses fixed tabs (architecture mismatch)
- ❌ 8-10 developer-days additional effort
- ❌ Complexity not justified by current requirements

---

## Implementation Details

### Constraints

**meeting_report_layouts**:
- `@@unique([tenantId, meetingTypeId])` - Exactly ONE layout per meeting type
- `isDefault` always TRUE (no choice)

**meeting_report_pages**:
- `@@unique([tenantId, layoutId])` - Exactly ONE page per layout
- `pageCode` always 'DASHBOARD'
- `pageType` always 'FIXED'
- `pageName` always 'ダッシュボード設定'

### Validation Rules (BFF Service Layer)

**CreateReportLayout**:
```
1. Check for existing layout for this meeting type → throw 409 if found
2. Insert layout with is_default=true
3. Auto-create page with:
   - pageCode='DASHBOARD'
   - pageType='FIXED'
   - pageName='ダッシュボード設定'
```

**Page CRUD Operations (Blocked)**:
- `POST /report-pages`: 409 - "ページは自動管理されています"
- `PUT /report-pages/:id`: 422 - "ページはシステム管理されています"
- `DELETE /report-pages/:id`: 422 - "レイアウトを削除してください"
- `GET /report-pages`: ✅ Allowed (read-only)

### Code Changes

**Files to Remove**:
- `create-page-dialog.tsx`
- `page-detail-panel.tsx`
- `page-reorder-controls.tsx`

**Files to Update**:
- `layout-tree.tsx` - Page node is display-only (gray, non-clickable)
- `DetailPanel` components - Remove page editing UI

**Specs to Update**:
- `requirements.md` - Remove FR-5 to FR-9
- `design.md` - Simplify architecture, add validation rules
- `仕様概要/経営会議レポート機能.md` - Clarify fixed-tab structure
- `tasks.md` - Remove page CRUD tasks

**MOCK Data to Simplify**:
- Reduce from 4 layouts × 10 pages × 20 components → 3 layouts × 3 pages × 12 components

---

## References

- Original Spec: `.kiro/specs/meetings/meeting-report-layout/requirements.md`
- Entity Definition: `.kiro/specs/仕様検討/20260115_経営会議レポート機能.md`
- MOCK Data: `apps/web/src/features/meetings/meeting-report-layout/api/mock-bff-client.ts`
- Form Settings: `apps/web/src/features/meetings/meeting-form-settings/api/mock-bff-client.ts`

---

## Sign-Off

**Approved by**: Architecture Planning
**Date**: 2026-01-29
**Effective**: Immediately (Phase 1 implementation)

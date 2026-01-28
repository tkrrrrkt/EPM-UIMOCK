# Action Plan BFF Integration for KPI Master (Task 5.4)

## Purpose

Extend Action Plan BFF layer to support `kpiMasterItemId` linkage, enabling Action Plans to be created and linked to KPI Master Items.

## Integration Requirements

### 1. BFF Contracts Extension (Already Done - Task 2.5)

BFF Contracts have been extended in `packages/contracts/src/bff/action-plan-core/`:

```typescript
export interface CreateActionPlanDto {
  planCode: string;
  planName: string;
  description?: string;
  /** 財務科目ID（subjectIdとkpiMasterItemIdはどちらか1つが必須、排他的） */
  subjectId?: string;
  /** KPI項目ID（subjectIdとkpiMasterItemIdはどちらか1つが必須、排他的） */
  kpiMasterItemId?: string;  // ADDED
  ownerDepartmentStableId?: string;
  ownerEmployeeId?: string;
  startDate?: string;
  dueDate?: string;
  priority?: ActionPlanPriority;
}
```

### 2. BFF Controller Extension

When `ActionPlanBffController` is implemented, extend the `POST /api/bff/action-plan-core/plans` endpoint:

```typescript
/**
 * POST /api/bff/action-plan-core/plans
 * Create new Action Plan (with KPI Master Item support)
 */
@Post('plans')
async createPlan(
  @Headers('x-tenant-id') tenantId: string,
  @Headers('x-user-id') userId: string,
  @Body() data: CreateActionPlanDto,
): Promise<ActionPlanDto> {
  // Validation: Exactly one of subjectId or kpiMasterItemId must be provided
  if (!data.subjectId && !data.kpiMasterItemId) {
    throw new BadRequestException(
      'Either subjectId or kpiMasterItemId must be provided'
    );
  }

  if (data.subjectId && data.kpiMasterItemId) {
    throw new BadRequestException(
      'Cannot provide both subjectId and kpiMasterItemId'
    );
  }

  // Pass to BFF service
  return this.actionPlanService.createPlan(tenantId, userId, data);
}
```

### 3. BFF Service Extension

When `ActionPlanBffService` is implemented, update the `createPlan` method:

```typescript
async createPlan(
  tenantId: string,
  userId: string,
  data: CreateActionPlanDto,
): Promise<ActionPlanDto> {
  // Map BFF DTO to API DTO
  const apiData: CreateActionPlanApiDto = {
    planCode: data.planCode,
    planName: data.planName,
    description: data.description,
    subjectId: data.subjectId,
    kpiMasterItemId: data.kpiMasterItemId,  // PASS TO API
    ownerDepartmentStableId: data.ownerDepartmentStableId,
    ownerEmployeeId: data.ownerEmployeeId,
    startDate: data.startDate,
    dueDate: data.dueDate,
    priority: data.priority,
  };

  // Call Domain API
  const response = await this.callDomainApi<ActionPlanApiDto>(
    'POST',
    '/action-plan-core/plans',
    tenantId,
    { data: apiData },
    userId,
  );

  // Map API DTO to BFF DTO
  return ActionPlanMapper.toActionPlanDto(response.data);
}
```

### 4. Error Handling

Domain API will return specific errors for KPI Master Item validation:

```typescript
// Possible errors from Domain API:
// - ActionPlanInvalidReferenceError (exclusivity violation)
// - KpiMasterItemNotFoundError (kpiMasterItemId not found)
// - KpiMasterItemAccessDeniedError (permission denied)

// BFF Error Policy: Pass-through (no transformation)
// UI will handle error display based on error codes
```

### 5. BFF Response Enhancement

When Action Plans are fetched with `kpiMasterItemId`, include KPI item details in response:

```typescript
export interface ActionPlanDto {
  // ... existing fields
  subjectId?: string;
  kpiMasterItemId?: string;
  // Enhanced fields (BFF responsibility)
  kpiItemName?: string;  // Joined from kpi_master_items
  subjectName?: string;  // Joined from subjects
}
```

BFF Mapper should join master data:

```typescript
const ActionPlanMapper = {
  toActionPlanDto(
    apiDto: ActionPlanApiDto,
    kpiItem?: KpiMasterItemApiDto,
    subject?: SubjectApiDto,
  ): ActionPlanDto {
    return {
      // ... map API fields
      kpiMasterItemId: apiDto.kpiMasterItemId,
      kpiItemName: kpiItem?.kpiName,  // BFF joins master data
      subjectId: apiDto.subjectId,
      subjectName: subject?.subjectName,  // BFF joins master data
    };
  },
};
```

## Integration Checklist

- [ ] 1. Verify BFF Contracts extension (already done in Task 2.5)
- [ ] 2. Extend `ActionPlanBffController.createPlan` with kpiMasterItemId validation
- [ ] 3. Update `ActionPlanBffService.createPlan` to pass kpiMasterItemId to Domain API
- [ ] 4. Implement error handling for KPI Master Item validation errors
- [ ] 5. Enhance `ActionPlanDto` response with kpiItemName (master data join)
- [ ] 6. Update `ActionPlanMapper` to join KPI item names
- [ ] 7. Add `kpiMasterItemId` filter to Action Plan list endpoint
- [ ] 8. Test Action Plan creation with both subjectId and kpiMasterItemId
- [ ] 9. Test exclusivity constraint validation
- [ ] 10. Test UI display of Action Plans linked to KPI items

## Database Schema Reference

Action Plan table already extended (Task 3.1):

```sql
CREATE TABLE "action_plans" (
  -- ... existing fields
  "subject_id" UUID,
  "kpi_master_item_id" UUID,  -- ADDED
  -- ... other fields

  CONSTRAINT "action_plans_ref_exclusivity_check"
  CHECK (subject_id IS NOT NULL OR kpi_master_item_id IS NOT NULL)
);

-- Composite FK to kpi_master_items
ALTER TABLE "action_plans"
  ADD CONSTRAINT "action_plans_kpi_master_item_fk"
  FOREIGN KEY (tenant_id, kpi_master_item_id)
  REFERENCES kpi_master_items(tenant_id, id);
```

## Domain API Integration Reference

Domain API integration already prepared (Task 4.12):

```typescript
// Domain API validates kpiMasterItemId using:
import { validateActionPlanKpiReference } from '../kpi/kpi-master/integrations/action-plan-integration';

// In ActionPlanService.createPlan:
await validateActionPlanKpiReference(
  tenantId,
  data.subjectId,
  data.kpiMasterItemId,
  this.kpiMasterItemRepo,
);
```

## UI Integration Notes

When UI implements Action Plan modals for KPI items:

1. **KPI Item Detail Panel**:
   - "Add Action Plan" button opens modal
   - Modal pre-fills `kpiMasterItemId` from current KPI item
   - `subjectId` field hidden (auto-excluded)

2. **Action Plan Modal**:
   - Displays KPI item name (read-only)
   - User fills plan details (planCode, planName, dates, priority)
   - Submission calls `POST /api/bff/action-plan-core/plans`

3. **Action Plan List**:
   - Shows linked KPI item name (if kpiMasterItemId present)
   - Shows linked subject name (if subjectId present)
   - Filter by kpiMasterItemId to show plans for specific KPI item

## Summary

Action Plan BFF extension is **preparedness work** for when Action Plan module is implemented. All contracts and database schema are ready. BFF layer needs to:

1. Pass `kpiMasterItemId` from UI to Domain API
2. Validate exclusivity constraint at BFF level (optional, Domain API enforces)
3. Join KPI item names for enhanced responses
4. Handle KPI Master Item validation errors (pass-through)

**Contracts Status**: ✅ Complete (Task 2.5)
**Database Status**: ✅ Complete (Task 3.1)
**Domain API Status**: ✅ Complete (Task 4.12)
**BFF Status**: ⏳ Prepared (this document)
**UI Status**: ⏳ Pending (Task 6.5)

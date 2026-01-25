/**
 * Action Plan Integration for KPI Master
 *
 * Purpose:
 * - Extend Action Plan service to support kpiMasterItemId
 * - Validate kpiMasterItemId when creating Action Plans linked to KPI items
 * - Enforce exclusivity constraint (subjectId XOR kpiMasterItemId)
 *
 * Integration Requirements (Task 4.12):
 * 1. ActionPlanService.createActionPlan method extension
 * 2. Accept kpiMasterItemId parameter
 * 3. Validate exclusivity constraint (exactly one of subjectId or kpiMasterItemId required)
 * 4. Verify kpi_master_items existence when kpiMasterItemId provided
 * 5. Record audit log with kpi_master_item_id
 *
 * Database Constraint:
 * - action_plans table CHECK constraint ensures: subject_id IS NOT NULL OR kpi_master_item_id IS NOT NULL
 * - This validates at database level, but application-level check recommended for clearer errors
 *
 * Usage Example (when ActionPlanService exists):
 *
 * ```typescript
 * import { ActionPlanService } from '../action-plan-core/action-plan.service';
 * import { KpiMasterItemRepository } from '../kpi/kpi-master/repositories/kpi-master-item.repository';
 * import { validateActionPlanKpiReference } from '../kpi/kpi-master/integrations/action-plan-integration';
 *
 * @Injectable()
 * export class ActionPlanService {
 *   constructor(
 *     private readonly kpiMasterItemRepo: KpiMasterItemRepository,
 *   ) {}
 *
 *   async createActionPlan(
 *     tenantId: string,
 *     data: CreateActionPlanApiDto,
 *     userId?: string,
 *   ): Promise<ActionPlanApiDto> {
 *     // Validate KPI reference
 *     await validateActionPlanKpiReference(
 *       tenantId,
 *       data.subjectId,
 *       data.kpiMasterItemId,
 *       this.kpiMasterItemRepo,
 *     );
 *
 *     // Create action plan with kpiMasterItemId
 *     const plan = await this.actionPlanRepo.create({
 *       ...data,
 *       kpi_master_item_id: data.kpiMasterItemId,
 *     });
 *
 *     // Record audit log
 *     // await this.auditLogService.log({
 *     //   tenantId,
 *     //   userId,
 *     //   action: 'CREATE_ACTION_PLAN',
 *     //   resourceId: plan.id,
 *     //   resourceType: 'action_plans',
 *     //   metadata: { kpi_master_item_id: data.kpiMasterItemId },
 *     // });
 *
 *     return plan;
 *   }
 * }
 * ```
 */

import { KpiMasterItemRepository } from '../repositories/kpi-master-item.repository';
import {
  ActionPlanInvalidReferenceError,
  KpiMasterItemNotFoundError,
} from '@epm-sdd/contracts/shared/errors';

/**
 * Validate Action Plan KPI reference
 *
 * Business Rules:
 * - Exactly one of subjectId or kpiMasterItemId must be provided (exclusivity)
 * - If kpiMasterItemId provided, verify kpi_master_items existence
 * - Database CHECK constraint enforces this, but application validation provides clearer errors
 *
 * @param tenantId - Tenant ID (required)
 * @param subjectId - Subject ID (financial KPI reference)
 * @param kpiMasterItemId - KPI Master Item ID (KPI hierarchy reference)
 * @param kpiMasterItemRepo - KPI Master Item repository for existence check
 * @throws ActionPlanInvalidReferenceError if exclusivity constraint violated
 * @throws KpiMasterItemNotFoundError if kpiMasterItemId not found
 */
export async function validateActionPlanKpiReference(
  tenantId: string,
  subjectId: string | undefined,
  kpiMasterItemId: string | undefined,
  kpiMasterItemRepo: KpiMasterItemRepository,
): Promise<void> {
  // Business Rule: Exactly one of subjectId or kpiMasterItemId must be provided
  if (!subjectId && !kpiMasterItemId) {
    throw new ActionPlanInvalidReferenceError(
      'Action Plan must reference either a Subject (subjectId) or a KPI Master Item (kpiMasterItemId)',
    );
  }

  if (subjectId && kpiMasterItemId) {
    throw new ActionPlanInvalidReferenceError(
      'Action Plan cannot reference both Subject and KPI Master Item. Use only one.',
    );
  }

  // Business Rule: If kpiMasterItemId provided, verify existence
  if (kpiMasterItemId) {
    const kpiItem = await kpiMasterItemRepo.findById(tenantId, kpiMasterItemId);

    if (!kpiItem) {
      throw new KpiMasterItemNotFoundError(
        `KPI Master Item not found: ${kpiMasterItemId}`,
      );
    }
  }

  // Note: subjectId existence check should be handled by ActionPlanService
  // when validating financial subject references
}

/**
 * Integration Checklist for Action Plan Service Extension:
 *
 * [ ] 1. Import validateActionPlanKpiReference from this file
 * [ ] 2. Inject KpiMasterItemRepository into ActionPlanService constructor
 * [ ] 3. Call validateActionPlanKpiReference in createActionPlan method
 * [ ] 4. Pass kpiMasterItemId to action_plans repository create method
 * [ ] 5. Update Action Plan API contracts to include kpiMasterItemId (already done in Task 2.5)
 * [ ] 6. Update Action Plan BFF contracts to include kpiMasterItemId (already done in Task 2.5)
 * [ ] 7. Add kpi_master_item_id to audit log metadata
 * [ ] 8. Update Action Plan queries to JOIN kpi_master_items when kpiMasterItemId present
 * [ ] 9. Add kpiMasterItemId filter to Action Plan list endpoint
 * [ ] 10. Test exclusivity constraint with both database and application-level validation
 *
 * Database Schema Reference:
 * - action_plans.kpi_master_item_id: UUID (nullable)
 * - action_plans.subject_id: UUID (nullable)
 * - CHECK constraint: subject_id IS NOT NULL OR kpi_master_item_id IS NOT NULL
 * - Composite FK: (tenant_id, kpi_master_item_id) REFERENCES kpi_master_items(tenant_id, id)
 *
 * Contracts Reference:
 * - CreateActionPlanDto (BFF): Added kpiMasterItemId?: string (Task 2.5)
 * - CreateActionPlanApiDto (API): Added kpiMasterItemId?: string (Task 2.5)
 * - Both contracts have exclusivity documentation in comments
 */

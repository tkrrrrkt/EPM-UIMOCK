/**
 * BffClient Interface for Headcount Planning
 *
 * Following the pattern from labor-cost-rate feature.
 */

import type {
  BffHeadcountContextRequest,
  BffHeadcountContextResponse,
  BffListResourcePlansRequest,
  BffListResourcePlansResponse,
  BffResourcePlanDetailResponse,
  BffCreateResourcePlanRequest,
  BffUpdateResourcePlanRequest,
  BffResourcePlanResponse,
  BffUpdateResourcePlanMonthsRequest,
  BffResourcePlanMonthsResponse,
  BffUpdateResourceAllocationsRequest,
  BffResourceAllocationsResponse,
  BffListIndividualAllocationsRequest,
  BffListIndividualAllocationsResponse,
  BffCreateIndividualAllocationRequest,
  BffUpdateIndividualAllocationRequest,
  BffIndividualAllocationResponse,
  BffHeadcountSummaryRequest,
  BffHeadcountSummaryResponse,
  BffApplyBudgetRequest,
  BffApplyBudgetResponse,
  BffListLaborCostRatesForPlanningRequest,
  BffListLaborCostRatesForPlanningResponse,
  BffLaborCostRateForPlanningDetailResponse,
  BffHeadcountPlanningError,
} from "@epm/contracts/bff/headcount-planning"

export interface BffClient {
  // Context
  getContext(request: BffHeadcountContextRequest): Promise<BffHeadcountContextResponse>

  // Resource Plans (Layer 1)
  listResourcePlans(request: BffListResourcePlansRequest): Promise<BffListResourcePlansResponse>
  getResourcePlanDetail(id: string): Promise<BffResourcePlanDetailResponse>
  createResourcePlan(request: BffCreateResourcePlanRequest): Promise<BffResourcePlanResponse>
  updateResourcePlan(id: string, request: BffUpdateResourcePlanRequest): Promise<BffResourcePlanResponse>
  deleteResourcePlan(id: string): Promise<void>
  updateResourcePlanMonths(
    id: string,
    request: BffUpdateResourcePlanMonthsRequest
  ): Promise<BffResourcePlanMonthsResponse>
  updateResourceAllocations(
    id: string,
    request: BffUpdateResourceAllocationsRequest
  ): Promise<BffResourceAllocationsResponse>

  // Individual Allocations (Layer 2)
  listIndividualAllocations(
    request: BffListIndividualAllocationsRequest
  ): Promise<BffListIndividualAllocationsResponse>
  createIndividualAllocation(
    request: BffCreateIndividualAllocationRequest
  ): Promise<BffIndividualAllocationResponse>
  updateIndividualAllocation(
    individualKey: string,
    request: BffUpdateIndividualAllocationRequest
  ): Promise<BffIndividualAllocationResponse>
  deleteIndividualAllocation(individualKey: string): Promise<void>

  // Summary
  getHeadcountSummary(request: BffHeadcountSummaryRequest): Promise<BffHeadcountSummaryResponse>

  // Apply Budget
  applyBudget(request: BffApplyBudgetRequest): Promise<BffApplyBudgetResponse>

  // Labor Cost Rates (Reference)
  listLaborCostRates(request: BffListLaborCostRatesForPlanningRequest): Promise<BffListLaborCostRatesForPlanningResponse>
  getLaborCostRateDetail(id: string): Promise<BffLaborCostRateForPlanningDetailResponse>
}

export class BffClientError extends Error {
  constructor(public readonly error: BffHeadcountPlanningError) {
    super(error.message)
    this.name = "BffClientError"
  }
}

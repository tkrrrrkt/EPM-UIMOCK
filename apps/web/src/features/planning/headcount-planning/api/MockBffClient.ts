/**
 * MockBffClient for Headcount Planning
 *
 * Provides mock data for development and testing.
 * Based on design.md specifications and PROMPT.md mock data.
 */

import type { BffClient } from "./BffClient"
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
  BffResourcePlanSummary,
  BffIndividualAllocationSummary,
  BffLaborCostRateForPlanningSummary,
  BffDepartmentRef,
} from "@epm/contracts/bff/headcount-planning"

// ============================================
// Mock Data
// ============================================

const MOCK_DEPARTMENTS: BffDepartmentRef[] = [
  { id: "dept-1", stableId: "DEPT-A1", code: "A1", name: "A1課" },
  { id: "dept-2", stableId: "DEPT-A2", code: "A2", name: "A2課" },
  { id: "dept-3", stableId: "DEPT-A3", code: "A3", name: "A3課" },
  { id: "dept-4", stableId: "DEPT-A4", code: "A4", name: "A4課" },
  { id: "dept-5", stableId: "DEPT-B1", code: "B1", name: "B1課" },
  { id: "dept-6", stableId: "DEPT-B2", code: "B2", name: "B2課" },
]

const MOCK_RESOURCE_PLANS: BffResourcePlanSummary[] = [
  {
    id: "rp-1",
    resourceType: "EMPLOYEE",
    jobCategory: "エンジニア",
    grade: "シニア",
    sourceDepartment: MOCK_DEPARTMENTS[0],
    rate: { id: "rate-1", code: "ENG-SR", totalRate: "800000", rateType: "MONTHLY" },
    customRate: null,
    rateType: "MONTHLY",
    totalHeadcount: "11.50",
    annualAmount: "110400000",
    allocationStatus: "COMPLETE",
    months: [
      { periodMonth: 1, headcount: "10.00" },
      { periodMonth: 2, headcount: "10.00" },
      { periodMonth: 3, headcount: "10.00" },
      { periodMonth: 4, headcount: "10.00" },
      { periodMonth: 5, headcount: "10.00" },
      { periodMonth: 6, headcount: "10.00" },
      { periodMonth: 7, headcount: "13.00" },
      { periodMonth: 8, headcount: "13.00" },
      { periodMonth: 9, headcount: "13.00" },
      { periodMonth: 10, headcount: "13.00" },
      { periodMonth: 11, headcount: "13.00" },
      { periodMonth: 12, headcount: "13.00" },
    ],
  },
  {
    id: "rp-2",
    resourceType: "EMPLOYEE",
    jobCategory: "エンジニア",
    grade: "ジュニア",
    sourceDepartment: MOCK_DEPARTMENTS[0],
    rate: { id: "rate-2", code: "ENG-JR", totalRate: "500000", rateType: "MONTHLY" },
    customRate: null,
    rateType: "MONTHLY",
    totalHeadcount: "5.00",
    annualAmount: "30000000",
    allocationStatus: "COMPLETE",
    months: Array.from({ length: 12 }, (_, i) => ({
      periodMonth: i + 1,
      headcount: "5.00",
    })),
  },
  {
    id: "rp-3",
    resourceType: "CONTRACTOR",
    jobCategory: "デザイナー",
    grade: null,
    sourceDepartment: MOCK_DEPARTMENTS[0],
    rate: { id: "rate-3", code: "DES-EXT", totalRate: "600000", rateType: "MONTHLY" },
    customRate: null,
    rateType: "MONTHLY",
    totalHeadcount: "2.00",
    annualAmount: "14400000",
    allocationStatus: "COMPLETE",
    months: Array.from({ length: 12 }, (_, i) => ({
      periodMonth: i + 1,
      headcount: "2.00",
    })),
  },
]

const MOCK_INDIVIDUAL_ALLOCATIONS: BffIndividualAllocationSummary[] = [
  {
    individualKey: "ind-1",
    employeeStableId: "EMP-001",
    individualName: "田中部長",
    sourceDepartment: MOCK_DEPARTMENTS[0],
    jobCategory: "管理職",
    grade: "部長",
    rate: { id: "rate-4", code: "MGR-DIR", totalRate: "1200000", rateType: "MONTHLY" },
    customRate: null,
    rateType: "MONTHLY",
    totalPercentage: "100.00",
    annualAmount: "14400000",
    allocations: [
      {
        id: "alloc-1",
        targetDepartment: MOCK_DEPARTMENTS[0],
        percentage: "40.00",
        annualAmount: "5760000",
      },
      {
        id: "alloc-2",
        targetDepartment: MOCK_DEPARTMENTS[2],
        percentage: "30.00",
        annualAmount: "4320000",
      },
      {
        id: "alloc-3",
        targetDepartment: MOCK_DEPARTMENTS[3],
        percentage: "30.00",
        annualAmount: "4320000",
      },
    ],
  },
  {
    individualKey: "ind-2",
    employeeStableId: "EMP-002",
    individualName: "山田課長",
    sourceDepartment: MOCK_DEPARTMENTS[4],
    jobCategory: "管理職",
    grade: "課長",
    rate: { id: "rate-5", code: "MGR-MGR", totalRate: "900000", rateType: "MONTHLY" },
    customRate: null,
    rateType: "MONTHLY",
    totalPercentage: "100.00",
    annualAmount: "10800000",
    allocations: [
      {
        id: "alloc-4",
        targetDepartment: MOCK_DEPARTMENTS[4],
        percentage: "70.00",
        annualAmount: "7560000",
      },
      {
        id: "alloc-5",
        targetDepartment: MOCK_DEPARTMENTS[5],
        percentage: "30.00",
        annualAmount: "3240000",
      },
    ],
  },
]

const MOCK_LABOR_COST_RATES: BffLaborCostRateForPlanningSummary[] = [
  {
    id: "rate-1",
    rateCode: "ENG-SR",
    resourceType: "EMPLOYEE",
    jobCategory: "エンジニア",
    grade: "シニア",
    vendorName: null,
    employmentType: "REGULAR",
    rateType: "MONTHLY",
    totalRate: "800000",
    effectiveDate: "2026-04-01",
    expiryDate: null,
    isActive: true,
  },
  {
    id: "rate-2",
    rateCode: "ENG-JR",
    resourceType: "EMPLOYEE",
    jobCategory: "エンジニア",
    grade: "ジュニア",
    vendorName: null,
    employmentType: "REGULAR",
    rateType: "MONTHLY",
    totalRate: "500000",
    effectiveDate: "2026-04-01",
    expiryDate: null,
    isActive: true,
  },
  {
    id: "rate-3",
    rateCode: "DES-EXT",
    resourceType: "CONTRACTOR",
    jobCategory: "デザイナー",
    grade: null,
    vendorName: "デザインパートナーズ",
    employmentType: null,
    rateType: "MONTHLY",
    totalRate: "600000",
    effectiveDate: "2026-04-01",
    expiryDate: null,
    isActive: true,
  },
  {
    id: "rate-4",
    rateCode: "MGR-DIR",
    resourceType: "EMPLOYEE",
    jobCategory: "管理職",
    grade: "部長",
    vendorName: null,
    employmentType: "REGULAR",
    rateType: "MONTHLY",
    totalRate: "1200000",
    effectiveDate: "2026-04-01",
    expiryDate: null,
    isActive: true,
  },
  {
    id: "rate-5",
    rateCode: "MGR-MGR",
    resourceType: "EMPLOYEE",
    jobCategory: "管理職",
    grade: "課長",
    vendorName: null,
    employmentType: "REGULAR",
    rateType: "MONTHLY",
    totalRate: "900000",
    effectiveDate: "2026-04-01",
    expiryDate: null,
    isActive: true,
  },
]

// ============================================
// Delay utility for realistic behavior
// ============================================

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// ============================================
// MockBffClient Implementation
// ============================================

export class MockBffClient implements BffClient {
  private resourcePlans = [...MOCK_RESOURCE_PLANS]
  private individualAllocations = [...MOCK_INDIVIDUAL_ALLOCATIONS]

  async getContext(_request: BffHeadcountContextRequest): Promise<BffHeadcountContextResponse> {
    await delay(200)
    return {
      fiscalYears: [
        { value: 2026, label: "2026年度" },
        { value: 2025, label: "2025年度" },
        { value: 2024, label: "2024年度" },
      ],
      planEvents: [
        { id: "event-1", code: "BUDGET-2026", name: "当初予算", scenarioType: "BUDGET", allocationCheckMode: "ERROR" },
        { id: "event-2", code: "REVISED-2026", name: "補正予算", scenarioType: "BUDGET", allocationCheckMode: "WARN" },
        { id: "event-3", code: "FORECAST-2026", name: "見込", scenarioType: "FORECAST", allocationCheckMode: "WARN" },
      ],
      planVersions: [
        { id: "version-1", code: "V1", name: "第1回", status: "DRAFT" },
        { id: "version-2", code: "V2", name: "第2回", status: "SUBMITTED" },
        { id: "version-3", code: "V3", name: "第3回", status: "APPROVED" },
      ],
      departments: MOCK_DEPARTMENTS,
    }
  }

  async listResourcePlans(request: BffListResourcePlansRequest): Promise<BffListResourcePlansResponse> {
    await delay(300)

    let filtered = [...this.resourcePlans]

    // Apply filters
    if (request.resourceType) {
      filtered = filtered.filter((p) => p.resourceType === request.resourceType)
    }
    if (request.keyword) {
      const kw = request.keyword.toLowerCase()
      filtered = filtered.filter(
        (p) => p.jobCategory.toLowerCase().includes(kw) || (p.grade?.toLowerCase().includes(kw) ?? false)
      )
    }

    // Calculate summary
    const employees = filtered.filter((p) => p.resourceType === "EMPLOYEE")
    const contractors = filtered.filter((p) => p.resourceType === "CONTRACTOR")

    const summary = {
      employeeCount: employees.reduce((sum, p) => sum + parseFloat(p.totalHeadcount), 0).toFixed(2),
      employeeAmount: employees.reduce((sum, p) => sum + parseFloat(p.annualAmount), 0).toString(),
      contractorCount: contractors.reduce((sum, p) => sum + parseFloat(p.totalHeadcount), 0).toFixed(2),
      contractorAmount: contractors.reduce((sum, p) => sum + parseFloat(p.annualAmount), 0).toString(),
      totalAmount: filtered.reduce((sum, p) => sum + parseFloat(p.annualAmount), 0).toString(),
    }

    return {
      items: filtered,
      totalCount: filtered.length,
      page: request.page ?? 1,
      pageSize: request.pageSize ?? 50,
      summary,
    }
  }

  async getResourcePlanDetail(id: string): Promise<BffResourcePlanDetailResponse> {
    await delay(200)

    const plan = this.resourcePlans.find((p) => p.id === id)
    if (!plan) {
      throw new Error("Resource plan not found")
    }

    return {
      id: plan.id,
      resourceType: plan.resourceType,
      jobCategory: plan.jobCategory,
      grade: plan.grade,
      sourceDepartment: plan.sourceDepartment,
      rate: plan.rate
        ? {
            ...plan.rate,
            items: [
              { subjectId: "subj-1", subjectCode: "4100", subjectName: "給与手当", amount: "600000", percentage: "75.00" },
              { subjectId: "subj-2", subjectCode: "4110", subjectName: "賞与引当金繰入", amount: "100000", percentage: "12.50" },
              { subjectId: "subj-3", subjectCode: "4200", subjectName: "法定福利費", amount: "80000", percentage: "10.00" },
              { subjectId: "subj-4", subjectCode: "4210", subjectName: "福利厚生費", amount: "20000", percentage: "2.50" },
            ],
          }
        : null,
      customRate: plan.customRate,
      rateType: plan.rateType,
      months: plan.months,
      allocations: [
        {
          id: "alloc-rp-1",
          targetDepartment: MOCK_DEPARTMENTS[0],
          allocationType: "PERCENTAGE",
          percentage: "40.00",
          headcountAmount: null,
          annualAmount: "44160000",
        },
        {
          id: "alloc-rp-2",
          targetDepartment: MOCK_DEPARTMENTS[2],
          allocationType: "PERCENTAGE",
          percentage: "30.00",
          headcountAmount: null,
          annualAmount: "33120000",
        },
        {
          id: "alloc-rp-3",
          targetDepartment: MOCK_DEPARTMENTS[3],
          allocationType: "PERCENTAGE",
          percentage: "30.00",
          headcountAmount: null,
          annualAmount: "33120000",
        },
      ],
      notes: null,
      totalHeadcount: plan.totalHeadcount,
      annualAmount: plan.annualAmount,
    }
  }

  async createResourcePlan(request: BffCreateResourcePlanRequest): Promise<BffResourcePlanResponse> {
    await delay(300)

    const newId = `rp-${Date.now()}`
    const newPlan: BffResourcePlanSummary = {
      id: newId,
      resourceType: request.resourceType,
      jobCategory: request.jobCategory,
      grade: request.grade ?? null,
      sourceDepartment: MOCK_DEPARTMENTS.find((d) => d.stableId === request.sourceDepartmentStableId) ?? MOCK_DEPARTMENTS[0],
      rate: request.rateId
        ? MOCK_LABOR_COST_RATES.find((r) => r.id === request.rateId)
          ? { id: request.rateId, code: "NEW", totalRate: "0", rateType: request.rateType }
          : null
        : null,
      customRate: request.customRate ?? null,
      rateType: request.rateType,
      totalHeadcount: "0.00",
      annualAmount: "0",
      allocationStatus: "NOT_SET",
      months: Array.from({ length: 12 }, (_, i) => ({
        periodMonth: i + 1,
        headcount: "0.00",
      })),
    }

    this.resourcePlans.push(newPlan)

    return {
      id: newId,
      resourceType: request.resourceType,
      jobCategory: request.jobCategory,
      grade: request.grade ?? null,
      rateType: request.rateType,
    }
  }

  async updateResourcePlan(id: string, request: BffUpdateResourcePlanRequest): Promise<BffResourcePlanResponse> {
    await delay(200)

    const plan = this.resourcePlans.find((p) => p.id === id)
    if (!plan) {
      throw new Error("Resource plan not found")
    }

    if (request.resourceType) plan.resourceType = request.resourceType
    if (request.jobCategory) plan.jobCategory = request.jobCategory
    if (request.grade !== undefined) plan.grade = request.grade ?? null
    if (request.rateType) plan.rateType = request.rateType

    return {
      id: plan.id,
      resourceType: plan.resourceType,
      jobCategory: plan.jobCategory,
      grade: plan.grade,
      rateType: plan.rateType,
    }
  }

  async deleteResourcePlan(id: string): Promise<void> {
    await delay(200)
    this.resourcePlans = this.resourcePlans.filter((p) => p.id !== id)
  }

  async updateResourcePlanMonths(
    id: string,
    request: BffUpdateResourcePlanMonthsRequest
  ): Promise<BffResourcePlanMonthsResponse> {
    await delay(200)

    const plan = this.resourcePlans.find((p) => p.id === id)
    if (!plan) {
      throw new Error("Resource plan not found")
    }

    plan.months = request.months.map((m) => ({
      periodMonth: m.periodMonth,
      headcount: m.headcount,
    }))

    const totalHeadcount = plan.months.reduce((sum, m) => sum + parseFloat(m.headcount), 0)
    const rate = parseFloat(plan.rate?.totalRate ?? plan.customRate ?? "0")
    const annualAmount = totalHeadcount * rate

    plan.totalHeadcount = (totalHeadcount / 12).toFixed(2)
    plan.annualAmount = annualAmount.toString()

    return {
      months: plan.months,
      totalHeadcount: plan.totalHeadcount,
      annualAmount: plan.annualAmount,
    }
  }

  async updateResourceAllocations(
    id: string,
    request: BffUpdateResourceAllocationsRequest
  ): Promise<BffResourceAllocationsResponse> {
    await delay(200)

    const plan = this.resourcePlans.find((p) => p.id === id)
    if (!plan) {
      throw new Error("Resource plan not found")
    }

    const allocations = request.allocations.map((a, idx) => ({
      id: `alloc-${id}-${idx}`,
      targetDepartment:
        MOCK_DEPARTMENTS.find((d) => d.stableId === a.targetDepartmentStableId) ?? MOCK_DEPARTMENTS[0],
      allocationType: request.allocationType,
      percentage: a.percentage ?? null,
      headcountAmount: a.headcountAmount ?? null,
      annualAmount: "0", // Would be calculated
    }))

    const totalPercentage = allocations.reduce((sum, a) => sum + parseFloat(a.percentage ?? "0"), 0)
    const totalHeadcount = allocations.reduce((sum, a) => sum + parseFloat(a.headcountAmount ?? "0"), 0)

    plan.allocationStatus = totalPercentage >= 100 ? "COMPLETE" : totalPercentage > 0 ? "PARTIAL" : "NOT_SET"

    return {
      allocations,
      totalPercentage: totalPercentage.toFixed(2),
      totalHeadcount: totalHeadcount.toFixed(2),
    }
  }

  async listIndividualAllocations(
    request: BffListIndividualAllocationsRequest
  ): Promise<BffListIndividualAllocationsResponse> {
    await delay(300)

    let filtered = [...this.individualAllocations]

    if (request.keyword) {
      const kw = request.keyword.toLowerCase()
      filtered = filtered.filter(
        (i) =>
          i.individualName.toLowerCase().includes(kw) ||
          i.jobCategory.toLowerCase().includes(kw) ||
          (i.grade?.toLowerCase().includes(kw) ?? false)
      )
    }

    const totalAmount = filtered.reduce((sum, i) => sum + parseFloat(i.annualAmount), 0)

    return {
      items: filtered,
      totalCount: filtered.length,
      page: request.page ?? 1,
      pageSize: request.pageSize ?? 50,
      summary: {
        individualCount: filtered.length,
        totalAmount: totalAmount.toString(),
      },
    }
  }

  async createIndividualAllocation(
    request: BffCreateIndividualAllocationRequest
  ): Promise<BffIndividualAllocationResponse> {
    await delay(300)

    const individualKey = `ind-${Date.now()}`
    const totalPercentage = request.allocations.reduce((sum, a) => sum + parseFloat(a.percentage), 0)

    const newIndividual: BffIndividualAllocationSummary = {
      individualKey,
      employeeStableId: request.employeeStableId ?? null,
      individualName: request.individualName,
      sourceDepartment:
        MOCK_DEPARTMENTS.find((d) => d.stableId === request.sourceDepartmentStableId) ?? MOCK_DEPARTMENTS[0],
      jobCategory: request.jobCategory,
      grade: request.grade ?? null,
      rate: request.rateId
        ? { id: request.rateId, code: "RATE", totalRate: "0", rateType: request.rateType }
        : null,
      customRate: request.customRate ?? null,
      rateType: request.rateType,
      totalPercentage: totalPercentage.toFixed(2),
      annualAmount: "0",
      allocations: request.allocations.map((a, idx) => ({
        id: `alloc-ind-${idx}`,
        targetDepartment:
          MOCK_DEPARTMENTS.find((d) => d.stableId === a.targetDepartmentStableId) ?? MOCK_DEPARTMENTS[0],
        percentage: a.percentage,
        annualAmount: "0",
      })),
    }

    this.individualAllocations.push(newIndividual)

    return {
      individualKey,
      individualName: request.individualName,
      totalPercentage: totalPercentage.toFixed(2),
      annualAmount: "0",
    }
  }

  async updateIndividualAllocation(
    individualKey: string,
    request: BffUpdateIndividualAllocationRequest
  ): Promise<BffIndividualAllocationResponse> {
    await delay(200)

    const individual = this.individualAllocations.find((i) => i.individualKey === individualKey)
    if (!individual) {
      throw new Error("Individual allocation not found")
    }

    if (request.individualName) individual.individualName = request.individualName
    if (request.jobCategory) individual.jobCategory = request.jobCategory
    if (request.grade !== undefined) individual.grade = request.grade ?? null
    if (request.allocations) {
      individual.allocations = request.allocations.map((a, idx) => ({
        id: `alloc-ind-${idx}`,
        targetDepartment:
          MOCK_DEPARTMENTS.find((d) => d.stableId === a.targetDepartmentStableId) ?? MOCK_DEPARTMENTS[0],
        percentage: a.percentage,
        annualAmount: "0",
      }))
      individual.totalPercentage = request.allocations
        .reduce((sum, a) => sum + parseFloat(a.percentage), 0)
        .toFixed(2)
    }

    return {
      individualKey,
      individualName: individual.individualName,
      totalPercentage: individual.totalPercentage,
      annualAmount: individual.annualAmount,
    }
  }

  async deleteIndividualAllocation(individualKey: string): Promise<void> {
    await delay(200)
    this.individualAllocations = this.individualAllocations.filter((i) => i.individualKey !== individualKey)
  }

  async getHeadcountSummary(_request: BffHeadcountSummaryRequest): Promise<BffHeadcountSummaryResponse> {
    await delay(200)

    return {
      targetDepartment: MOCK_DEPARTMENTS[0],
      items: [
        {
          category: "OWN_EMPLOYEE",
          sourceDepartment: null,
          jobCategory: "エンジニア",
          grade: "シニア",
          headcount: "10.00",
          annualAmount: "96000000",
          notes: null,
        },
        {
          category: "TRANSFER_IN",
          sourceDepartment: MOCK_DEPARTMENTS[4],
          jobCategory: "管理職",
          grade: "課長",
          headcount: "0.30",
          annualAmount: "3240000",
          notes: "山田課長（30%）",
        },
        {
          category: "CONTRACTOR",
          sourceDepartment: null,
          jobCategory: "デザイナー",
          grade: null,
          headcount: "2.00",
          annualAmount: "14400000",
          notes: null,
        },
      ],
      totals: {
        ownEmployeeHeadcount: "10.00",
        ownEmployeeAmount: "96000000",
        transferInHeadcount: "0.30",
        transferInAmount: "3240000",
        contractorHeadcount: "2.00",
        contractorAmount: "14400000",
        totalHeadcount: "12.30",
        totalAmount: "113640000",
      },
    }
  }

  async applyBudget(_request: BffApplyBudgetRequest): Promise<BffApplyBudgetResponse> {
    await delay(500)

    return {
      success: true,
      affectedCount: 156,
      deletedCount: 0,
      insertedCount: 156,
    }
  }

  async listLaborCostRates(request: BffListLaborCostRatesForPlanningRequest): Promise<BffListLaborCostRatesForPlanningResponse> {
    await delay(200)

    let filtered = [...MOCK_LABOR_COST_RATES]

    if (request.resourceType) {
      filtered = filtered.filter((r) => r.resourceType === request.resourceType)
    }
    if (request.jobCategory) {
      filtered = filtered.filter((r) => r.jobCategory === request.jobCategory)
    }
    if (request.isActive !== undefined) {
      filtered = filtered.filter((r) => r.isActive === request.isActive)
    }

    return {
      items: filtered,
      totalCount: filtered.length,
      page: request.page ?? 1,
      pageSize: request.pageSize ?? 50,
    }
  }

  async getLaborCostRateDetail(id: string): Promise<BffLaborCostRateForPlanningDetailResponse> {
    await delay(200)

    const rate = MOCK_LABOR_COST_RATES.find((r) => r.id === id)
    if (!rate) {
      throw new Error("Rate not found")
    }

    return {
      ...rate,
      items: [
        { subjectId: "subj-1", subjectCode: "4100", subjectName: "給与手当", amount: "600000", percentage: "75.00" },
        { subjectId: "subj-2", subjectCode: "4110", subjectName: "賞与引当金繰入", amount: "100000", percentage: "12.50" },
        { subjectId: "subj-3", subjectCode: "4200", subjectName: "法定福利費", amount: "80000", percentage: "10.00" },
        { subjectId: "subj-4", subjectCode: "4210", subjectName: "福利厚生費", amount: "20000", percentage: "2.50" },
      ],
    }
  }
}

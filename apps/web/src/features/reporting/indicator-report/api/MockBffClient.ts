// ============================================================
// MockBffClient - Mock implementation for development/preview
// ============================================================

import type { BffClient } from "./BffClient"
import type {
  BffSelectorOptionsRequest,
  BffSelectorOptionsResponse,
  BffIndicatorReportDataRequest,
  BffIndicatorReportDataResponse,
  BffIndicatorReportLayoutResponse,
} from "@epm/contracts/bff/indicator-report"

// Mock Layout
const mockLayout: BffIndicatorReportLayoutResponse = {
  layoutId: "layout-001",
  layoutCode: "STANDARD_PL",
  layoutName: "標準損益計算書レポート",
  headerText: "本レポートは経営会議向けの標準損益計算書フォーマットです",
  lines: [
    { lineId: "line-001", lineNo: 1, lineType: "header", displayName: "売上高", itemRefType: null, indentLevel: 0, isBold: true },
    { lineId: "line-002", lineNo: 2, lineType: "item", displayName: "国内売上", itemRefType: "FINANCIAL", indentLevel: 1, isBold: false },
    { lineId: "line-003", lineNo: 3, lineType: "item", displayName: "海外売上", itemRefType: "FINANCIAL", indentLevel: 1, isBold: false },
    { lineId: "line-004", lineNo: 4, lineType: "divider", displayName: "売上高計", itemRefType: null, indentLevel: 0, isBold: true },
    { lineId: "line-005", lineNo: 5, lineType: "blank", displayName: null, itemRefType: null, indentLevel: 0, isBold: false },
    { lineId: "line-006", lineNo: 6, lineType: "header", displayName: "営業費用", itemRefType: null, indentLevel: 0, isBold: true },
    { lineId: "line-007", lineNo: 7, lineType: "item", displayName: "売上原価", itemRefType: "FINANCIAL", indentLevel: 1, isBold: false },
    { lineId: "line-008", lineNo: 8, lineType: "item", displayName: "販管費", itemRefType: "FINANCIAL", indentLevel: 1, isBold: false },
    { lineId: "line-009", lineNo: 9, lineType: "divider", displayName: null, itemRefType: null, indentLevel: 0, isBold: false },
    { lineId: "line-010", lineNo: 10, lineType: "item", displayName: "営業利益", itemRefType: "METRIC", indentLevel: 0, isBold: true },
    { lineId: "line-011", lineNo: 11, lineType: "item", displayName: "営業利益率", itemRefType: "METRIC", indentLevel: 0, isBold: false },
    { lineId: "line-012", lineNo: 12, lineType: "note", displayName: "※ 営業利益率 = 営業利益 / 売上高 × 100", itemRefType: null, indentLevel: 0, isBold: false },
    { lineId: "line-013", lineNo: 13, lineType: "blank", displayName: null, itemRefType: null, indentLevel: 0, isBold: false },
    { lineId: "line-014", lineNo: 14, lineType: "header", displayName: "非財務KPI", itemRefType: null, indentLevel: 0, isBold: true },
    { lineId: "line-015", lineNo: 15, lineType: "item", displayName: "従業員数", itemRefType: "NON_FINANCIAL", indentLevel: 1, isBold: false },
    { lineId: "line-016", lineNo: 16, lineType: "item", displayName: "顧客満足度", itemRefType: "NON_FINANCIAL", indentLevel: 1, isBold: false },
  ],
}

// Mock Selector Options
const mockSelectorOptions: BffSelectorOptionsResponse = {
  fiscalYears: [2026, 2025, 2024],
  planEvents: [
    { id: "event-001", eventCode: "BUD2026", eventName: "2026年度予算", scenarioType: "BUDGET", fiscalYear: 2026 },
    { id: "event-002", eventCode: "FC2026-Q1", eventName: "2026年度Q1見込", scenarioType: "FORECAST", fiscalYear: 2026 },
    { id: "event-003", eventCode: "FC2026-Q2", eventName: "2026年度Q2見込", scenarioType: "FORECAST", fiscalYear: 2026 },
    { id: "event-004", eventCode: "BUD2025", eventName: "2025年度予算", scenarioType: "BUDGET", fiscalYear: 2025 },
    { id: "event-005", eventCode: "FC2025-Q4", eventName: "2025年度Q4見込", scenarioType: "FORECAST", fiscalYear: 2025 },
  ],
  planVersions: [
    { id: "ver-001", versionCode: "V1", versionName: "初版", status: "FIXED" },
    { id: "ver-002", versionCode: "V2", versionName: "修正版", status: "DRAFT" },
    { id: "ver-003", versionCode: "V3", versionName: "最終版", status: "FIXED" },
  ],
  departments: [
    {
      stableId: "dept-root",
      departmentCode: "0000",
      departmentName: "全社",
      level: 0,
      hasChildren: true,
      children: [
        {
          stableId: "dept-div-a",
          departmentCode: "1000",
          departmentName: "事業部A",
          level: 1,
          hasChildren: true,
          children: [
            { stableId: "dept-sales", departmentCode: "1100", departmentName: "営業部", level: 2, hasChildren: false },
            { stableId: "dept-dev", departmentCode: "1200", departmentName: "開発部", level: 2, hasChildren: false },
          ],
        },
        {
          stableId: "dept-div-b",
          departmentCode: "2000",
          departmentName: "事業部B",
          level: 1,
          hasChildren: true,
          children: [
            { stableId: "dept-mfg", departmentCode: "2100", departmentName: "製造部", level: 2, hasChildren: false },
          ],
        },
      ],
    },
  ],
}

// Mock Report Data
const mockReportData: BffIndicatorReportDataResponse = {
  fiscalYear: 2026,
  periodRange: { start: "FY2026-P01", end: "FY2026-P12", granularity: "YEARLY" },
  departmentName: "全社",
  includeChildren: true,
  rows: [
    { lineId: "line-001", lineNo: 1, lineType: "header", displayName: "売上高", indentLevel: 0, isBold: true, itemRefType: null, primaryValue: null, compareValue: null, differenceValue: null, differenceRate: null, unit: null },
    { lineId: "line-002", lineNo: 2, lineType: "item", displayName: "国内売上", indentLevel: 1, isBold: false, itemRefType: "FINANCIAL", primaryValue: 600000000, compareValue: 500000000, differenceValue: 100000000, differenceRate: 20.0, unit: "円" },
    { lineId: "line-003", lineNo: 3, lineType: "item", displayName: "海外売上", indentLevel: 1, isBold: false, itemRefType: "FINANCIAL", primaryValue: 400000000, compareValue: 400000000, differenceValue: 0, differenceRate: 0, unit: "円" },
    { lineId: "line-004", lineNo: 4, lineType: "divider", displayName: "売上高計", indentLevel: 0, isBold: true, itemRefType: null, primaryValue: 1000000000, compareValue: 900000000, differenceValue: 100000000, differenceRate: 11.1, unit: "円" },
    { lineId: "line-005", lineNo: 5, lineType: "blank", displayName: null, indentLevel: 0, isBold: false, itemRefType: null, primaryValue: null, compareValue: null, differenceValue: null, differenceRate: null, unit: null },
    { lineId: "line-006", lineNo: 6, lineType: "header", displayName: "営業費用", indentLevel: 0, isBold: true, itemRefType: null, primaryValue: null, compareValue: null, differenceValue: null, differenceRate: null, unit: null },
    { lineId: "line-007", lineNo: 7, lineType: "item", displayName: "売上原価", indentLevel: 1, isBold: false, itemRefType: "FINANCIAL", primaryValue: 650000000, compareValue: 600000000, differenceValue: 50000000, differenceRate: 8.3, unit: "円" },
    { lineId: "line-008", lineNo: 8, lineType: "item", displayName: "販管費", indentLevel: 1, isBold: false, itemRefType: "FINANCIAL", primaryValue: 150000000, compareValue: 120000000, differenceValue: 30000000, differenceRate: 25.0, unit: "円" },
    { lineId: "line-009", lineNo: 9, lineType: "divider", displayName: null, indentLevel: 0, isBold: false, itemRefType: null, primaryValue: null, compareValue: null, differenceValue: null, differenceRate: null, unit: null },
    { lineId: "line-010", lineNo: 10, lineType: "item", displayName: "営業利益", indentLevel: 0, isBold: true, itemRefType: "METRIC", primaryValue: 200000000, compareValue: 180000000, differenceValue: 20000000, differenceRate: 11.1, unit: "円" },
    { lineId: "line-011", lineNo: 11, lineType: "item", displayName: "営業利益率", indentLevel: 0, isBold: false, itemRefType: "METRIC", primaryValue: 20.0, compareValue: 18.0, differenceValue: 2.0, differenceRate: null, unit: "%" },
    { lineId: "line-012", lineNo: 12, lineType: "note", displayName: "※ 営業利益率 = 営業利益 / 売上高 × 100", indentLevel: 0, isBold: false, itemRefType: null, primaryValue: null, compareValue: null, differenceValue: null, differenceRate: null, unit: null },
    { lineId: "line-013", lineNo: 13, lineType: "blank", displayName: null, indentLevel: 0, isBold: false, itemRefType: null, primaryValue: null, compareValue: null, differenceValue: null, differenceRate: null, unit: null },
    { lineId: "line-014", lineNo: 14, lineType: "header", displayName: "非財務KPI", indentLevel: 0, isBold: true, itemRefType: null, primaryValue: null, compareValue: null, differenceValue: null, differenceRate: null, unit: null },
    { lineId: "line-015", lineNo: 15, lineType: "item", displayName: "従業員数", indentLevel: 1, isBold: false, itemRefType: "NON_FINANCIAL", primaryValue: 1250, compareValue: 1200, differenceValue: 50, differenceRate: 4.2, unit: "人" },
    { lineId: "line-016", lineNo: 16, lineType: "item", displayName: "顧客満足度", indentLevel: 1, isBold: false, itemRefType: "NON_FINANCIAL", primaryValue: 4.5, compareValue: 4.3, differenceValue: 0.2, differenceRate: 4.7, unit: "pt" },
  ],
}

export class MockBffClient implements BffClient {
  private delay = 300
  private layoutConfigured = true

  constructor(options?: { layoutConfigured?: boolean; delay?: number }) {
    if (options?.layoutConfigured !== undefined) {
      this.layoutConfigured = options.layoutConfigured
    }
    if (options?.delay !== undefined) {
      this.delay = options.delay
    }
  }

  private async simulateDelay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.delay))
  }

  async getLayout(): Promise<BffIndicatorReportLayoutResponse | null> {
    await this.simulateDelay()
    if (!this.layoutConfigured) {
      return null
    }
    return mockLayout
  }

  async getSelectorOptions(
    request: BffSelectorOptionsRequest
  ): Promise<BffSelectorOptionsResponse> {
    await this.simulateDelay()

    let filteredEvents = mockSelectorOptions.planEvents
    let filteredVersions = mockSelectorOptions.planVersions

    // Filter by fiscal year if provided
    if (request.fiscalYear) {
      filteredEvents = filteredEvents.filter(
        (e) => e.fiscalYear === request.fiscalYear
      )
    }

    // Filter by scenario type if provided
    if (request.scenarioType) {
      filteredEvents = filteredEvents.filter(
        (e) => e.scenarioType === request.scenarioType
      )
    }

    // For FORECAST, only return FIXED versions
    if (request.scenarioType === "FORECAST") {
      filteredVersions = filteredVersions.filter((v) => v.status === "FIXED")
    }

    return {
      ...mockSelectorOptions,
      planEvents: filteredEvents,
      planVersions: filteredVersions,
    }
  }

  async getReportData(
    _request: BffIndicatorReportDataRequest
  ): Promise<BffIndicatorReportDataResponse> {
    await this.simulateDelay()
    return mockReportData
  }
}

// Default mock client instance
export const mockBffClient = new MockBffClient()

// Aliased export for factory pattern
export const bffClient = mockBffClient

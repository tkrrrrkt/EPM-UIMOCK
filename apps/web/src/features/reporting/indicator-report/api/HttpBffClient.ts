// ============================================================
// HttpBffClient - HTTP implementation for production
// ============================================================

import type { BffClient } from "./BffClient"
import type {
  BffSelectorOptionsRequest,
  BffSelectorOptionsResponse,
  BffIndicatorReportDataRequest,
  BffIndicatorReportDataResponse,
  BffIndicatorReportLayoutResponse,
} from "@epm/contracts/bff/indicator-report"

const BASE_URL = "/api/bff/reporting/indicator-report"

async function fetchWithError<T>(
  url: string,
  params?: Record<string, string | number | boolean | undefined>
): Promise<T> {
  const urlObj = new URL(url, window.location.origin)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        urlObj.searchParams.set(key, String(value))
      }
    })
  }

  const response = await fetch(urlObj.toString(), {
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ code: "UNKNOWN_ERROR" }))
    throw new Error(error.code || `HTTP ${response.status}`)
  }

  return response.json()
}

export const httpBffClient: BffClient = {
  async getLayout(): Promise<BffIndicatorReportLayoutResponse | null> {
    try {
      return await fetchWithError<BffIndicatorReportLayoutResponse>(
        `${BASE_URL}/layout`
      )
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("LAYOUT_NOT_CONFIGURED")
      ) {
        return null
      }
      throw error
    }
  },

  async getSelectorOptions(
    request: BffSelectorOptionsRequest
  ): Promise<BffSelectorOptionsResponse> {
    return fetchWithError<BffSelectorOptionsResponse>(
      `${BASE_URL}/selector-options`,
      {
        fiscalYear: request.fiscalYear,
        scenarioType: request.scenarioType,
        planEventId: request.planEventId,
      }
    )
  },

  async getReportData(
    request: BffIndicatorReportDataRequest
  ): Promise<BffIndicatorReportDataResponse> {
    return fetchWithError<BffIndicatorReportDataResponse>(`${BASE_URL}/data`, {
      fiscalYear: request.fiscalYear,
      primaryScenarioType: request.primaryScenarioType,
      primaryPlanEventId: request.primaryPlanEventId,
      primaryPlanVersionId: request.primaryPlanVersionId,
      compareScenarioType: request.compareScenarioType,
      comparePlanEventId: request.comparePlanEventId,
      comparePlanVersionId: request.comparePlanVersionId,
      startPeriodCode: request.startPeriodCode,
      endPeriodCode: request.endPeriodCode,
      displayGranularity: request.displayGranularity,
      departmentStableId: request.departmentStableId,
      includeChildren: request.includeChildren,
    })
  },
}

import type {
  BffClient,
  BffDashboardData,
  BffKpiDetail,
  BffDashboardQuery,
} from "@epm/contracts/bff/action-plan-dashboard"

export class HttpBffClient implements BffClient {
  private baseUrl: string

  constructor(baseUrl = "/api/bff/action-plan") {
    this.baseUrl = baseUrl
  }

  async getDashboardData(query: BffDashboardQuery): Promise<BffDashboardData> {
    const params = new URLSearchParams()
    if (query.organizationId) params.set("organizationId", query.organizationId)
    if (query.periodFrom) params.set("periodFrom", query.periodFrom)
    if (query.periodTo) params.set("periodTo", query.periodTo)
    if (query.progressStatus) params.set("progressStatus", query.progressStatus)

    const url = `${this.baseUrl}/dashboard?${params.toString()}`
    const response = await fetch(url)

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.code || "NETWORK_ERROR")
    }

    return response.json()
  }

  async getKpiDetail(subjectId: string): Promise<BffKpiDetail> {
    const url = `${this.baseUrl}/dashboard/kpi/${subjectId}`
    const response = await fetch(url)

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.code || "NETWORK_ERROR")
    }

    return response.json()
  }
}

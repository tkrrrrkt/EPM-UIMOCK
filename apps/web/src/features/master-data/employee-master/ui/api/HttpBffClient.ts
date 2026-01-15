// HTTP BFF Client (for future use when connecting to real BFF)
import type { BffClient } from "./BffClient"
import type {
  BffListEmployeesRequest,
  BffListEmployeesResponse,
  BffCreateEmployeeRequest,
  BffUpdateEmployeeRequest,
  BffEmployeeDetailResponse,
  BffListEmployeeAssignmentsResponse,
  BffCreateEmployeeAssignmentRequest,
  BffUpdateEmployeeAssignmentRequest,
  BffEmployeeAssignmentResponse,
} from "@epm/contracts/bff/employee-master"

export class HttpBffClient implements BffClient {
  private baseUrl: string

  constructor(baseUrl = "/api/bff") {
    this.baseUrl = baseUrl
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.code || "UNKNOWN_ERROR")
    }

    return response.json()
  }

  async listEmployees(request: BffListEmployeesRequest): Promise<BffListEmployeesResponse> {
    const params = new URLSearchParams()
    if (request.page) params.append("page", request.page.toString())
    if (request.pageSize) params.append("pageSize", request.pageSize.toString())
    if (request.sortBy) params.append("sortBy", request.sortBy)
    if (request.sortOrder) params.append("sortOrder", request.sortOrder)
    if (request.keyword) params.append("keyword", request.keyword)
    if (request.isActive !== undefined) params.append("isActive", request.isActive.toString())

    return this.request<BffListEmployeesResponse>("GET", `/master-data/employee-master?${params.toString()}`)
  }

  async getEmployeeDetail(id: string): Promise<BffEmployeeDetailResponse> {
    return this.request<BffEmployeeDetailResponse>("GET", `/master-data/employee-master/${id}`)
  }

  async createEmployee(request: BffCreateEmployeeRequest): Promise<BffEmployeeDetailResponse> {
    return this.request<BffEmployeeDetailResponse>("POST", "/master-data/employee-master", request)
  }

  async updateEmployee(id: string, request: BffUpdateEmployeeRequest): Promise<BffEmployeeDetailResponse> {
    return this.request<BffEmployeeDetailResponse>("PATCH", `/master-data/employee-master/${id}`, request)
  }

  async deactivateEmployee(id: string): Promise<BffEmployeeDetailResponse> {
    return this.request<BffEmployeeDetailResponse>("POST", `/master-data/employee-master/${id}/deactivate`)
  }

  async reactivateEmployee(id: string): Promise<BffEmployeeDetailResponse> {
    return this.request<BffEmployeeDetailResponse>("POST", `/master-data/employee-master/${id}/reactivate`)
  }

  async listEmployeeAssignments(employeeId: string): Promise<BffListEmployeeAssignmentsResponse> {
    return this.request<BffListEmployeeAssignmentsResponse>(
      "GET",
      `/master-data/employee-master/${employeeId}/assignments`,
    )
  }

  async createEmployeeAssignment(
    employeeId: string,
    request: BffCreateEmployeeAssignmentRequest,
  ): Promise<BffEmployeeAssignmentResponse> {
    return this.request<BffEmployeeAssignmentResponse>(
      "POST",
      `/master-data/employee-master/${employeeId}/assignments`,
      request,
    )
  }

  async updateEmployeeAssignment(
    employeeId: string,
    assignmentId: string,
    request: BffUpdateEmployeeAssignmentRequest,
  ): Promise<BffEmployeeAssignmentResponse> {
    return this.request<BffEmployeeAssignmentResponse>(
      "PATCH",
      `/master-data/employee-master/${employeeId}/assignments/${assignmentId}`,
      request,
    )
  }

  async deleteEmployeeAssignment(employeeId: string, assignmentId: string): Promise<void> {
    await this.request<void>("DELETE", `/master-data/employee-master/${employeeId}/assignments/${assignmentId}`)
  }
}

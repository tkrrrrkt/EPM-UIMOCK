// BFF Client Interface
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

export interface BffClient {
  // Employee Master endpoints
  listEmployees(request: BffListEmployeesRequest): Promise<BffListEmployeesResponse>
  getEmployeeDetail(id: string): Promise<BffEmployeeDetailResponse>
  createEmployee(request: BffCreateEmployeeRequest): Promise<BffEmployeeDetailResponse>
  updateEmployee(id: string, request: BffUpdateEmployeeRequest): Promise<BffEmployeeDetailResponse>
  deactivateEmployee(id: string): Promise<BffEmployeeDetailResponse>
  reactivateEmployee(id: string): Promise<BffEmployeeDetailResponse>

  // Employee Assignment endpoints
  listEmployeeAssignments(employeeId: string): Promise<BffListEmployeeAssignmentsResponse>
  createEmployeeAssignment(
    employeeId: string,
    request: BffCreateEmployeeAssignmentRequest,
  ): Promise<BffEmployeeAssignmentResponse>
  updateEmployeeAssignment(
    employeeId: string,
    assignmentId: string,
    request: BffUpdateEmployeeAssignmentRequest,
  ): Promise<BffEmployeeAssignmentResponse>
  deleteEmployeeAssignment(employeeId: string, assignmentId: string): Promise<void>
}

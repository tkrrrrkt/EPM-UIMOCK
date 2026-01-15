// Mock BFF Client with realistic sample data
import type { BffClient } from "./BffClient"
import type {
  BffListEmployeesRequest,
  BffListEmployeesResponse,
  BffEmployeeSummary,
  BffCreateEmployeeRequest,
  BffUpdateEmployeeRequest,
  BffEmployeeDetailResponse,
  BffListEmployeeAssignmentsResponse,
  BffEmployeeAssignmentSummary,
  BffCreateEmployeeAssignmentRequest,
  BffUpdateEmployeeAssignmentRequest,
  BffEmployeeAssignmentResponse,
} from "@epm/contracts/bff/employee-master"

// Mock data storage
const mockEmployees: BffEmployeeDetailResponse[] = [
  {
    id: "emp-001",
    employeeCode: "A00123",
    employeeName: "山田 太郎",
    employeeNameKana: "ヤマダ タロウ",
    email: "yamada@example.com",
    hireDate: "2020-04-01",
    leaveDate: null,
    isActive: true,
    createdAt: "2020-04-01T00:00:00Z",
    updatedAt: "2020-04-01T00:00:00Z",
  },
  {
    id: "emp-002",
    employeeCode: "B00456",
    employeeName: "佐藤 花子",
    employeeNameKana: "サトウ ハナコ",
    email: "sato@example.com",
    hireDate: "2021-07-01",
    leaveDate: null,
    isActive: true,
    createdAt: "2021-07-01T00:00:00Z",
    updatedAt: "2021-07-01T00:00:00Z",
  },
  {
    id: "emp-003",
    employeeCode: "C00789",
    employeeName: "鈴木 一郎",
    employeeNameKana: "スズキ イチロウ",
    email: "suzuki@example.com",
    hireDate: "2019-10-01",
    leaveDate: "2024-03-31",
    isActive: false,
    createdAt: "2019-10-01T00:00:00Z",
    updatedAt: "2024-03-31T00:00:00Z",
  },
  {
    id: "emp-004",
    employeeCode: "D00112",
    employeeName: "田中 美咲",
    employeeNameKana: "タナカ ミサキ",
    email: "tanaka@example.com",
    hireDate: "2022-04-01",
    leaveDate: null,
    isActive: true,
    createdAt: "2022-04-01T00:00:00Z",
    updatedAt: "2022-04-01T00:00:00Z",
  },
  {
    id: "emp-005",
    employeeCode: "E00223",
    employeeName: "伊藤 健太",
    employeeNameKana: "イトウ ケンタ",
    email: "ito@example.com",
    hireDate: "2023-01-15",
    leaveDate: null,
    isActive: true,
    createdAt: "2023-01-15T00:00:00Z",
    updatedAt: "2023-01-15T00:00:00Z",
  },
]

const mockAssignments: Record<string, BffEmployeeAssignmentResponse[]> = {
  "emp-001": [
    {
      id: "assign-001",
      employeeId: "emp-001",
      departmentStableId: "dept-sales-001",
      departmentName: "営業部",
      assignmentType: "primary",
      allocationRatio: 100.0,
      title: "課長",
      effectiveDate: "2020-04-01",
      expiryDate: null,
      isActive: true,
      createdAt: "2020-04-01T00:00:00Z",
      updatedAt: "2020-04-01T00:00:00Z",
    },
  ],
  "emp-002": [
    {
      id: "assign-002",
      employeeId: "emp-002",
      departmentStableId: "dept-dev-001",
      departmentName: "開発部",
      assignmentType: "primary",
      allocationRatio: 100.0,
      title: "主任",
      effectiveDate: "2021-07-01",
      expiryDate: null,
      isActive: true,
      createdAt: "2021-07-01T00:00:00Z",
      updatedAt: "2021-07-01T00:00:00Z",
    },
    {
      id: "assign-003",
      employeeId: "emp-002",
      departmentStableId: "dept-hr-001",
      departmentName: "人事部",
      assignmentType: "secondary",
      allocationRatio: 20.0,
      title: null,
      effectiveDate: "2023-04-01",
      expiryDate: null,
      isActive: true,
      createdAt: "2023-04-01T00:00:00Z",
      updatedAt: "2023-04-01T00:00:00Z",
    },
  ],
  "emp-003": [
    {
      id: "assign-004",
      employeeId: "emp-003",
      departmentStableId: "dept-accounting-001",
      departmentName: "経理部",
      assignmentType: "primary",
      allocationRatio: 100.0,
      title: "係長",
      effectiveDate: "2019-10-01",
      expiryDate: "2024-03-31",
      isActive: false,
      createdAt: "2019-10-01T00:00:00Z",
      updatedAt: "2024-03-31T00:00:00Z",
    },
  ],
  "emp-004": [
    {
      id: "assign-005",
      employeeId: "emp-004",
      departmentStableId: "dept-sales-001",
      departmentName: "営業部",
      assignmentType: "primary",
      allocationRatio: 100.0,
      title: null,
      effectiveDate: "2022-04-01",
      expiryDate: null,
      isActive: true,
      createdAt: "2022-04-01T00:00:00Z",
      updatedAt: "2022-04-01T00:00:00Z",
    },
  ],
  "emp-005": [
    {
      id: "assign-006",
      employeeId: "emp-005",
      departmentStableId: "dept-dev-001",
      departmentName: "開発部",
      assignmentType: "primary",
      allocationRatio: 100.0,
      title: null,
      effectiveDate: "2023-01-15",
      expiryDate: null,
      isActive: true,
      createdAt: "2023-01-15T00:00:00Z",
      updatedAt: "2023-01-15T00:00:00Z",
    },
  ],
}

// Mock departments for selection
export const mockDepartments = [
  { stableId: "dept-sales-001", name: "営業部" },
  { stableId: "dept-dev-001", name: "開発部" },
  { stableId: "dept-accounting-001", name: "経理部" },
  { stableId: "dept-hr-001", name: "人事部" },
  { stableId: "dept-general-affairs-001", name: "総務部" },
]

export class MockBffClient implements BffClient {
  private delay(ms = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async listEmployees(request: BffListEmployeesRequest): Promise<BffListEmployeesResponse> {
    await this.delay()

    const { page = 1, pageSize = 10, sortBy = "employeeCode", sortOrder = "asc", keyword = "", isActive } = request

    // Filter
    const filtered = mockEmployees.filter((emp) => {
      const matchesKeyword =
        !keyword ||
        emp.employeeCode.toLowerCase().includes(keyword.toLowerCase()) ||
        emp.employeeName.toLowerCase().includes(keyword.toLowerCase())
      const matchesActive = isActive === undefined || emp.isActive === isActive
      return matchesKeyword && matchesActive
    })

    // Sort
    filtered.sort((a, b) => {
      let aVal: string | null = ""
      let bVal: string | null = ""

      switch (sortBy) {
        case "employeeCode":
          aVal = a.employeeCode
          bVal = b.employeeCode
          break
        case "employeeName":
          aVal = a.employeeName
          bVal = b.employeeName
          break
        case "hireDate":
          aVal = a.hireDate
          bVal = b.hireDate
          break
      }

      if (!aVal) return sortOrder === "asc" ? 1 : -1
      if (!bVal) return sortOrder === "asc" ? -1 : 1

      const comparison = aVal.localeCompare(bVal)
      return sortOrder === "asc" ? comparison : -comparison
    })

    // Paginate
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const items: BffEmployeeSummary[] = filtered.slice(start, end).map((emp) => ({
      id: emp.id,
      employeeCode: emp.employeeCode,
      employeeName: emp.employeeName,
      email: emp.email,
      hireDate: emp.hireDate,
      isActive: emp.isActive,
    }))

    return {
      items,
      totalCount: filtered.length,
      page,
      pageSize,
    }
  }

  async getEmployeeDetail(id: string): Promise<BffEmployeeDetailResponse> {
    await this.delay()

    const employee = mockEmployees.find((emp) => emp.id === id)
    if (!employee) {
      throw new Error("EMPLOYEE_NOT_FOUND")
    }

    return employee
  }

  async createEmployee(request: BffCreateEmployeeRequest): Promise<BffEmployeeDetailResponse> {
    await this.delay()

    // Check duplicate employee code
    const duplicate = mockEmployees.find((emp) => emp.employeeCode === request.employeeCode)
    if (duplicate) {
      throw new Error("EMPLOYEE_CODE_DUPLICATE")
    }

    const newEmployee: BffEmployeeDetailResponse = {
      id: `emp-${Date.now()}`,
      employeeCode: request.employeeCode,
      employeeName: request.employeeName,
      employeeNameKana: request.employeeNameKana || null,
      email: request.email || null,
      hireDate: request.hireDate || null,
      leaveDate: request.leaveDate || null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockEmployees.push(newEmployee)
    return newEmployee
  }

  async updateEmployee(id: string, request: BffUpdateEmployeeRequest): Promise<BffEmployeeDetailResponse> {
    await this.delay()

    const employee = mockEmployees.find((emp) => emp.id === id)
    if (!employee) {
      throw new Error("EMPLOYEE_NOT_FOUND")
    }

    // Check duplicate employee code (if changed)
    if (request.employeeCode && request.employeeCode !== employee.employeeCode) {
      const duplicate = mockEmployees.find((emp) => emp.employeeCode === request.employeeCode)
      if (duplicate) {
        throw new Error("EMPLOYEE_CODE_DUPLICATE")
      }
    }

    Object.assign(employee, {
      ...request,
      updatedAt: new Date().toISOString(),
    })

    return employee
  }

  async deactivateEmployee(id: string): Promise<BffEmployeeDetailResponse> {
    await this.delay()

    const employee = mockEmployees.find((emp) => emp.id === id)
    if (!employee) {
      throw new Error("EMPLOYEE_NOT_FOUND")
    }

    if (!employee.isActive) {
      throw new Error("EMPLOYEE_ALREADY_INACTIVE")
    }

    employee.isActive = false
    employee.updatedAt = new Date().toISOString()

    return employee
  }

  async reactivateEmployee(id: string): Promise<BffEmployeeDetailResponse> {
    await this.delay()

    const employee = mockEmployees.find((emp) => emp.id === id)
    if (!employee) {
      throw new Error("EMPLOYEE_NOT_FOUND")
    }

    if (employee.isActive) {
      throw new Error("EMPLOYEE_ALREADY_ACTIVE")
    }

    employee.isActive = true
    employee.updatedAt = new Date().toISOString()

    return employee
  }

  async listEmployeeAssignments(employeeId: string): Promise<BffListEmployeeAssignmentsResponse> {
    await this.delay()

    const assignments = mockAssignments[employeeId] || []
    const items: BffEmployeeAssignmentSummary[] = assignments.map((assign) => ({
      id: assign.id,
      departmentStableId: assign.departmentStableId,
      departmentName: assign.departmentName,
      assignmentType: assign.assignmentType,
      allocationRatio: assign.allocationRatio,
      title: assign.title,
      effectiveDate: assign.effectiveDate,
      expiryDate: assign.expiryDate,
      isActive: assign.isActive,
    }))

    return { items }
  }

  async createEmployeeAssignment(
    employeeId: string,
    request: BffCreateEmployeeAssignmentRequest,
  ): Promise<BffEmployeeAssignmentResponse> {
    await this.delay()

    const employee = mockEmployees.find((emp) => emp.id === employeeId)
    if (!employee) {
      throw new Error("EMPLOYEE_NOT_FOUND")
    }

    const department = mockDepartments.find((dept) => dept.stableId === request.departmentStableId)
    if (!department) {
      throw new Error("DEPARTMENT_NOT_FOUND")
    }

    // Check primary assignment overlap
    if (request.assignmentType === "primary") {
      const existingAssignments = mockAssignments[employeeId] || []
      const primaryAssignments = existingAssignments.filter(
        (assign) => assign.assignmentType === "primary" && assign.isActive,
      )

      for (const existing of primaryAssignments) {
        const existingStart = new Date(existing.effectiveDate)
        const existingEnd = existing.expiryDate ? new Date(existing.expiryDate) : null
        const newStart = new Date(request.effectiveDate)
        const newEnd = request.expiryDate ? new Date(request.expiryDate) : null

        // Check overlap
        const overlaps = (!existingEnd || newStart <= existingEnd) && (!newEnd || existingStart <= newEnd)

        if (overlaps) {
          throw new Error("ASSIGNMENT_OVERLAP")
        }
      }
    }

    const newAssignment: BffEmployeeAssignmentResponse = {
      id: `assign-${Date.now()}`,
      employeeId,
      departmentStableId: request.departmentStableId,
      departmentName: department.name,
      assignmentType: request.assignmentType,
      allocationRatio: request.allocationRatio || null,
      title: request.title || null,
      effectiveDate: request.effectiveDate,
      expiryDate: request.expiryDate || null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (!mockAssignments[employeeId]) {
      mockAssignments[employeeId] = []
    }
    mockAssignments[employeeId].push(newAssignment)

    return newAssignment
  }

  async updateEmployeeAssignment(
    employeeId: string,
    assignmentId: string,
    request: BffUpdateEmployeeAssignmentRequest,
  ): Promise<BffEmployeeAssignmentResponse> {
    await this.delay()

    const assignments = mockAssignments[employeeId]
    if (!assignments) {
      throw new Error("ASSIGNMENT_NOT_FOUND")
    }

    const assignment = assignments.find((assign) => assign.id === assignmentId)
    if (!assignment) {
      throw new Error("ASSIGNMENT_NOT_FOUND")
    }

    // Update department name if department changed
    if (request.departmentStableId) {
      const department = mockDepartments.find((dept) => dept.stableId === request.departmentStableId)
      if (!department) {
        throw new Error("DEPARTMENT_NOT_FOUND")
      }
      assignment.departmentName = department.name
    }

    Object.assign(assignment, {
      ...request,
      updatedAt: new Date().toISOString(),
    })

    return assignment
  }

  async deleteEmployeeAssignment(employeeId: string, assignmentId: string): Promise<void> {
    await this.delay()

    const assignments = mockAssignments[employeeId]
    if (!assignments) {
      throw new Error("ASSIGNMENT_NOT_FOUND")
    }

    const index = assignments.findIndex((assign) => assign.id === assignmentId)
    if (index === -1) {
      throw new Error("ASSIGNMENT_NOT_FOUND")
    }

    assignments.splice(index, 1)
  }
}

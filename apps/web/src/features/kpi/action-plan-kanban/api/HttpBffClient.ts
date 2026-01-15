import type {
  BffClient,
  BffKanbanBoard,
  BffTaskDetail,
  BffCreateTaskRequest,
  BffUpdateTaskRequest,
  BffUpdateTaskStatusRequest,
  BffReorderTasksRequest,
  BffChecklistItem,
  BffCreateChecklistRequest,
  BffUpdateChecklistRequest,
  BffTaskComment,
  BffCreateCommentRequest,
  BffUpdateCommentRequest,
  BffAddLabelRequest,
  BffAddAssigneeRequest,
  BffListStatusesResponse,
  BffTaskStatus,
  BffCreateStatusRequest,
  BffUpdateStatusRequest,
  BffReorderStatusesRequest,
  BffListLabelsResponse,
  BffTaskLabel,
  BffCreateLabelRequest,
  BffUpdateLabelRequest,
} from "@epm/contracts/bff/action-plan-kanban"

export class HttpBffClient implements BffClient {
  private baseUrl: string

  constructor(baseUrl = "/api/bff/action-plan/kanban") {
    this.baseUrl = baseUrl
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.code || "NETWORK_ERROR")
    }
    return response.json()
  }

  async getKanbanBoard(planId: string): Promise<BffKanbanBoard> {
    const response = await fetch(`${this.baseUrl}/${planId}`)
    return this.handleResponse(response)
  }

  async getTaskDetail(id: string): Promise<BffTaskDetail> {
    const response = await fetch(`${this.baseUrl}/tasks/${id}`)
    return this.handleResponse(response)
  }

  async createTask(request: BffCreateTaskRequest): Promise<BffTaskDetail> {
    const response = await fetch(`${this.baseUrl}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    return this.handleResponse(response)
  }

  async updateTask(id: string, request: BffUpdateTaskRequest): Promise<BffTaskDetail> {
    const response = await fetch(`${this.baseUrl}/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    return this.handleResponse(response)
  }

  async updateTaskStatus(id: string, request: BffUpdateTaskStatusRequest): Promise<void> {
    const response = await fetch(`${this.baseUrl}/tasks/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.code || "NETWORK_ERROR")
    }
  }

  async reorderTasks(request: BffReorderTasksRequest): Promise<void> {
    const response = await fetch(`${this.baseUrl}/tasks/reorder`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.code || "NETWORK_ERROR")
    }
  }

  async deleteTask(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/tasks/${id}`, { method: "DELETE" })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.code || "NETWORK_ERROR")
    }
  }

  async addChecklistItem(taskId: string, request: BffCreateChecklistRequest): Promise<BffChecklistItem> {
    const response = await fetch(`${this.baseUrl}/tasks/${taskId}/checklist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    return this.handleResponse(response)
  }

  async updateChecklistItem(id: string, request: BffUpdateChecklistRequest): Promise<BffChecklistItem> {
    const response = await fetch(`${this.baseUrl}/checklist/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    return this.handleResponse(response)
  }

  async deleteChecklistItem(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/checklist/${id}`, { method: "DELETE" })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.code || "NETWORK_ERROR")
    }
  }

  async addComment(taskId: string, request: BffCreateCommentRequest): Promise<BffTaskComment> {
    const response = await fetch(`${this.baseUrl}/tasks/${taskId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    return this.handleResponse(response)
  }

  async updateComment(id: string, request: BffUpdateCommentRequest): Promise<BffTaskComment> {
    const response = await fetch(`${this.baseUrl}/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    return this.handleResponse(response)
  }

  async deleteComment(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/comments/${id}`, { method: "DELETE" })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.code || "NETWORK_ERROR")
    }
  }

  async addLabel(taskId: string, request: BffAddLabelRequest): Promise<void> {
    const response = await fetch(`${this.baseUrl}/tasks/${taskId}/labels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.code || "NETWORK_ERROR")
    }
  }

  async removeLabel(taskId: string, labelId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/tasks/${taskId}/labels/${labelId}`, { method: "DELETE" })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.code || "NETWORK_ERROR")
    }
  }

  async addAssignee(taskId: string, request: BffAddAssigneeRequest): Promise<void> {
    const response = await fetch(`${this.baseUrl}/tasks/${taskId}/assignees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.code || "NETWORK_ERROR")
    }
  }

  async removeAssignee(taskId: string, employeeId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/tasks/${taskId}/assignees/${employeeId}`, { method: "DELETE" })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.code || "NETWORK_ERROR")
    }
  }

  async getStatuses(planId: string): Promise<BffListStatusesResponse> {
    const response = await fetch(`${this.baseUrl}/${planId}/statuses`)
    return this.handleResponse(response)
  }

  async createStatus(planId: string, request: BffCreateStatusRequest): Promise<BffTaskStatus> {
    const response = await fetch(`${this.baseUrl}/${planId}/statuses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    return this.handleResponse(response)
  }

  async updateStatus(id: string, request: BffUpdateStatusRequest): Promise<BffTaskStatus> {
    const response = await fetch(`${this.baseUrl}/statuses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    return this.handleResponse(response)
  }

  async deleteStatus(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/statuses/${id}`, { method: "DELETE" })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.code || "NETWORK_ERROR")
    }
  }

  async reorderStatuses(planId: string, request: BffReorderStatusesRequest): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${planId}/statuses/reorder`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.code || "NETWORK_ERROR")
    }
  }

  async getLabels(planId: string): Promise<BffListLabelsResponse> {
    const response = await fetch(`${this.baseUrl}/${planId}/labels`)
    return this.handleResponse(response)
  }

  async createLabel(planId: string, request: BffCreateLabelRequest): Promise<BffTaskLabel> {
    const response = await fetch(`${this.baseUrl}/${planId}/labels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    return this.handleResponse(response)
  }

  async updateLabel(id: string, request: BffUpdateLabelRequest): Promise<BffTaskLabel> {
    const response = await fetch(`${this.baseUrl}/labels/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })
    return this.handleResponse(response)
  }

  async deleteLabel(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/labels/${id}`, { method: "DELETE" })
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.code || "NETWORK_ERROR")
    }
  }
}

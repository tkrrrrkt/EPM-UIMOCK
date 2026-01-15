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
  BffTaskLabelBrief,
  BffAssigneeBrief,
} from "@epm/contracts/bff/action-plan-kanban"

const mockLabels: BffTaskLabelBrief[] = [
  { id: "label-001", labelName: "重要", colorCode: "#EF4444" },
  { id: "label-002", labelName: "急ぎ", colorCode: "#F59E0B" },
  { id: "label-003", labelName: "確認待ち", colorCode: "#3B82F6" },
  { id: "label-004", labelName: "完了間近", colorCode: "#10B981" },
]

const mockAssignees: BffAssigneeBrief[] = [
  { employeeId: "emp-001", employeeName: "山田太郎" },
  { employeeId: "emp-002", employeeName: "佐藤花子" },
  { employeeId: "emp-003", employeeName: "鈴木一郎" },
]

const mockKanbanBoard: BffKanbanBoard = {
  planId: "plan-001",
  planName: "売上拡大施策",
  columns: [
    {
      statusId: "status-001",
      statusCode: "NOT_STARTED",
      statusName: "未着手",
      colorCode: "#6B7280",
      tasks: [
        {
          id: "task-001",
          taskName: "市場調査レポート作成",
          dueDate: "2026-02-15",
          sortOrder: 1,
          labels: [mockLabels[0]],
          assignees: [mockAssignees[0]],
          checklistProgress: { completed: 0, total: 3 },
          updatedAt: "2026-01-09T10:00:00.000Z",
        },
        {
          id: "task-002",
          taskName: "競合分析",
          dueDate: "2026-02-20",
          sortOrder: 2,
          labels: [],
          assignees: [mockAssignees[1]],
          checklistProgress: { completed: 0, total: 0 },
          updatedAt: "2026-01-09T10:00:00.000Z",
        },
      ],
    },
    {
      statusId: "status-002",
      statusCode: "IN_PROGRESS",
      statusName: "進行中",
      colorCode: "#3B82F6",
      tasks: [
        {
          id: "task-003",
          taskName: "営業資料作成",
          dueDate: "2026-01-31",
          sortOrder: 1,
          labels: [mockLabels[1], mockLabels[0]],
          assignees: [mockAssignees[0], mockAssignees[2]],
          checklistProgress: { completed: 2, total: 5 },
          updatedAt: "2026-01-09T10:00:00.000Z",
        },
      ],
    },
    {
      statusId: "status-003",
      statusCode: "REVIEW",
      statusName: "レビュー中",
      colorCode: "#F59E0B",
      tasks: [
        {
          id: "task-004",
          taskName: "提案書レビュー",
          dueDate: "2026-01-25",
          sortOrder: 1,
          labels: [mockLabels[2]],
          assignees: [mockAssignees[1]],
          checklistProgress: { completed: 3, total: 3 },
          updatedAt: "2026-01-09T10:00:00.000Z",
        },
      ],
    },
    {
      statusId: "status-004",
      statusCode: "COMPLETED",
      statusName: "完了",
      colorCode: "#10B981",
      tasks: [
        {
          id: "task-005",
          taskName: "キックオフミーティング",
          dueDate: "2026-01-10",
          sortOrder: 1,
          labels: [mockLabels[3]],
          assignees: [mockAssignees[0], mockAssignees[1], mockAssignees[2]],
          checklistProgress: { completed: 4, total: 4 },
          updatedAt: "2026-01-09T10:00:00.000Z",
        },
      ],
    },
  ],
}

const mockTaskDetail: BffTaskDetail = {
  id: "task-003",
  taskName: "営業資料作成",
  description: "新規顧客向けの営業資料を作成する。製品概要、価格表、導入事例を含める。",
  statusId: "status-002",
  dueDate: "2026-01-31",
  labels: [mockLabels[1], mockLabels[0]],
  assignees: [mockAssignees[0], mockAssignees[2]],
  checklist: [
    { id: "check-001", itemName: "製品概要ページ作成", isCompleted: true, sortOrder: 1 },
    { id: "check-002", itemName: "価格表作成", isCompleted: true, sortOrder: 2 },
    { id: "check-003", itemName: "導入事例追加", isCompleted: false, sortOrder: 3 },
    { id: "check-004", itemName: "デザイン調整", isCompleted: false, sortOrder: 4 },
    { id: "check-005", itemName: "最終レビュー", isCompleted: false, sortOrder: 5 },
  ],
  comments: [
    {
      id: "comment-001",
      content: "製品概要は完成しました。確認お願いします。",
      authorId: "emp-001",
      authorName: "山田太郎",
      createdAt: "2026-01-08T14:30:00.000Z",
      isOwner: true,
    },
    {
      id: "comment-002",
      content: "確認しました。価格表の更新もお願いします。",
      authorId: "emp-003",
      authorName: "鈴木一郎",
      createdAt: "2026-01-08T16:00:00.000Z",
      isOwner: false,
    },
  ],
  updatedAt: "2026-01-09T10:00:00.000Z",
}

const mockStatuses: BffTaskStatus[] = [
  {
    id: "status-001",
    statusCode: "NOT_STARTED",
    statusName: "未着手",
    colorCode: "#6B7280",
    sortOrder: 1,
    isDefault: true,
    isCompleted: false,
    updatedAt: "2026-01-09T10:00:00.000Z",
  },
  {
    id: "status-002",
    statusCode: "IN_PROGRESS",
    statusName: "進行中",
    colorCode: "#3B82F6",
    sortOrder: 2,
    isDefault: false,
    isCompleted: false,
    updatedAt: "2026-01-09T10:00:00.000Z",
  },
  {
    id: "status-003",
    statusCode: "REVIEW",
    statusName: "レビュー中",
    colorCode: "#F59E0B",
    sortOrder: 3,
    isDefault: false,
    isCompleted: false,
    updatedAt: "2026-01-09T10:00:00.000Z",
  },
  {
    id: "status-004",
    statusCode: "COMPLETED",
    statusName: "完了",
    colorCode: "#10B981",
    sortOrder: 4,
    isDefault: false,
    isCompleted: true,
    updatedAt: "2026-01-09T10:00:00.000Z",
  },
]

const mockFullLabels: BffTaskLabel[] = [
  {
    id: "label-001",
    labelCode: "IMPORTANT",
    labelName: "重要",
    colorCode: "#EF4444",
    sortOrder: 1,
    updatedAt: "2026-01-09T10:00:00.000Z",
  },
  {
    id: "label-002",
    labelCode: "URGENT",
    labelName: "急ぎ",
    colorCode: "#F59E0B",
    sortOrder: 2,
    updatedAt: "2026-01-09T10:00:00.000Z",
  },
  {
    id: "label-003",
    labelCode: "PENDING_REVIEW",
    labelName: "確認待ち",
    colorCode: "#3B82F6",
    sortOrder: 3,
    updatedAt: "2026-01-09T10:00:00.000Z",
  },
  {
    id: "label-004",
    labelCode: "NEAR_COMPLETION",
    labelName: "完了間近",
    colorCode: "#10B981",
    sortOrder: 4,
    updatedAt: "2026-01-09T10:00:00.000Z",
  },
]

export class MockBffClient implements BffClient {
  private delay(ms: number = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async getKanbanBoard(_planId: string): Promise<BffKanbanBoard> {
    await this.delay()
    return mockKanbanBoard
  }

  async getTaskDetail(_id: string): Promise<BffTaskDetail> {
    await this.delay()
    return mockTaskDetail
  }

  async createTask(request: BffCreateTaskRequest): Promise<BffTaskDetail> {
    await this.delay()
    return {
      id: `task-${Date.now()}`,
      taskName: request.taskName,
      description: null,
      statusId: request.statusId || "status-001",
      dueDate: null,
      labels: [],
      assignees: [],
      checklist: [],
      comments: [],
      updatedAt: new Date().toISOString(),
    }
  }

  async updateTask(_id: string, request: BffUpdateTaskRequest): Promise<BffTaskDetail> {
    await this.delay()
    return {
      ...mockTaskDetail,
      ...request,
      updatedAt: new Date().toISOString(),
    }
  }

  async updateTaskStatus(_id: string, _request: BffUpdateTaskStatusRequest): Promise<void> {
    await this.delay()
  }

  async reorderTasks(_request: BffReorderTasksRequest): Promise<void> {
    await this.delay()
  }

  async deleteTask(_id: string): Promise<void> {
    await this.delay()
  }

  async addChecklistItem(_taskId: string, request: BffCreateChecklistRequest): Promise<BffChecklistItem> {
    await this.delay()
    return {
      id: `check-${Date.now()}`,
      itemName: request.itemName,
      isCompleted: false,
      sortOrder: 99,
    }
  }

  async updateChecklistItem(_id: string, request: BffUpdateChecklistRequest): Promise<BffChecklistItem> {
    await this.delay()
    return {
      id: _id,
      itemName: request.itemName || "Updated item",
      isCompleted: request.isCompleted ?? false,
      sortOrder: 1,
    }
  }

  async deleteChecklistItem(_id: string): Promise<void> {
    await this.delay()
  }

  async addComment(_taskId: string, request: BffCreateCommentRequest): Promise<BffTaskComment> {
    await this.delay()
    return {
      id: `comment-${Date.now()}`,
      content: request.content,
      authorId: "emp-001",
      authorName: "山田太郎",
      createdAt: new Date().toISOString(),
      isOwner: true,
    }
  }

  async updateComment(_id: string, request: BffUpdateCommentRequest): Promise<BffTaskComment> {
    await this.delay()
    return {
      id: _id,
      content: request.content,
      authorId: "emp-001",
      authorName: "山田太郎",
      createdAt: new Date().toISOString(),
      isOwner: true,
    }
  }

  async deleteComment(_id: string): Promise<void> {
    await this.delay()
  }

  async addLabel(_taskId: string, _request: BffAddLabelRequest): Promise<void> {
    await this.delay()
  }

  async removeLabel(_taskId: string, _labelId: string): Promise<void> {
    await this.delay()
  }

  async addAssignee(_taskId: string, _request: BffAddAssigneeRequest): Promise<void> {
    await this.delay()
  }

  async removeAssignee(_taskId: string, _employeeId: string): Promise<void> {
    await this.delay()
  }

  async getStatuses(_planId: string): Promise<BffListStatusesResponse> {
    await this.delay()
    return { statuses: mockStatuses }
  }

  async createStatus(_planId: string, request: BffCreateStatusRequest): Promise<BffTaskStatus> {
    await this.delay()
    return {
      id: `status-${Date.now()}`,
      statusCode: request.statusCode,
      statusName: request.statusName,
      colorCode: request.colorCode || null,
      sortOrder: mockStatuses.length + 1,
      isDefault: request.isDefault || false,
      isCompleted: request.isCompleted || false,
      updatedAt: new Date().toISOString(),
    }
  }

  async updateStatus(_id: string, request: BffUpdateStatusRequest): Promise<BffTaskStatus> {
    await this.delay()
    const status = mockStatuses.find((s) => s.id === _id) || mockStatuses[0]
    return {
      ...status,
      ...request,
      updatedAt: new Date().toISOString(),
    }
  }

  async deleteStatus(_id: string): Promise<void> {
    await this.delay()
  }

  async reorderStatuses(_planId: string, _request: BffReorderStatusesRequest): Promise<void> {
    await this.delay()
  }

  async getLabels(_planId: string): Promise<BffListLabelsResponse> {
    await this.delay()
    return { labels: mockFullLabels }
  }

  async createLabel(_planId: string, request: BffCreateLabelRequest): Promise<BffTaskLabel> {
    await this.delay()
    return {
      id: `label-${Date.now()}`,
      labelCode: request.labelCode,
      labelName: request.labelName,
      colorCode: request.colorCode,
      sortOrder: mockFullLabels.length + 1,
      updatedAt: new Date().toISOString(),
    }
  }

  async updateLabel(_id: string, request: BffUpdateLabelRequest): Promise<BffTaskLabel> {
    await this.delay()
    const label = mockFullLabels.find((l) => l.id === _id) || mockFullLabels[0]
    return {
      ...label,
      ...request,
      updatedAt: new Date().toISOString(),
    }
  }

  async deleteLabel(_id: string): Promise<void> {
    await this.delay()
  }
}

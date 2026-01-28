/**
 * KPI Action Plan Kanban - Mock BFF Client
 *
 * v0-workflow.md準拠: MockBffClient先行パターン
 * design.md / v0-prompt.md モックデータ
 */

import type { BffClient } from './BffClient'
import type {
  BffKanbanBoard,
  BffTaskDetail,
  BffTaskStatus,
  BffTaskLabel,
  BffTaskLabelBrief,
  BffAssigneeBrief,
  BffCreateTaskRequest,
  BffUpdateTaskRequest,
  BffUpdateTaskStatusRequest,
  BffReorderTasksRequest,
  BffCreateChecklistRequest,
  BffUpdateChecklistRequest,
  BffCreateCommentRequest,
  BffUpdateCommentRequest,
  BffAddLabelRequest,
  BffAddAssigneeRequest,
  BffCreateStatusRequest,
  BffUpdateStatusRequest,
  BffCreateLabelRequest,
  BffUpdateLabelRequest,
  BffSelectableEmployee,
  BffChecklistItem,
  BffTaskComment,
  BffTaskCard,
} from '../lib/types'

// === モックデータ ===

const mockLabels: BffTaskLabelBrief[] = [
  { id: 'label-001', labelName: '重要', colorCode: '#EF4444' },
  { id: 'label-002', labelName: '急ぎ', colorCode: '#F59E0B' },
  { id: 'label-003', labelName: '確認待ち', colorCode: '#3B82F6' },
  { id: 'label-004', labelName: '完了間近', colorCode: '#10B981' },
]

const mockAssignees: BffAssigneeBrief[] = [
  { employeeId: 'emp-001', employeeName: '山田太郎' },
  { employeeId: 'emp-002', employeeName: '佐藤花子' },
  { employeeId: 'emp-003', employeeName: '鈴木一郎' },
  { employeeId: 'emp-004', employeeName: '田中美咲' },
]

const mockStatuses: BffTaskStatus[] = [
  {
    id: 'status-001',
    statusCode: 'NOT_STARTED',
    statusName: '未着手',
    colorCode: '#6B7280',
    sortOrder: 1,
    isDefault: true,
    isCompleted: false,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'status-002',
    statusCode: 'IN_PROGRESS',
    statusName: '進行中',
    colorCode: '#3B82F6',
    sortOrder: 2,
    isDefault: false,
    isCompleted: false,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'status-003',
    statusCode: 'REVIEW',
    statusName: 'レビュー中',
    colorCode: '#F59E0B',
    sortOrder: 3,
    isDefault: false,
    isCompleted: false,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'status-004',
    statusCode: 'COMPLETED',
    statusName: '完了',
    colorCode: '#10B981',
    sortOrder: 4,
    isDefault: false,
    isCompleted: true,
    updatedAt: new Date().toISOString(),
  },
]

const mockTasks: BffTaskCard[] = [
  {
    id: 'task-001',
    taskName: '市場調査レポート作成',
    description: '競合他社の動向と市場トレンドを調査しレポートにまとめる',
    statusId: 'status-001',
    dueDate: '2026-02-15',
    sortOrder: 1,
    labels: [mockLabels[0]],
    assignees: [mockAssignees[0]],
    checklistProgress: { completed: 0, total: 3 },
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-002',
    taskName: '競合分析',
    description: '主要競合3社の製品・価格・マーケティング戦略を分析',
    statusId: 'status-001',
    dueDate: '2026-02-20',
    sortOrder: 2,
    labels: [],
    assignees: [mockAssignees[1]],
    checklistProgress: { completed: 0, total: 0 },
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-003',
    taskName: '営業資料作成',
    description: '新規顧客向けの営業資料を作成する。製品概要、価格表、導入事例を含める。',
    statusId: 'status-002',
    dueDate: '2026-01-31',
    sortOrder: 1,
    labels: [mockLabels[1], mockLabels[0]],
    assignees: [mockAssignees[0], mockAssignees[2]],
    checklistProgress: { completed: 2, total: 5 },
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-004',
    taskName: '提案書レビュー',
    description: '作成した提案書の社内レビューを実施',
    statusId: 'status-003',
    dueDate: '2026-01-25',
    sortOrder: 1,
    labels: [mockLabels[2]],
    assignees: [mockAssignees[1]],
    checklistProgress: { completed: 3, total: 3 },
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-005',
    taskName: 'キックオフミーティング',
    description: 'プロジェクトキックオフミーティングの実施',
    statusId: 'status-004',
    dueDate: '2026-01-10',
    sortOrder: 1,
    labels: [mockLabels[3]],
    assignees: [mockAssignees[0], mockAssignees[1], mockAssignees[2]],
    checklistProgress: { completed: 4, total: 4 },
    updatedAt: new Date().toISOString(),
  },
]

const mockTaskDetail: BffTaskDetail = {
  id: 'task-003',
  taskName: '営業資料作成',
  description: '新規顧客向けの営業資料を作成する。製品概要、価格表、導入事例を含める。',
  statusId: 'status-002',
  dueDate: '2026-01-31',
  labels: [mockLabels[1], mockLabels[0]],
  assignees: [mockAssignees[0], mockAssignees[2]],
  checklist: [
    { id: 'check-001', itemName: '製品概要ページ作成', isCompleted: true, sortOrder: 1 },
    { id: 'check-002', itemName: '価格表作成', isCompleted: true, sortOrder: 2 },
    { id: 'check-003', itemName: '導入事例追加', isCompleted: false, sortOrder: 3 },
    { id: 'check-004', itemName: 'デザイン調整', isCompleted: false, sortOrder: 4 },
    { id: 'check-005', itemName: '最終レビュー', isCompleted: false, sortOrder: 5 },
  ],
  comments: [
    {
      id: 'comment-001',
      content: '製品概要は完成しました。確認お願いします。',
      authorId: 'emp-001',
      authorName: '山田太郎',
      createdAt: '2026-01-08T14:30:00.000Z',
      isOwner: true,
    },
    {
      id: 'comment-002',
      content: '確認しました。価格表の更新もお願いします。',
      authorId: 'emp-003',
      authorName: '鈴木一郎',
      createdAt: '2026-01-08T16:00:00.000Z',
      isOwner: false,
    },
  ],
  updatedAt: new Date().toISOString(),
}

/**
 * MockBffClient - UI開発用モッククライアント
 */
export class MockBffClient implements BffClient {
  private tasks = [...mockTasks]
  private statuses = [...mockStatuses]
  private labels = [...mockLabels].map((l, i) => ({
    ...l,
    sortOrder: i + 1,
    updatedAt: new Date().toISOString(),
  })) as BffTaskLabel[]
  private taskDetails: Record<string, BffTaskDetail> = {
    'task-003': { ...mockTaskDetail },
  }

  // === カンバンボード ===

  async getKanbanBoard(planId: string): Promise<BffKanbanBoard> {
    await this.delay(300)

    const columns = this.statuses
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((status) => ({
        statusId: status.id,
        statusCode: status.statusCode,
        statusName: status.statusName,
        colorCode: status.colorCode,
        sortOrder: status.sortOrder,
        isDefault: status.isDefault,
        isCompleted: status.isCompleted,
        tasks: this.tasks
          .filter((t) => t.statusId === status.id)
          .sort((a, b) => a.sortOrder - b.sortOrder),
      }))

    return {
      planId,
      planName: '売上拡大施策',
      columns,
    }
  }

  // === タスク CRUD ===

  async getTaskDetail(taskId: string): Promise<BffTaskDetail> {
    await this.delay(200)

    // キャッシュされた詳細があれば返す
    if (this.taskDetails[taskId]) {
      return this.taskDetails[taskId]
    }

    // なければタスクカードから生成
    const task = this.tasks.find((t) => t.id === taskId)
    if (!task) {
      throw new Error('TASK_NOT_FOUND')
    }

    return {
      id: task.id,
      taskName: task.taskName,
      description: task.description,
      statusId: task.statusId,
      dueDate: task.dueDate,
      labels: task.labels,
      assignees: task.assignees,
      checklist: [],
      comments: [],
      updatedAt: task.updatedAt,
    }
  }

  async createTask(request: BffCreateTaskRequest): Promise<BffTaskDetail> {
    await this.delay(200)

    const statusId = request.statusId || this.statuses.find((s) => s.isDefault)?.id || 'status-001'
    const tasksInStatus = this.tasks.filter((t) => t.statusId === statusId)
    const maxSortOrder = Math.max(0, ...tasksInStatus.map((t) => t.sortOrder))

    const newTask: BffTaskCard = {
      id: `task-${Date.now()}`,
      taskName: request.taskName,
      description: request.description || null,
      statusId,
      dueDate: null,
      sortOrder: maxSortOrder + 1,
      labels: [],
      assignees: [],
      checklistProgress: { completed: 0, total: 0 },
      updatedAt: new Date().toISOString(),
    }

    this.tasks.push(newTask)

    const detail: BffTaskDetail = {
      id: newTask.id,
      taskName: newTask.taskName,
      description: newTask.description,
      statusId: newTask.statusId,
      dueDate: newTask.dueDate,
      labels: [],
      assignees: [],
      checklist: [],
      comments: [],
      updatedAt: newTask.updatedAt,
    }

    this.taskDetails[newTask.id] = detail
    return detail
  }

  async updateTask(taskId: string, request: BffUpdateTaskRequest): Promise<BffTaskDetail> {
    await this.delay(200)

    const taskIndex = this.tasks.findIndex((t) => t.id === taskId)
    if (taskIndex === -1) throw new Error('TASK_NOT_FOUND')

    const task = this.tasks[taskIndex]
    const updatedTask: BffTaskCard = {
      ...task,
      taskName: request.taskName ?? task.taskName,
      description: request.description ?? task.description,
      dueDate: request.dueDate !== undefined ? request.dueDate : task.dueDate,
      updatedAt: new Date().toISOString(),
    }

    this.tasks[taskIndex] = updatedTask

    // 詳細も更新
    if (this.taskDetails[taskId]) {
      this.taskDetails[taskId] = {
        ...this.taskDetails[taskId],
        taskName: updatedTask.taskName,
        description: updatedTask.description,
        dueDate: updatedTask.dueDate,
        updatedAt: updatedTask.updatedAt,
      }
      return this.taskDetails[taskId]
    }

    return this.getTaskDetail(taskId)
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.delay(200)
    this.tasks = this.tasks.filter((t) => t.id !== taskId)
    delete this.taskDetails[taskId]
  }

  async updateTaskStatus(taskId: string, request: BffUpdateTaskStatusRequest): Promise<void> {
    await this.delay(100)

    const taskIndex = this.tasks.findIndex((t) => t.id === taskId)
    if (taskIndex === -1) throw new Error('TASK_NOT_FOUND')

    this.tasks[taskIndex] = {
      ...this.tasks[taskIndex],
      statusId: request.statusId,
      sortOrder: request.sortOrder,
      updatedAt: new Date().toISOString(),
    }

    if (this.taskDetails[taskId]) {
      this.taskDetails[taskId].statusId = request.statusId
    }
  }

  async reorderTasks(request: BffReorderTasksRequest): Promise<void> {
    await this.delay(100)

    for (const order of request.orders) {
      const taskIndex = this.tasks.findIndex((t) => t.id === order.id)
      if (taskIndex !== -1) {
        this.tasks[taskIndex] = {
          ...this.tasks[taskIndex],
          sortOrder: order.sortOrder,
        }
      }
    }
  }

  // === チェックリスト ===

  async createChecklistItem(taskId: string, request: BffCreateChecklistRequest): Promise<BffChecklistItem> {
    await this.delay(100)

    const detail = this.taskDetails[taskId]
    if (!detail) {
      const newDetail = await this.getTaskDetail(taskId)
      this.taskDetails[taskId] = newDetail
    }

    const checklist = this.taskDetails[taskId].checklist
    const maxSortOrder = Math.max(0, ...checklist.map((c) => c.sortOrder))

    const newItem: BffChecklistItem = {
      id: `check-${Date.now()}`,
      itemName: request.itemName,
      isCompleted: false,
      sortOrder: maxSortOrder + 1,
    }

    this.taskDetails[taskId].checklist.push(newItem)
    this.updateTaskChecklistProgress(taskId)

    return newItem
  }

  async updateChecklistItem(itemId: string, request: BffUpdateChecklistRequest): Promise<BffChecklistItem> {
    await this.delay(100)

    for (const taskId of Object.keys(this.taskDetails)) {
      const detail = this.taskDetails[taskId]
      const itemIndex = detail.checklist.findIndex((c) => c.id === itemId)
      if (itemIndex !== -1) {
        const item = detail.checklist[itemIndex]
        detail.checklist[itemIndex] = {
          ...item,
          itemName: request.itemName ?? item.itemName,
          isCompleted: request.isCompleted ?? item.isCompleted,
        }
        this.updateTaskChecklistProgress(taskId)
        return detail.checklist[itemIndex]
      }
    }

    throw new Error('CHECKLIST_ITEM_NOT_FOUND')
  }

  async deleteChecklistItem(itemId: string): Promise<void> {
    await this.delay(100)

    for (const taskId of Object.keys(this.taskDetails)) {
      const detail = this.taskDetails[taskId]
      const itemIndex = detail.checklist.findIndex((c) => c.id === itemId)
      if (itemIndex !== -1) {
        detail.checklist.splice(itemIndex, 1)
        this.updateTaskChecklistProgress(taskId)
        return
      }
    }
  }

  private updateTaskChecklistProgress(taskId: string): void {
    const detail = this.taskDetails[taskId]
    if (!detail) return

    const total = detail.checklist.length
    const completed = detail.checklist.filter((c) => c.isCompleted).length

    const taskIndex = this.tasks.findIndex((t) => t.id === taskId)
    if (taskIndex !== -1) {
      this.tasks[taskIndex] = {
        ...this.tasks[taskIndex],
        checklistProgress: { completed, total },
      }
    }
  }

  // === コメント ===

  async createComment(taskId: string, request: BffCreateCommentRequest): Promise<BffTaskComment> {
    await this.delay(100)

    if (!this.taskDetails[taskId]) {
      const newDetail = await this.getTaskDetail(taskId)
      this.taskDetails[taskId] = newDetail
    }

    const newComment: BffTaskComment = {
      id: `comment-${Date.now()}`,
      content: request.content,
      authorId: 'emp-001',
      authorName: '山田太郎',
      createdAt: new Date().toISOString(),
      isOwner: true,
    }

    this.taskDetails[taskId].comments.push(newComment)
    return newComment
  }

  async updateComment(commentId: string, request: BffUpdateCommentRequest): Promise<BffTaskComment> {
    await this.delay(100)

    for (const detail of Object.values(this.taskDetails)) {
      const commentIndex = detail.comments.findIndex((c) => c.id === commentId)
      if (commentIndex !== -1) {
        if (!detail.comments[commentIndex].isOwner) {
          throw new Error('COMMENT_NOT_OWNER')
        }
        detail.comments[commentIndex] = {
          ...detail.comments[commentIndex],
          content: request.content,
        }
        return detail.comments[commentIndex]
      }
    }

    throw new Error('COMMENT_NOT_FOUND')
  }

  async deleteComment(commentId: string): Promise<void> {
    await this.delay(100)

    for (const detail of Object.values(this.taskDetails)) {
      const commentIndex = detail.comments.findIndex((c) => c.id === commentId)
      if (commentIndex !== -1) {
        if (!detail.comments[commentIndex].isOwner) {
          throw new Error('COMMENT_NOT_OWNER')
        }
        detail.comments.splice(commentIndex, 1)
        return
      }
    }
  }

  // === ラベル付与 ===

  async addLabel(taskId: string, request: BffAddLabelRequest): Promise<void> {
    await this.delay(100)

    const taskIndex = this.tasks.findIndex((t) => t.id === taskId)
    if (taskIndex === -1) throw new Error('TASK_NOT_FOUND')

    const label = this.labels.find((l) => l.id === request.labelId)
    if (!label) throw new Error('LABEL_NOT_FOUND')

    const task = this.tasks[taskIndex]
    if (!task.labels.find((l) => l.id === label.id)) {
      this.tasks[taskIndex] = {
        ...task,
        labels: [...task.labels, { id: label.id, labelName: label.labelName, colorCode: label.colorCode }],
      }
    }

    if (this.taskDetails[taskId]) {
      const detail = this.taskDetails[taskId]
      if (!detail.labels.find((l) => l.id === label.id)) {
        detail.labels.push({ id: label.id, labelName: label.labelName, colorCode: label.colorCode })
      }
    }
  }

  async removeLabel(taskId: string, labelId: string): Promise<void> {
    await this.delay(100)

    const taskIndex = this.tasks.findIndex((t) => t.id === taskId)
    if (taskIndex !== -1) {
      this.tasks[taskIndex] = {
        ...this.tasks[taskIndex],
        labels: this.tasks[taskIndex].labels.filter((l) => l.id !== labelId),
      }
    }

    if (this.taskDetails[taskId]) {
      this.taskDetails[taskId].labels = this.taskDetails[taskId].labels.filter((l) => l.id !== labelId)
    }
  }

  // === 担当者 ===

  async addAssignee(taskId: string, request: BffAddAssigneeRequest): Promise<void> {
    await this.delay(100)

    const taskIndex = this.tasks.findIndex((t) => t.id === taskId)
    if (taskIndex === -1) throw new Error('TASK_NOT_FOUND')

    const employee = mockAssignees.find((a) => a.employeeId === request.employeeId)
    if (!employee) return

    const task = this.tasks[taskIndex]
    if (!task.assignees.find((a) => a.employeeId === employee.employeeId)) {
      this.tasks[taskIndex] = {
        ...task,
        assignees: [...task.assignees, employee],
      }
    }

    if (this.taskDetails[taskId]) {
      const detail = this.taskDetails[taskId]
      if (!detail.assignees.find((a) => a.employeeId === employee.employeeId)) {
        detail.assignees.push(employee)
      }
    }
  }

  async removeAssignee(taskId: string, employeeId: string): Promise<void> {
    await this.delay(100)

    const taskIndex = this.tasks.findIndex((t) => t.id === taskId)
    if (taskIndex !== -1) {
      this.tasks[taskIndex] = {
        ...this.tasks[taskIndex],
        assignees: this.tasks[taskIndex].assignees.filter((a) => a.employeeId !== employeeId),
      }
    }

    if (this.taskDetails[taskId]) {
      this.taskDetails[taskId].assignees = this.taskDetails[taskId].assignees.filter(
        (a) => a.employeeId !== employeeId
      )
    }
  }

  // === ステータス管理 ===

  async getStatuses(_planId: string): Promise<BffTaskStatus[]> {
    await this.delay(100)
    return [...this.statuses].sort((a, b) => a.sortOrder - b.sortOrder)
  }

  async createStatus(_planId: string, request: BffCreateStatusRequest): Promise<BffTaskStatus> {
    await this.delay(100)

    const maxSortOrder = Math.max(0, ...this.statuses.map((s) => s.sortOrder))

    const newStatus: BffTaskStatus = {
      id: `status-${Date.now()}`,
      statusCode: request.statusCode,
      statusName: request.statusName,
      colorCode: request.colorCode || '#6B7280',
      sortOrder: maxSortOrder + 1,
      isDefault: request.isDefault || false,
      isCompleted: request.isCompleted || false,
      updatedAt: new Date().toISOString(),
    }

    this.statuses.push(newStatus)
    return newStatus
  }

  async updateStatus(statusId: string, request: BffUpdateStatusRequest): Promise<BffTaskStatus> {
    await this.delay(100)

    const index = this.statuses.findIndex((s) => s.id === statusId)
    if (index === -1) throw new Error('STATUS_NOT_FOUND')

    const status = this.statuses[index]
    this.statuses[index] = {
      ...status,
      statusName: request.statusName ?? status.statusName,
      colorCode: request.colorCode ?? status.colorCode,
      isDefault: request.isDefault ?? status.isDefault,
      isCompleted: request.isCompleted ?? status.isCompleted,
      updatedAt: new Date().toISOString(),
    }

    return this.statuses[index]
  }

  async deleteStatus(statusId: string): Promise<void> {
    await this.delay(100)

    const status = this.statuses.find((s) => s.id === statusId)
    if (!status) throw new Error('STATUS_NOT_FOUND')
    if (status.isDefault) throw new Error('STATUS_IS_DEFAULT')

    const tasksInStatus = this.tasks.filter((t) => t.statusId === statusId)
    if (tasksInStatus.length > 0) throw new Error('STATUS_IN_USE')

    this.statuses = this.statuses.filter((s) => s.id !== statusId)
  }

  // === ラベル管理 ===

  async getLabels(_planId: string): Promise<BffTaskLabel[]> {
    await this.delay(100)
    return [...this.labels].sort((a, b) => a.sortOrder - b.sortOrder)
  }

  async createLabel(_planId: string, request: BffCreateLabelRequest): Promise<BffTaskLabel> {
    await this.delay(100)

    const maxSortOrder = Math.max(0, ...this.labels.map((l) => l.sortOrder))

    const newLabel: BffTaskLabel = {
      id: `label-${Date.now()}`,
      labelName: request.labelName,
      colorCode: request.colorCode,
      sortOrder: maxSortOrder + 1,
      updatedAt: new Date().toISOString(),
    }

    this.labels.push(newLabel)
    return newLabel
  }

  async updateLabel(labelId: string, request: BffUpdateLabelRequest): Promise<BffTaskLabel> {
    await this.delay(100)

    const index = this.labels.findIndex((l) => l.id === labelId)
    if (index === -1) throw new Error('LABEL_NOT_FOUND')

    const label = this.labels[index]
    this.labels[index] = {
      ...label,
      labelName: request.labelName ?? label.labelName,
      colorCode: request.colorCode ?? label.colorCode,
      updatedAt: new Date().toISOString(),
    }

    return this.labels[index]
  }

  async deleteLabel(labelId: string): Promise<void> {
    await this.delay(100)

    // タスクからラベルを削除
    for (const task of this.tasks) {
      task.labels = task.labels.filter((l) => l.id !== labelId)
    }
    for (const detail of Object.values(this.taskDetails)) {
      detail.labels = detail.labels.filter((l) => l.id !== labelId)
    }

    this.labels = this.labels.filter((l) => l.id !== labelId)
  }

  // === 選択可能データ ===

  async getSelectableEmployees(): Promise<BffSelectableEmployee[]> {
    await this.delay(100)
    return mockAssignees.map((a) => ({
      id: a.employeeId,
      name: a.employeeName,
      departmentName: '営業部',
    }))
  }

  // === ユーティリティ ===

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

"use client"

import { useState, useEffect } from "react"
import type { BffProjectSummary, BffProjectDetailResponse, ProjectStatus } from "@epm/contracts/bff/project-master"
import { Button, Card, CardContent, CardHeader, CardTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui"
import { ProjectListTable } from "../components/ProjectListTable"
import { ProjectSearchBar } from "../components/ProjectSearchBar"
import { ProjectFormDialog, type ProjectFormData } from "../components/ProjectFormDialog"
import { ProjectDetailDialog } from "../components/ProjectDetailDialog"
import { ConfirmDialog } from "../components/ConfirmDialog"
import { ErrorAlert } from "../components/ErrorAlert"
import { bffClient } from "../api/client"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"

export default function ProjectMasterListPage() {
  const [projects, setProjects] = useState<BffProjectSummary[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [sortBy, setSortBy] = useState<"projectCode" | "projectName" | "projectStatus" | "startDate" | "endDate">(
    "projectCode",
  )
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [keyword, setKeyword] = useState("")
  const [projectStatus, setProjectStatus] = useState<ProjectStatus | undefined>(undefined)
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  const [selectedProject, setSelectedProject] = useState<BffProjectDetailResponse | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<BffProjectDetailResponse | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    message: string
    onConfirm: () => void
  }>({
    open: false,
    title: "",
    message: "",
    onConfirm: () => {},
  })

  const loadProjects = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await bffClient.listProjects({
        page,
        pageSize,
        sortBy,
        sortOrder,
        keyword: keyword || undefined,
        projectStatus,
        isActive,
      })
      setProjects(response.items)
      setTotalCount(response.totalCount)
    } catch (err) {
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [page, pageSize, sortBy, sortOrder])

  const handleSearch = (searchKeyword: string, searchProjectStatus?: ProjectStatus, searchIsActive?: boolean) => {
    setKeyword(searchKeyword)
    setProjectStatus(searchProjectStatus)
    setIsActive(searchIsActive)
    setPage(1)

    bffClient
      .listProjects({
        page: 1,
        pageSize,
        sortBy,
        sortOrder,
        keyword: searchKeyword || undefined,
        projectStatus: searchProjectStatus,
        isActive: searchIsActive,
      })
      .then((response) => {
        setProjects(response.items)
        setTotalCount(response.totalCount)
      })
      .catch((err) => {
        setError(err)
      })
  }

  const handleViewDetail = async (id: string) => {
    try {
      setError(null)
      const detail = await bffClient.getProjectDetail(id)
      setSelectedProject(detail)
      setIsDetailDialogOpen(true)
    } catch (err) {
      setError(err)
    }
  }

  const handleEdit = (project: BffProjectDetailResponse) => {
    setEditingProject(project)
    setIsDetailDialogOpen(false)
    setIsCreateDialogOpen(true)
  }

  const handleDeactivate = (id: string) => {
    setConfirmDialog({
      open: true,
      title: "プロジェクトの無効化",
      message: "このプロジェクトを無効化してもよろしいですか？",
      onConfirm: async () => {
        try {
          setError(null)
          await bffClient.deactivateProject(id)
          setIsDetailDialogOpen(false)
          await loadProjects()
        } catch (err) {
          setError(err)
        }
        setConfirmDialog({ ...confirmDialog, open: false })
      },
    })
  }

  const handleActivate = async (id: string) => {
    try {
      setError(null)
      await bffClient.reactivateProject(id)
      setIsDetailDialogOpen(false)
      await loadProjects()
    } catch (err) {
      setError(err)
    }
  }

  const handleCreateProject = async (data: ProjectFormData) => {
    try {
      if (editingProject) {
        await bffClient.updateProject(editingProject.id, data)
      } else {
        await bffClient.createProject(data)
      }
      setEditingProject(null)
      await loadProjects()
    } catch (err) {
      setError(err)
      throw err
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">プロジェクトマスタ</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          新規登録
        </Button>
      </div>

      {error && <ErrorAlert error={error} />}

      <Card>
        <CardHeader>
          <CardTitle>検索・フィルタ</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectSearchBar onSearch={handleSearch} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>プロジェクト一覧 ({totalCount}件)</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">並び順:</span>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="projectCode">プロジェクトコード</SelectItem>
                    <SelectItem value="projectName">プロジェクト名</SelectItem>
                    <SelectItem value="projectStatus">ステータス</SelectItem>
                    <SelectItem value="startDate">開始日</SelectItem>
                    <SelectItem value="endDate">終了日</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">昇順</SelectItem>
                    <SelectItem value="desc">降順</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">表示件数:</span>
                <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">読み込み中...</p>
            </div>
          ) : (
            <>
              <ProjectListTable projects={projects} onViewDetail={handleViewDetail} />

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    {totalCount}件中 {(page - 1) * pageSize + 1}〜{Math.min(page * pageSize, totalCount)}件を表示
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      前へ
                    </Button>
                    <span className="text-sm">
                      {page} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      次へ
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ProjectDetailDialog
        project={selectedProject}
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        onEdit={handleEdit}
        onDeactivate={handleDeactivate}
        onActivate={handleActivate}
      />

      <ProjectFormDialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open)
          if (!open) setEditingProject(null)
        }}
        editingProject={editingProject}
        onSubmit={handleCreateProject}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, open: false })}
      />
    </div>
  )
}

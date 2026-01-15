"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle, Button } from "@/shared/ui"
import { AlertCircle, Plus, Loader2 } from "lucide-react"
import { SubjectTree } from "./components/SubjectTree"
import { SubjectDetailPanel } from "./components/SubjectDetailPanel"
import { SubjectFilterBar } from "./components/SubjectFilterBar"
import { CreateSubjectDialog } from "./components/CreateSubjectDialog"
import { bffClient } from "./api/client"
import { getErrorMessage } from "./error-messages"
import type {
  BffSubjectTreeRequest,
  BffSubjectTreeResponse,
  BffSubjectTreeNode,
  BffSubjectDetailResponse,
  BffCreateSubjectRequest,
  BffUpdateSubjectRequest,
} from "@contracts/bff/subject-master"

export default function SubjectMasterPage() {
  const [treeData, setTreeData] = useState<BffSubjectTreeResponse | null>(null)
  const [selectedNode, setSelectedNode] = useState<BffSubjectTreeNode | null>(null)
  const [selectedDetail, setSelectedDetail] = useState<BffSubjectDetailResponse | null>(null)
  const [filters, setFilters] = useState<BffSubjectTreeRequest>({})
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createDialogClass, setCreateDialogClass] = useState<"BASE" | "AGGREGATE">("BASE")

  useEffect(() => {
    loadTree()
  }, [filters])

  const loadTree = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await bffClient.getSubjectTree(filters)
      setTreeData(data)
    } catch (err: any) {
      setError(getErrorMessage(err.message))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectNode = async (node: BffSubjectTreeNode) => {
    setSelectedNode(node)
    setIsLoadingDetail(true)
    try {
      const detail = await bffClient.getSubjectDetail(node.id)
      setSelectedDetail(detail)
    } catch (err: any) {
      setError(getErrorMessage(err.message))
    } finally {
      setIsLoadingDetail(false)
    }
  }

  const handleUpdateSubject = async (id: string, data: BffUpdateSubjectRequest) => {
    try {
      const updated = await bffClient.updateSubject(id, data)
      setSelectedDetail(updated)
      await loadTree()
    } catch (err: any) {
      setError(getErrorMessage(err.message))
      throw err
    }
  }

  const handleCreateSubject = async (request: BffCreateSubjectRequest) => {
    try {
      await bffClient.createSubject(request)
      await loadTree()
      setCreateDialogOpen(false)
    } catch (err: any) {
      throw new Error(getErrorMessage(err.message))
    }
  }

  const handleOpenCreateDialog = (subjectClass: "BASE" | "AGGREGATE") => {
    setCreateDialogClass(subjectClass)
    setCreateDialogOpen(true)
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* ヘッダー */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">科目マスタ</h1>
              <p className="text-sm text-muted-foreground mt-1">勘定科目と集計構造を管理します</p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => handleOpenCreateDialog("BASE")}>
                <Plus className="h-4 w-4 mr-2" />
                通常科目を追加
              </Button>
              <Button variant="secondary" onClick={() => handleOpenCreateDialog("AGGREGATE")}>
                <Plus className="h-4 w-4 mr-2" />
                集計科目を追加
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* エラー表示 */}
      {error && (
        <div className="container mx-auto px-6 pt-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>エラー</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* メインコンテンツ（3ペイン） */}
      <div className="flex-1 container mx-auto px-6 py-6 overflow-hidden">
        <div className="grid grid-cols-12 gap-6 h-full">
          {/* Left: Filter Panel */}
          <div className="col-span-3">
            <SubjectFilterBar filters={filters} onFiltersChange={setFilters} />
          </div>

          {/* Center: Tree View */}
          <div className="col-span-6 h-full">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                読み込み中...
              </div>
            ) : treeData ? (
              <SubjectTree
                nodes={treeData.nodes}
                unassigned={treeData.unassigned}
                selectedId={selectedNode?.id || null}
                onSelect={handleSelectNode}
                searchKeyword={filters.keyword}
              />
            ) : null}
          </div>

          {/* Right: Detail Panel */}
          <div className="col-span-3 h-full">
            {isLoadingDetail ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <SubjectDetailPanel subject={selectedDetail} onUpdate={handleUpdateSubject} />
            )}
          </div>
        </div>
      </div>

      {/* ダイアログ */}
      <CreateSubjectDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        subjectClass={createDialogClass}
        onCreate={handleCreateSubject}
      />
    </div>
  )
}

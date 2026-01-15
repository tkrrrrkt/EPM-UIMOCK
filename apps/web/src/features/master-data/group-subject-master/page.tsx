"use client"

import { useState, useEffect } from "react"
import { Plus, Loader2 } from "lucide-react"
import { Button, useToast } from "@/shared/ui"
import { GroupSubjectTree } from "./components/GroupSubjectTree"
import { GroupSubjectFilterPanel } from "./components/GroupSubjectFilterPanel"
import { GroupSubjectDetailPanel } from "./components/GroupSubjectDetailPanel"
import { CreateGroupSubjectDialog } from "./components/CreateGroupSubjectDialog"
import { ConfirmDeactivateDialog } from "./components/ConfirmDeactivateDialog"
import { AddRollupDialog } from "./components/AddRollupDialog"
import { bffClient } from "./api/client"
import type {
  BffGroupSubjectTreeRequest,
  BffGroupSubjectTreeResponse,
  BffGroupSubjectTreeNode,
  BffGroupSubjectDetailResponse,
  BffCreateGroupSubjectRequest,
  BffAddGroupRollupRequest,
} from "@epm/contracts/bff/group-subject-master"

export default function GroupSubjectMasterPage() {
  const { toast } = useToast()
  const [treeData, setTreeData] = useState<BffGroupSubjectTreeResponse | null>(null)
  const [selectedNode, setSelectedNode] = useState<BffGroupSubjectTreeNode | null>(null)
  const [selectedDetail, setSelectedDetail] = useState<BffGroupSubjectDetailResponse | null>(null)
  const [filters, setFilters] = useState<BffGroupSubjectTreeRequest>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createSubjectClass, setCreateSubjectClass] = useState<"BASE" | "AGGREGATE">("BASE")
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false)
  const [addRollupDialogOpen, setAddRollupDialogOpen] = useState(false)
  const [rollupParentSubject, setRollupParentSubject] = useState<{ id: string; groupSubjectName: string } | null>(null)

  // Load tree data
  useEffect(() => {
    loadTreeData()
  }, [filters])

  const loadTreeData = async () => {
    setIsLoading(true)
    try {
      const data = await bffClient.getTree(filters)
      setTreeData(data)
    } catch (error) {
      toast({
        title: "エラー",
        description: "データの読み込みに失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Load detail when node is selected
  useEffect(() => {
    if (selectedNode) {
      loadDetail(selectedNode.id)
    } else {
      setSelectedDetail(null)
    }
  }, [selectedNode])

  const loadDetail = async (id: string) => {
    setIsLoadingDetail(true)
    try {
      const detail = await bffClient.getDetail(id)
      setSelectedDetail(detail)
    } catch (error) {
      toast({
        title: "エラー",
        description: "詳細情報の読み込みに失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsLoadingDetail(false)
    }
  }

  const handleNodeSelect = (node: BffGroupSubjectTreeNode) => {
    setSelectedNode(node)
  }

  const handleCreateSubject = async (request: BffCreateGroupSubjectRequest) => {
    try {
      await bffClient.create(request)
      toast({
        title: "成功",
        description: "連結勘定科目を登録しました",
      })
      loadTreeData()
    } catch (error) {
      toast({
        title: "エラー",
        description: "登録に失敗しました",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleDeactivate = async () => {
    if (!selectedDetail) return
    try {
      await bffClient.deactivate(selectedDetail.id)
      toast({
        title: "成功",
        description: "科目を無効化しました",
      })
      setDeactivateDialogOpen(false)
      loadTreeData()
      loadDetail(selectedDetail.id)
    } catch (error) {
      toast({
        title: "エラー",
        description: "無効化に失敗しました",
        variant: "destructive",
      })
    }
  }

  const handleReactivate = async (id: string) => {
    try {
      await bffClient.reactivate(id)
      toast({
        title: "成功",
        description: "科目を再有効化しました",
      })
      loadTreeData()
      loadDetail(id)
    } catch (error) {
      toast({
        title: "エラー",
        description: "再有効化に失敗しました",
        variant: "destructive",
      })
    }
  }

  const handleOpenAddRollup = (detail: BffGroupSubjectDetailResponse) => {
    setRollupParentSubject({ id: detail.id, groupSubjectName: detail.groupSubjectName })
    setAddRollupDialogOpen(true)
  }

  const handleAddRollup = async (parentId: string, request: BffAddGroupRollupRequest) => {
    try {
      await bffClient.addRollup(parentId, request)
      toast({
        title: "成功",
        description: "構成科目を追加しました",
      })
      loadTreeData()
    } catch (error) {
      toast({
        title: "エラー",
        description: "構成科目の追加に失敗しました",
        variant: "destructive",
      })
      throw error
    }
  }

  // 選択可能な科目一覧を取得（親科目自身と既存の子科目を除外）
  const getAvailableSubjectsForRollup = (): BffGroupSubjectTreeNode[] => {
    if (!treeData || !rollupParentSubject) return []

    const allSubjects: BffGroupSubjectTreeNode[] = []

    // ツリーからフラットな配列を作成
    const flattenTree = (nodes: BffGroupSubjectTreeNode[]) => {
      for (const node of nodes) {
        allSubjects.push({ ...node, children: [] })
        if (node.children.length > 0) {
          flattenTree(node.children)
        }
      }
    }

    flattenTree(treeData.nodes)
    treeData.unassigned.forEach((node) => allSubjects.push({ ...node, children: [] }))

    // 親科目自身を除外（循環参照防止のための簡易チェック）
    return allSubjects.filter((s) => s.id !== rollupParentSubject.id)
  }

  const isParentCompany = treeData?.isParentCompany ?? false

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">連結勘定科目マスタ</h1>
              <p className="text-sm text-muted-foreground mt-1">連結勘定科目のツリー構造を管理します</p>
            </div>
            {isParentCompany && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    setCreateSubjectClass("BASE")
                    setCreateDialogOpen(true)
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  通常科目を追加
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setCreateSubjectClass("AGGREGATE")
                    setCreateDialogOpen(true)
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  集計科目を追加
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-6 py-6 overflow-hidden">
        <div className="grid grid-cols-12 gap-6 h-full">
          {/* Left: Filter Panel */}
          <div className="col-span-3">
            <GroupSubjectFilterPanel filters={filters} onFiltersChange={setFilters} />
          </div>

          {/* Center: Tree View */}
          <div className="col-span-6 h-full">
            {treeData && (
              <GroupSubjectTree
                nodes={treeData.nodes}
                unassigned={treeData.unassigned}
                selectedId={selectedNode?.id}
                onSelect={handleNodeSelect}
                isLoading={isLoading}
              />
            )}
          </div>

          {/* Right: Detail Panel */}
          <div className="col-span-3 h-full">
            {isLoadingDetail ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              selectedDetail && (
                <GroupSubjectDetailPanel
                  detail={selectedDetail}
                  onClose={() => setSelectedNode(null)}
                  onDeactivate={() => setDeactivateDialogOpen(true)}
                  onReactivate={handleReactivate}
                  onAddRollup={handleOpenAddRollup}
                />
              )
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <CreateGroupSubjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        subjectClass={createSubjectClass}
        onSubmit={handleCreateSubject}
      />

      <ConfirmDeactivateDialog
        open={deactivateDialogOpen}
        onOpenChange={setDeactivateDialogOpen}
        subject={selectedDetail}
        onConfirm={handleDeactivate}
      />

      <AddRollupDialog
        open={addRollupDialogOpen}
        onOpenChange={setAddRollupDialogOpen}
        parentSubject={rollupParentSubject}
        availableSubjects={getAvailableSubjectsForRollup()}
        onSubmit={handleAddRollup}
      />
    </div>
  )
}

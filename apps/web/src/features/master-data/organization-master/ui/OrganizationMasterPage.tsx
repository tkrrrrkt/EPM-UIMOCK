'use client'

import type React from 'react'
import { useState, useEffect, useCallback } from 'react'
import type {
  BffVersionSummary,
  BffVersionDetailResponse,
  BffDepartmentTreeNode,
  BffDepartmentDetailResponse,
  BffCreateVersionRequest,
  BffCopyVersionRequest,
  BffUpdateVersionRequest,
  BffCreateDepartmentRequest,
  BffUpdateDepartmentRequest,
  BffDepartmentTreeRequest,
} from '@epm/contracts/bff/organization-master'
import { MockBffClient } from '../api/MockBffClient'
import { VersionList } from './components/VersionList'
import { DepartmentTree } from './components/DepartmentTree'
import { DepartmentDetailPanel } from './components/DepartmentDetailPanel'
import { CreateVersionDialog } from './components/CreateVersionDialog'
import { CopyVersionDialog } from './components/CopyVersionDialog'
import { EditVersionDialog } from './components/EditVersionDialog'
import { CreateDepartmentDialog } from './components/CreateDepartmentDialog'
import { getErrorMessage } from '../constants/options'
import { useToast } from '@/shared/ui'

const bffClient = new MockBffClient()

export function OrganizationMasterPage() {
  const { toast } = useToast()

  // Version state
  const [versions, setVersions] = useState<BffVersionSummary[]>([])
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null)
  const [selectedVersionDetail, setSelectedVersionDetail] = useState<BffVersionDetailResponse | null>(null)

  // Department state
  const [departmentTree, setDepartmentTree] = useState<BffDepartmentTreeNode[]>([])
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState<BffDepartmentDetailResponse | null>(null)
  const [filters, setFilters] = useState<BffDepartmentTreeRequest>({})

  // Dialog state
  const [createVersionOpen, setCreateVersionOpen] = useState(false)
  const [copyVersionOpen, setCopyVersionOpen] = useState(false)
  const [editVersionOpen, setEditVersionOpen] = useState(false)
  const [createDepartmentOpen, setCreateDepartmentOpen] = useState(false)
  const [parentNodeForCreate, setParentNodeForCreate] = useState<BffDepartmentTreeNode | null>(null)

  // Loading state
  const [loading, setLoading] = useState(false)

  // Load versions on mount
  useEffect(() => {
    loadVersions()
  }, [])

  // Load departments when version changes
  useEffect(() => {
    if (selectedVersionId) {
      loadDepartmentTree()
    } else {
      setDepartmentTree([])
      setSelectedDepartmentId(null)
      setSelectedDepartment(null)
    }
  }, [selectedVersionId, filters])

  // Load department detail when selection changes
  useEffect(() => {
    if (selectedDepartmentId) {
      loadDepartmentDetail(selectedDepartmentId)
    } else {
      setSelectedDepartment(null)
    }
  }, [selectedDepartmentId])

  const loadVersions = async () => {
    try {
      setLoading(true)
      const response = await bffClient.getVersionList({})
      setVersions(response.items)
    } catch (error) {
      toast({
        title: 'エラー',
        description: getErrorMessage(String(error)),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const loadDepartmentTree = useCallback(async () => {
    if (!selectedVersionId) return
    try {
      const response = await bffClient.getDepartmentTree(selectedVersionId, filters)
      setDepartmentTree(response.roots)
    } catch (error) {
      toast({
        title: 'エラー',
        description: getErrorMessage(String(error)),
        variant: 'destructive',
      })
    }
  }, [selectedVersionId, filters, toast])

  const loadDepartmentDetail = async (id: string) => {
    try {
      const detail = await bffClient.getDepartmentDetail(id)
      setSelectedDepartment(detail)
    } catch (error) {
      toast({
        title: 'エラー',
        description: getErrorMessage(String(error)),
        variant: 'destructive',
      })
    }
  }

  const handleSelectVersion = async (id: string) => {
    setSelectedVersionId(id)
    setSelectedDepartmentId(null)
    try {
      const detail = await bffClient.getVersionDetail(id)
      setSelectedVersionDetail(detail)
    } catch (error) {
      toast({
        title: 'エラー',
        description: getErrorMessage(String(error)),
        variant: 'destructive',
      })
    }
  }

  const handleCreateVersion = async (data: BffCreateVersionRequest) => {
    try {
      await bffClient.createVersion(data)
      await loadVersions()
      toast({
        title: '成功',
        description: 'バージョンを作成しました',
      })
    } catch (error) {
      toast({
        title: 'エラー',
        description: getErrorMessage(String(error)),
        variant: 'destructive',
      })
    }
  }

  const handleCopyVersion = async (id: string, data: BffCopyVersionRequest) => {
    try {
      await bffClient.copyVersion(id, data)
      await loadVersions()
      toast({
        title: '成功',
        description: 'バージョンをコピーしました',
      })
    } catch (error) {
      toast({
        title: 'エラー',
        description: getErrorMessage(String(error)),
        variant: 'destructive',
      })
    }
  }

  const handleUpdateVersion = async (id: string, data: BffUpdateVersionRequest) => {
    try {
      await bffClient.updateVersion(id, data)
      await loadVersions()
      if (selectedVersionId === id) {
        const detail = await bffClient.getVersionDetail(id)
        setSelectedVersionDetail(detail)
      }
      toast({
        title: '成功',
        description: 'バージョンを更新しました',
      })
    } catch (error) {
      toast({
        title: 'エラー',
        description: getErrorMessage(String(error)),
        variant: 'destructive',
      })
    }
  }

  const handleCreateDepartment = async (versionId: string, data: BffCreateDepartmentRequest) => {
    try {
      await bffClient.createDepartment(versionId, data)
      await loadDepartmentTree()
      toast({
        title: '成功',
        description: '部門を登録しました',
      })
    } catch (error) {
      toast({
        title: 'エラー',
        description: getErrorMessage(String(error)),
        variant: 'destructive',
      })
    }
  }

  const handleUpdateDepartment = async (id: string, data: BffUpdateDepartmentRequest) => {
    try {
      await bffClient.updateDepartment(id, data)
      await loadDepartmentTree()
      await loadDepartmentDetail(id)
      toast({
        title: '成功',
        description: '部門を更新しました',
      })
    } catch (error) {
      toast({
        title: 'エラー',
        description: getErrorMessage(String(error)),
        variant: 'destructive',
      })
    }
  }

  const handleMoveDepartment = async (departmentId: string, newParentId: string | null) => {
    try {
      await bffClient.moveDepartment(departmentId, { newParentId })
      await loadDepartmentTree()
      toast({
        title: '成功',
        description: '部門を移動しました',
      })
    } catch (error) {
      toast({
        title: 'エラー',
        description: getErrorMessage(String(error)),
        variant: 'destructive',
      })
    }
  }

  const handleDeactivateDepartment = async (id: string) => {
    try {
      await bffClient.deactivateDepartment(id)
      await loadDepartmentTree()
      await loadDepartmentDetail(id)
      toast({
        title: '成功',
        description: '部門を無効化しました',
      })
    } catch (error) {
      toast({
        title: 'エラー',
        description: getErrorMessage(String(error)),
        variant: 'destructive',
      })
    }
  }

  const handleReactivateDepartment = async (id: string) => {
    try {
      await bffClient.reactivateDepartment(id)
      await loadDepartmentTree()
      await loadDepartmentDetail(id)
      toast({
        title: '成功',
        description: '部門を再有効化しました',
      })
    } catch (error) {
      toast({
        title: 'エラー',
        description: getErrorMessage(String(error)),
        variant: 'destructive',
      })
    }
  }

  // 子部門追加（コンテキストメニューから）
  const handleCreateChildDepartment = (parentNode: BffDepartmentTreeNode) => {
    setParentNodeForCreate(parentNode)
    setCreateDepartmentOpen(true)
  }

  // ルート部門追加（ヘッダーボタンから）
  const handleCreateRootDepartment = () => {
    setParentNodeForCreate(null)
    setCreateDepartmentOpen(true)
  }

  // 編集（コンテキストメニューから）
  const handleEditFromContextMenu = (node: BffDepartmentTreeNode) => {
    setSelectedDepartmentId(node.id)
  }

  // 無効化（コンテキストメニューから）
  const handleDeactivateFromContextMenu = async (node: BffDepartmentTreeNode) => {
    await handleDeactivateDepartment(node.id)
  }

  // 再有効化（コンテキストメニューから）
  const handleReactivateFromContextMenu = async (node: BffDepartmentTreeNode) => {
    await handleReactivateDepartment(node.id)
  }

  const selectedVersion = versions.find((v) => v.id === selectedVersionId) || null

  return (
    <div className="flex h-full">
      {/* Version List Panel */}
      <div className="w-64 flex-shrink-0">
        <VersionList
          versions={versions}
          selectedVersionId={selectedVersionId}
          onSelectVersion={handleSelectVersion}
          onCreateVersion={() => setCreateVersionOpen(true)}
          onCopyVersion={() => setCopyVersionOpen(true)}
          onEditVersion={() => setEditVersionOpen(true)}
        />
      </div>

      {/* Department Tree Panel */}
      <div className="w-80 flex-shrink-0">
        {selectedVersionId ? (
          <DepartmentTree
            nodes={departmentTree}
            selectedId={selectedDepartmentId}
            onSelect={setSelectedDepartmentId}
            onMove={handleMoveDepartment}
            onFilterChange={setFilters}
            onCreateChild={handleCreateChildDepartment}
            onCreateRoot={handleCreateRootDepartment}
            onEdit={handleEditFromContextMenu}
            onDeactivate={handleDeactivateFromContextMenu}
            onReactivate={handleReactivateFromContextMenu}
          />
        ) : (
          <div className="flex h-full items-center justify-center border-r border-border bg-card">
            <p className="text-sm text-muted-foreground">バージョンを選択してください</p>
          </div>
        )}
      </div>

      {/* Department Detail Panel */}
      <div className="flex-1">
        <DepartmentDetailPanel
          department={selectedDepartment}
          onUpdate={handleUpdateDepartment}
          onDeactivate={handleDeactivateDepartment}
          onReactivate={handleReactivateDepartment}
        />
      </div>

      {/* Dialogs */}
      <CreateVersionDialog
        open={createVersionOpen}
        onOpenChange={setCreateVersionOpen}
        onSubmit={handleCreateVersion}
      />

      <CopyVersionDialog
        open={copyVersionOpen}
        onOpenChange={setCopyVersionOpen}
        sourceVersion={selectedVersion}
        onSubmit={handleCopyVersion}
      />

      <EditVersionDialog
        open={editVersionOpen}
        onOpenChange={setEditVersionOpen}
        version={selectedVersionDetail}
        onSubmit={handleUpdateVersion}
      />

      <CreateDepartmentDialog
        open={createDepartmentOpen}
        onOpenChange={setCreateDepartmentOpen}
        versionId={selectedVersionId}
        parentNode={parentNodeForCreate}
        onSubmit={handleCreateDepartment}
      />
    </div>
  )
}

'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button, Card, CardContent, Skeleton } from '@/shared/ui'
import { toast } from 'sonner'
import { ChevronLeft, Eye, LayoutDashboard } from 'lucide-react'
import { LayoutTree } from './layout-tree'
import { LayoutDetailPanel } from './layout-detail-panel'
import { PageDetailPanel } from './page-detail-panel'
import { ComponentDetailPanel } from './component-detail-panel'
import { CreateLayoutDialog } from './dialogs/create-layout-dialog'
import { CreatePageDialog } from './dialogs/create-page-dialog'
import { CreateComponentDialog } from './dialogs/create-component-dialog'
import { TemplateSelectDialog } from './dialogs/template-select-dialog'
import { DeleteConfirmDialog } from './dialogs/delete-confirm-dialog'
import { LayoutPreviewDialog } from './preview/layout-preview-dialog'
import { useLayouts, useTemplates } from '../hooks/use-layout-data'
import { mockBffClient } from '../api/mock-bff-client'
import { getErrorMessage } from '../lib/error-messages'
import type {
  TreeSelection,
  ReportLayoutDto,
  ReportPageDto,
  ReportComponentDto,
  CreateReportLayoutDto,
  UpdateReportLayoutDto,
  CreateReportPageDto,
  UpdateReportPageDto,
  CreateReportComponentDto,
  UpdateReportComponentDto,
  CreateLayoutFromTemplateDto,
} from '../types'

interface LayoutSettingsPageProps {
  meetingTypeId: string
  meetingTypeName?: string
}

export function LayoutSettingsPage({ meetingTypeId, meetingTypeName = '月次経営会議' }: LayoutSettingsPageProps) {
  // State
  const [selection, setSelection] = useState<TreeSelection | null>(null)
  const [expandedLayouts, setExpandedLayouts] = useState<Set<string>>(new Set())
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set())
  const [isSaving, setIsSaving] = useState(false)

  // Dialog states
  const [createLayoutOpen, setCreateLayoutOpen] = useState(false)
  const [createPageOpen, setCreatePageOpen] = useState(false)
  const [createComponentOpen, setCreateComponentOpen] = useState(false)
  const [templateSelectOpen, setTemplateSelectOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewLayout, setPreviewLayout] = useState<ReportLayoutDto | null>(null)

  // Target IDs for dialogs
  const [targetLayoutId, setTargetLayoutId] = useState<string>('')
  const [targetPageId, setTargetPageId] = useState<string>('')

  // Data fetching
  const { data: layouts, isLoading: isLoadingLayouts, refetch: refetchLayouts } = useLayouts(meetingTypeId)
  const { data: templates } = useTemplates()

  // Fetch pages for expanded layouts
  const [pagesMap, setPagesMap] = useState<Record<string, ReportPageDto[]>>({})
  const [componentsMap, setComponentsMap] = useState<Record<string, ReportComponentDto[]>>({})

  // Load pages when layouts expand
  useEffect(() => {
    const loadPages = async () => {
      for (const layoutId of expandedLayouts) {
        if (!pagesMap[layoutId]) {
          try {
            const result = await mockBffClient.getPages(layoutId)
            setPagesMap((prev) => ({
              ...prev,
              [layoutId]: result.items.sort((a, b) => a.sortOrder - b.sortOrder),
            }))
          } catch (error) {
            console.error('Failed to load pages:', error)
          }
        }
      }
    }
    loadPages()
  }, [expandedLayouts])

  // Load components when pages expand
  useEffect(() => {
    const loadComponents = async () => {
      for (const pageId of expandedPages) {
        if (!componentsMap[pageId]) {
          try {
            const result = await mockBffClient.getComponents(pageId)
            setComponentsMap((prev) => ({
              ...prev,
              [pageId]: result.items.sort((a, b) => a.sortOrder - b.sortOrder),
            }))
          } catch (error) {
            console.error('Failed to load components:', error)
          }
        }
      }
    }
    loadComponents()
  }, [expandedPages])

  // Auto-expand first layout
  useEffect(() => {
    if (layouts && layouts.length > 0 && expandedLayouts.size === 0) {
      setExpandedLayouts(new Set([layouts[0].id]))
    }
  }, [layouts])

  // Toggle handlers
  const handleToggleLayout = useCallback((layoutId: string) => {
    setExpandedLayouts((prev) => {
      const next = new Set(prev)
      if (next.has(layoutId)) {
        next.delete(layoutId)
      } else {
        next.add(layoutId)
      }
      return next
    })
  }, [])

  const handleTogglePage = useCallback((pageId: string) => {
    setExpandedPages((prev) => {
      const next = new Set(prev)
      if (next.has(pageId)) {
        next.delete(pageId)
      } else {
        next.add(pageId)
      }
      return next
    })
  }, [])

  // CRUD handlers
  const handleCreateLayout = async (data: CreateReportLayoutDto) => {
    setIsSaving(true)
    try {
      await mockBffClient.createLayout(data)
      await refetchLayouts()
      setCreateLayoutOpen(false)
      toast.success('レイアウトを作成しました')
    } catch (error: any) {
      toast.error(getErrorMessage(error.message))
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateLayout = async (data: UpdateReportLayoutDto) => {
    if (!selection || selection.type !== 'layout') return
    setIsSaving(true)
    try {
      await mockBffClient.updateLayout(selection.id, data)
      await refetchLayouts()
      toast.success('レイアウトを更新しました')
    } catch (error: any) {
      toast.error(getErrorMessage(error.message))
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreatePage = async (data: CreateReportPageDto) => {
    setIsSaving(true)
    try {
      await mockBffClient.createPage(data)
      await refetchLayouts()
      setPagesMap((prev) => ({ ...prev, [data.layoutId]: undefined as any }))
      setExpandedLayouts((prev) => new Set([...prev, data.layoutId]))
      setCreatePageOpen(false)
      toast.success('ページを作成しました')
    } catch (error: any) {
      toast.error(getErrorMessage(error.message))
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdatePage = async (data: UpdateReportPageDto) => {
    if (!selection || selection.type !== 'page' || !selection.layoutId) return
    setIsSaving(true)
    try {
      await mockBffClient.updatePage(selection.id, data)
      setPagesMap((prev) => ({ ...prev, [selection.layoutId!]: undefined as any }))
      toast.success('ページを更新しました')
    } catch (error: any) {
      toast.error(getErrorMessage(error.message))
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateComponent = async (data: CreateReportComponentDto) => {
    setIsSaving(true)
    try {
      await mockBffClient.createComponent(data)
      setComponentsMap((prev) => ({ ...prev, [data.pageId]: undefined as any }))
      setPagesMap((prev) => {
        const layoutId = Object.keys(prev).find((lid) => prev[lid]?.some((p) => p.id === data.pageId))
        if (layoutId) {
          return { ...prev, [layoutId]: undefined as any }
        }
        return prev
      })
      setExpandedPages((prev) => new Set([...prev, data.pageId]))
      setCreateComponentOpen(false)
      toast.success('コンポーネントを作成しました')
    } catch (error: any) {
      toast.error(getErrorMessage(error.message))
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateComponent = async (data: UpdateReportComponentDto) => {
    if (!selection || selection.type !== 'component' || !selection.pageId) return
    setIsSaving(true)
    try {
      await mockBffClient.updateComponent(selection.id, data)
      setComponentsMap((prev) => ({
        ...prev,
        [selection.pageId!]: undefined as any,
      }))
      toast.success('コンポーネントを更新しました')
    } catch (error: any) {
      toast.error(getErrorMessage(error.message))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selection) return
    setIsSaving(true)
    setDeleteError(null)
    try {
      switch (selection.type) {
        case 'layout':
          await mockBffClient.deleteLayout(selection.id)
          await refetchLayouts()
          break
        case 'page':
          await mockBffClient.deletePage(selection.id)
          if (selection.layoutId) {
            setPagesMap((prev) => ({
              ...prev,
              [selection.layoutId!]: undefined as any,
            }))
            await refetchLayouts()
          }
          break
        case 'component':
          await mockBffClient.deleteComponent(selection.id)
          if (selection.pageId) {
            setComponentsMap((prev) => ({
              ...prev,
              [selection.pageId!]: undefined as any,
            }))
          }
          break
      }
      setDeleteConfirmOpen(false)
      setSelection(null)
      toast.success('削除しました')
    } catch (error: any) {
      setDeleteError(getErrorMessage(error.message))
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateFromTemplate = async (data: CreateLayoutFromTemplateDto) => {
    setIsSaving(true)
    try {
      await mockBffClient.createLayoutFromTemplate(data)
      await refetchLayouts()
      setTemplateSelectOpen(false)
      toast.success('テンプレートからレイアウトを作成しました')
    } catch (error: any) {
      toast.error(getErrorMessage(error.message))
    } finally {
      setIsSaving(false)
    }
  }

  // Reorder handlers
  const handleReorderPages = async (layoutId: string, orderedIds: string[]) => {
    try {
      const result = await mockBffClient.reorderPages({ layoutId, orderedIds })
      setPagesMap((prev) => ({
        ...prev,
        [layoutId]: result.items.sort((a, b) => a.sortOrder - b.sortOrder),
      }))
    } catch (error: any) {
      toast.error(getErrorMessage(error.message))
    }
  }

  const handleReorderComponents = async (pageId: string, orderedIds: string[]) => {
    try {
      const result = await mockBffClient.reorderComponents({
        pageId,
        orderedIds,
      })
      setComponentsMap((prev) => ({
        ...prev,
        [pageId]: result.items.sort((a, b) => a.sortOrder - b.sortOrder),
      }))
    } catch (error: any) {
      toast.error(getErrorMessage(error.message))
    }
  }

  // Get selected item details
  const getSelectedLayout = (): ReportLayoutDto | null => {
    if (!selection || selection.type !== 'layout' || !layouts) return null
    return layouts.find((l) => l.id === selection.id) || null
  }

  const getSelectedPage = (): ReportPageDto | null => {
    if (!selection || selection.type !== 'page' || !selection.layoutId) return null
    const pages = pagesMap[selection.layoutId]
    if (!pages) return null
    return pages.find((p) => p.id === selection.id) || null
  }

  const getSelectedComponent = (): ReportComponentDto | null => {
    if (!selection || selection.type !== 'component' || !selection.pageId) return null
    const components = componentsMap[selection.pageId]
    if (!components) return null
    return components.find((c) => c.id === selection.id) || null
  }

  const getDeleteChildCount = (): number => {
    if (!selection) return 0
    switch (selection.type) {
      case 'layout':
        const layout = getSelectedLayout()
        return layout?.pageCount || 0
      case 'page':
        const page = getSelectedPage()
        return page?.componentCount || 0
      default:
        return 0
    }
  }

  const selectedLayout = getSelectedLayout()
  const selectedPage = getSelectedPage()
  const selectedComponent = getSelectedComponent()

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">レポートレイアウト設定</h1>
            <p className="text-sm text-muted-foreground">{meetingTypeName} のレポートレイアウトを設定してください</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            // Preview the selected layout, or the first layout if none selected
            const layoutToPreview = selectedLayout || (layouts && layouts.length > 0 ? layouts[0] : null)
            if (layoutToPreview) {
              setPreviewLayout(layoutToPreview)
              setPreviewOpen(true)
            }
          }}
          disabled={!layouts || layouts.length === 0}
        >
          <Eye className="mr-2 h-4 w-4" />
          プレビュー
        </Button>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left pane - Tree */}
        <div className="w-80 flex-shrink-0 overflow-hidden border-r border-border bg-card">
          <LayoutTree
            layouts={layouts}
            pages={pagesMap}
            components={componentsMap}
            selection={selection}
            onSelect={setSelection}
            onAddLayout={() => setCreateLayoutOpen(true)}
            onAddPage={(layoutId) => {
              setTargetLayoutId(layoutId)
              setCreatePageOpen(true)
            }}
            onAddComponent={(pageId, layoutId) => {
              setTargetPageId(pageId)
              setTargetLayoutId(layoutId)
              setCreateComponentOpen(true)
            }}
            onFromTemplate={() => setTemplateSelectOpen(true)}
            onReorderPages={handleReorderPages}
            onReorderComponents={handleReorderComponents}
            isLoading={isLoadingLayouts}
            expandedLayouts={expandedLayouts}
            expandedPages={expandedPages}
            onToggleLayout={handleToggleLayout}
            onTogglePage={handleTogglePage}
          />
        </div>

        {/* Right pane - Detail */}
        <div className="flex-1 overflow-auto bg-background p-6">
          {!selection && (
            <Card className="flex h-full items-center justify-center">
              <CardContent className="flex flex-col items-center text-center">
                <LayoutDashboard className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-medium text-foreground">アイテムを選択してください</p>
                <p className="text-sm text-muted-foreground">
                  左のツリーからレイアウト、ページ、または
                  <br />
                  コンポーネントを選択して編集できます
                </p>
              </CardContent>
            </Card>
          )}

          {selection?.type === 'layout' && selectedLayout && (
            <LayoutDetailPanel
              layout={selectedLayout}
              onSave={handleUpdateLayout}
              onDelete={() => setDeleteConfirmOpen(true)}
              onCancel={() => setSelection(null)}
              isSaving={isSaving}
            />
          )}

          {selection?.type === 'page' && selectedPage && (
            <PageDetailPanel
              page={selectedPage}
              onSave={handleUpdatePage}
              onDelete={() => setDeleteConfirmOpen(true)}
              onCancel={() => setSelection(null)}
              isSaving={isSaving}
            />
          )}

          {selection?.type === 'component' && selectedComponent && (
            <ComponentDetailPanel
              component={selectedComponent}
              onSave={handleUpdateComponent}
              onDelete={() => setDeleteConfirmOpen(true)}
              onCancel={() => setSelection(null)}
              isSaving={isSaving}
            />
          )}

          {selection && !selectedLayout && !selectedPage && !selectedComponent && (
            <Card className="flex h-full items-center justify-center">
              <CardContent>
                <Skeleton className="h-8 w-48" />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <CreateLayoutDialog
        open={createLayoutOpen}
        onOpenChange={setCreateLayoutOpen}
        onSubmit={handleCreateLayout}
        meetingTypeId={meetingTypeId}
        isLoading={isSaving}
      />

      <CreatePageDialog
        open={createPageOpen}
        onOpenChange={setCreatePageOpen}
        onSubmit={handleCreatePage}
        layoutId={targetLayoutId}
        isLoading={isSaving}
      />

      <CreateComponentDialog
        open={createComponentOpen}
        onOpenChange={setCreateComponentOpen}
        onSubmit={handleCreateComponent}
        pageId={targetPageId}
        isLoading={isSaving}
      />

      <TemplateSelectDialog
        open={templateSelectOpen}
        onOpenChange={setTemplateSelectOpen}
        onSubmit={handleCreateFromTemplate}
        templates={templates}
        meetingTypeId={meetingTypeId}
        isLoading={isSaving}
      />

      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDelete}
        itemType={selection?.type || 'layout'}
        itemName={selectedLayout?.layoutName || selectedPage?.pageName || selectedComponent?.componentName || ''}
        childCount={getDeleteChildCount()}
        isLoading={isSaving}
        error={deleteError}
      />

      <LayoutPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        layout={previewLayout}
        pagesMap={pagesMap}
        componentsMap={componentsMap}
      />
    </div>
  )
}

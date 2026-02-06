'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Button,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ScrollArea,
} from '@/shared/ui'
import { X, LayoutDashboard } from 'lucide-react'
import { ComponentPreview } from './component-preview'
import { mockBffClient } from '../../api/mock-bff-client'
import type {
  ReportLayoutDto,
  ReportPageDto,
  ReportComponentDto,
} from '@epm/contracts/bff/meetings'

interface LayoutPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  layout: ReportLayoutDto | null
  pagesMap: Record<string, ReportPageDto[]>
  componentsMap: Record<string, ReportComponentDto[]>
}

export function LayoutPreviewDialog({
  open,
  onOpenChange,
  layout,
  pagesMap,
  componentsMap,
}: LayoutPreviewDialogProps) {
  const [activePageId, setActivePageId] = useState<string | null>(null)
  const [localPagesMap, setLocalPagesMap] = useState<Record<string, ReportPageDto[]>>({})
  const [localComponentsMap, setLocalComponentsMap] = useState<Record<string, ReportComponentDto[]>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Load pages and components when dialog opens
  useEffect(() => {
    if (!open || !layout) return

    const loadData = async () => {
      setIsLoading(true)

      // Use existing data or load fresh
      let pages = pagesMap[layout.id]
      if (!pages) {
        try {
          const result = await mockBffClient.getPages(layout.id)
          pages = result.items
            .filter((p) => p.isActive)
            .sort((a, b) => a.sortOrder - b.sortOrder)
        } catch (error) {
          console.error('Failed to load pages:', error)
          pages = []
        }
      }

      setLocalPagesMap((prev) => ({ ...prev, [layout.id]: pages }))

      // Set first page as active
      if (pages.length > 0) {
        setActivePageId(pages[0].id)
      }

      // Load components for all pages
      const newComponentsMap: Record<string, ReportComponentDto[]> = {}
      for (const page of pages) {
        let components = componentsMap[page.id]
        if (!components) {
          try {
            const result = await mockBffClient.getComponents(page.id)
            components = result.items
              .filter((c) => c.isActive)
              .sort((a, b) => a.sortOrder - b.sortOrder)
          } catch (error) {
            console.error('Failed to load components:', error)
            components = []
          }
        }
        newComponentsMap[page.id] = components
      }

      setLocalComponentsMap((prev) => ({ ...prev, ...newComponentsMap }))
      setIsLoading(false)
    }

    loadData()
  }, [open, layout, pagesMap, componentsMap])

  if (!layout) return null

  const pages = localPagesMap[layout.id]?.filter((p) => p.isActive) || []
  const activeComponents = activePageId ? (localComponentsMap[activePageId] || []) : []

  const getPageTypeLabel = (pageType: string) => {
    switch (pageType) {
      case 'FIXED':
        return null
      case 'PER_DEPARTMENT':
        return '(部門別)'
      case 'PER_BU':
        return '(事業部別)'
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] h-[90vh] flex flex-col p-0 max-w-none sm:max-w-[95vw]">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg">{layout.layoutName}</DialogTitle>
              <DialogDescription>
                {layout.description || 'レポートレイアウトのプレビュー'}
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="space-y-4 w-full max-w-2xl px-8">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          ) : pages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <LayoutDashboard className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                このレイアウトにはページがありません。
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                ページを追加してからプレビューしてください。
              </p>
            </div>
          ) : (
            <Tabs
              value={activePageId || undefined}
              onValueChange={setActivePageId}
              className="flex flex-col h-full"
            >
              {/* Page tabs */}
              <div className="border-b px-6">
                <TabsList className="h-12 bg-transparent border-none p-0 gap-2">
                  {pages.map((page) => (
                    <TabsTrigger
                      key={page.id}
                      value={page.id}
                      className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-4"
                    >
                      {page.pageName}
                      {getPageTypeLabel(page.pageType) && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          {getPageTypeLabel(page.pageType)}
                        </span>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Page content */}
              {pages.map((page) => (
                <TabsContent
                  key={page.id}
                  value={page.id}
                  className="flex-1 m-0 overflow-hidden"
                >
                  <ScrollArea className="h-full">
                    <div className="p-6">
                      {localComponentsMap[page.id]?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <p className="text-muted-foreground">
                            このページにはコンポーネントがありません。
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-12 gap-4">
                          {localComponentsMap[page.id]?.map((component) => (
                            <ComponentPreview key={component.id} component={component} />
                          ))}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

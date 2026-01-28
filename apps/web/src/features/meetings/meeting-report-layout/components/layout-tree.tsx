'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Button, ScrollArea, Skeleton } from '@/shared/ui'
import { Plus, FileStack } from 'lucide-react'
import { LayoutItem } from './layout-item'
import { PageItem } from './page-item'
import { ComponentItem } from './component-item'
import type { ReportLayoutDto, ReportPageDto, ReportComponentDto, TreeSelection } from '../types'

interface LayoutTreeProps {
  layouts: ReportLayoutDto[] | undefined
  pages: Record<string, ReportPageDto[]>
  components: Record<string, ReportComponentDto[]>
  selection: TreeSelection | null
  onSelect: (selection: TreeSelection | null) => void
  onAddLayout: () => void
  onAddPage: (layoutId: string) => void
  onAddComponent: (pageId: string, layoutId: string) => void
  onFromTemplate: () => void
  onReorderPages: (layoutId: string, orderedIds: string[]) => void
  onReorderComponents: (pageId: string, orderedIds: string[]) => void
  isLoading?: boolean
  expandedLayouts: Set<string>
  expandedPages: Set<string>
  onToggleLayout: (layoutId: string) => void
  onTogglePage: (pageId: string) => void
}

export function LayoutTree({
  layouts,
  pages,
  components,
  selection,
  onSelect,
  onAddLayout,
  onAddPage,
  onAddComponent,
  onFromTemplate,
  onReorderPages,
  onReorderComponents,
  isLoading,
  expandedLayouts,
  expandedPages,
  onToggleLayout,
  onTogglePage,
}: LayoutTreeProps) {
  const [draggingType, setDraggingType] = useState<'page' | 'component' | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      if (over && active.id !== over.id) {
        const activeData = active.data.current as {
          type: 'page' | 'component'
          parentId: string
        }

        if (activeData.type === 'page') {
          const layoutId = activeData.parentId
          const layoutPages = pages[layoutId] || []
          const oldIndex = layoutPages.findIndex((p) => p.id === active.id)
          const newIndex = layoutPages.findIndex((p) => p.id === over.id)

          if (oldIndex !== -1 && newIndex !== -1) {
            const newOrder = [...layoutPages]
            const [removed] = newOrder.splice(oldIndex, 1)
            newOrder.splice(newIndex, 0, removed)
            onReorderPages(
              layoutId,
              newOrder.map((p) => p.id)
            )
          }
        } else if (activeData.type === 'component') {
          const pageId = activeData.parentId
          const pageComponents = components[pageId] || []
          const oldIndex = pageComponents.findIndex((c) => c.id === active.id)
          const newIndex = pageComponents.findIndex((c) => c.id === over.id)

          if (oldIndex !== -1 && newIndex !== -1) {
            const newOrder = [...pageComponents]
            const [removed] = newOrder.splice(oldIndex, 1)
            newOrder.splice(newIndex, 0, removed)
            onReorderComponents(
              pageId,
              newOrder.map((c) => c.id)
            )
          }
        }
      }

      setDraggingType(null)
    },
    [pages, components, onReorderPages, onReorderComponents]
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const type =
        (event.active.data.current as { type?: 'page' | 'component' } | undefined)
          ?.type ?? null
      setDraggingType(type)
    },
    []
  )

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex-1 space-y-2 p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    )
  }

  const isEmpty = !layouts || layouts.length === 0

  return (
    <div className="flex h-full flex-col border-r border-border">
      <ScrollArea className="flex-1">
        <div className="p-3">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileStack className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 text-sm font-medium text-foreground">レイアウトがありません</p>
              <p className="mb-4 text-xs text-muted-foreground">
                テンプレートから作成するか、
                <br />
                新規レイアウトを追加してください
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              onDragStart={handleDragStart}
            >
              <div className="space-y-1">
                {layouts.map((layout) => {
                  const layoutPages = pages[layout.id] || []
                  const isExpanded = expandedLayouts.has(layout.id)

                  return (
                    <div key={layout.id}>
                      <LayoutItem
                        layout={layout}
                        isSelected={selection?.type === 'layout' && selection.id === layout.id}
                        isExpanded={isExpanded}
                        onSelect={() => onSelect({ type: 'layout', id: layout.id })}
                        onToggle={() => onToggleLayout(layout.id)}
                        onAddPage={() => onAddPage(layout.id)}
                      />

                      {isExpanded && (
                        <div className="ml-4 border-l border-border pl-2">
                          <SortableContext
                            items={layoutPages.map((p) => p.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            {layoutPages.map((page) => {
                              const pageComponents = components[page.id] || []
                              const isPageExpanded = expandedPages.has(page.id)

                              return (
                                <div key={page.id}>
                                  <PageItem
                                    page={page}
                                    layoutId={layout.id}
                                    isSelected={
                                      selection?.type === 'page' && selection.id === page.id
                                    }
                                    isExpanded={isPageExpanded}
                                    onSelect={() =>
                                      onSelect({
                                        type: 'page',
                                        id: page.id,
                                        layoutId: layout.id,
                                      })
                                    }
                                    onToggle={() => onTogglePage(page.id)}
                                    onAddComponent={() => onAddComponent(page.id, layout.id)}
                                    isDragging={draggingType === 'page'}
                                  />

                                  {isPageExpanded && (
                                    <div className="ml-4 border-l border-border pl-2">
                                      <SortableContext
                                        items={pageComponents.map((c) => c.id)}
                                        strategy={verticalListSortingStrategy}
                                      >
                                        {pageComponents.map((component) => (
                                          <ComponentItem
                                            key={component.id}
                                            component={component}
                                            pageId={page.id}
                                            isSelected={
                                              selection?.type === 'component' &&
                                              selection.id === component.id
                                            }
                                            onSelect={() =>
                                              onSelect({
                                                type: 'component',
                                                id: component.id,
                                                layoutId: layout.id,
                                                pageId: page.id,
                                              })
                                            }
                                            isDragging={draggingType === 'component'}
                                          />
                                        ))}
                                      </SortableContext>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </SortableContext>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </DndContext>
          )}
        </div>
      </ScrollArea>

      <div className="space-y-2 border-t border-border p-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start bg-transparent"
          onClick={onAddLayout}
        >
          <Plus className="mr-2 h-4 w-4" />
          レイアウト追加
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start bg-transparent"
          onClick={onFromTemplate}
        >
          <FileStack className="mr-2 h-4 w-4" />
          テンプレートから作成
        </Button>
      </div>
    </div>
  )
}

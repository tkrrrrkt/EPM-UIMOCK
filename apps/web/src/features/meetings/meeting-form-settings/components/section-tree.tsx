'use client'

import { useState, useCallback, useEffect } from 'react'
import type { FormSectionDto, FormFieldDto } from '../api/bff-client'
import { mockBffClient } from '../api/mock-bff-client'
import { Button, Badge, Skeleton } from '@/shared/ui'
import { GripVertical, ChevronRight, ChevronDown, Plus, FileText } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import { FieldTypeBadge } from './shared/field-type-badge'

interface SectionTreeProps {
  meetingTypeId: string
  sections: FormSectionDto[]
  onSectionsChange: (sections: FormSectionDto[]) => void
  selectedSectionId: string | null
  selectedFieldId: string | null
  onSelectSection: (section: FormSectionDto) => void
  onSelectField: (field: FormFieldDto, section: FormSectionDto) => void
  onAddSection: () => void
  onAddField: (sectionId: string) => void
}

interface SortableSectionItemProps {
  section: FormSectionDto
  isExpanded: boolean
  isSelected: boolean
  selectedFieldId: string | null
  fields: FormFieldDto[]
  isLoadingFields: boolean
  onToggle: () => void
  onSelect: () => void
  onSelectField: (field: FormFieldDto) => void
  onAddField: () => void
  onFieldsReorder: (newFields: FormFieldDto[]) => void
}

interface SortableFieldItemProps {
  field: FormFieldDto
  isSelected: boolean
  onSelect: () => void
}

function SortableFieldItem({ field, isSelected, onSelect }: SortableFieldItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-md py-1.5 pl-8 pr-2 transition-colors',
        isSelected ? 'border-l-2 border-primary bg-primary/10' : 'hover:bg-muted',
        isDragging && 'opacity-50',
        !field.isActive && 'opacity-50'
      )}
      onClick={onSelect}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-3 w-3" />
      </button>
      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="flex-1 truncate text-sm">
        {field.fieldName}
        {field.isRequired && <span className="ml-1 text-destructive">*</span>}
      </span>
      <FieldTypeBadge type={field.fieldType} className="text-xs" />
    </div>
  )
}

function SortableSectionItem({
  section,
  isExpanded,
  isSelected,
  selectedFieldId,
  fields,
  isLoadingFields,
  onToggle,
  onSelect,
  onSelectField,
  onAddField,
  onFieldsReorder,
}: SortableSectionItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleFieldDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = fields.findIndex((f) => f.id === active.id)
    const newIndex = fields.findIndex((f) => f.id === over.id)

    onFieldsReorder(arrayMove(fields, oldIndex, newIndex))
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('rounded-lg border bg-card', isDragging && 'opacity-50')}
    >
      {/* Section Header */}
      <div
        className={cn(
          'flex cursor-pointer items-center gap-2 rounded-t-lg p-2 transition-colors',
          isSelected && !selectedFieldId
            ? 'border-l-2 border-primary bg-primary/10'
            : 'hover:bg-muted',
          !section.isActive && 'opacity-50'
        )}
        onClick={onSelect}
        onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      >
        <button
          type="button"
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation()
            onToggle()
          }}
        >
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        <span className="flex-1 truncate font-medium">
          {section.sectionName}
          {section.isRequired && <span className="ml-1 text-destructive">*</span>}
        </span>
        <Badge variant="secondary" className="text-xs">
          {section.fieldCount}
        </Badge>
        {!section.isActive && (
          <Badge variant="outline" className="text-xs text-muted-foreground">
            無効
          </Badge>
        )}
      </div>

      {/* Fields List */}
      {isExpanded && (
        <div className="border-t p-2">
          {isLoadingFields ? (
            <div className="space-y-2 pl-8">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : fields.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">項目がありません</div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleFieldDragEnd}
            >
              <SortableContext
                items={fields.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1">
                  {fields.map((field) => (
                    <SortableFieldItem
                      key={field.id}
                      field={field}
                      isSelected={selectedFieldId === field.id}
                      onSelect={() => onSelectField(field)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation()
              onAddField()
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            項目を追加
          </Button>
        </div>
      )}
    </div>
  )
}

export function SectionTree({
  meetingTypeId,
  sections,
  onSectionsChange,
  selectedSectionId,
  selectedFieldId,
  onSelectSection,
  onSelectField,
  onAddSection,
  onAddField,
}: SectionTreeProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [fieldsMap, setFieldsMap] = useState<Map<string, FormFieldDto[]>>(new Map())
  const [loadingFields, setLoadingFields] = useState<Set<string>>(new Set())

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Load fields when section is expanded
  const loadFields = useCallback(
    async (sectionId: string) => {
      if (fieldsMap.has(sectionId)) return

      setLoadingFields((prev) => new Set(prev).add(sectionId))
      try {
        const result = await mockBffClient.getFormFields(sectionId)
        setFieldsMap((prev) => new Map(prev).set(sectionId, result.items))
      } finally {
        setLoadingFields((prev) => {
          const next = new Set(prev)
          next.delete(sectionId)
          return next
        })
      }
    },
    [fieldsMap]
  )

  const handleToggleExpand = useCallback(
    (sectionId: string) => {
      setExpandedSections((prev) => {
        const next = new Set(prev)
        if (next.has(sectionId)) {
          next.delete(sectionId)
        } else {
          next.add(sectionId)
          loadFields(sectionId)
        }
        return next
      })
    },
    [loadFields]
  )

  // Auto-expand selected section
  useEffect(() => {
    if (selectedSectionId && !expandedSections.has(selectedSectionId)) {
      setExpandedSections((prev) => new Set(prev).add(selectedSectionId))
      loadFields(selectedSectionId)
    }
  }, [selectedSectionId, expandedSections, loadFields])

  const handleSectionDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sections.findIndex((s) => s.id === active.id)
    const newIndex = sections.findIndex((s) => s.id === over.id)

    const newSections = arrayMove(sections, oldIndex, newIndex)
    onSectionsChange(newSections)

    // API call
    await mockBffClient.reorderSections({
      meetingTypeId,
      orderedIds: newSections.map((s) => s.id),
    })
  }

  const handleFieldsReorder = async (sectionId: string, newFields: FormFieldDto[]) => {
    setFieldsMap((prev) => new Map(prev).set(sectionId, newFields))

    // API call
    await mockBffClient.reorderFields({
      sectionId,
      orderedIds: newFields.map((f) => f.id),
    })
  }

  // Refresh fields after changes
  const refreshFields = useCallback(async (sectionId: string) => {
    const result = await mockBffClient.getFormFields(sectionId)
    setFieldsMap((prev) => new Map(prev).set(sectionId, result.items))
  }, [])

  // Expose refresh function via event
  useEffect(() => {
    const handler = (e: CustomEvent<{ sectionId: string }>) => {
      refreshFields(e.detail.sectionId)
    }
    window.addEventListener('refreshFields' as keyof WindowEventMap, handler as EventListener)
    return () =>
      window.removeEventListener('refreshFields' as keyof WindowEventMap, handler as EventListener)
  }, [refreshFields])

  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <div className="mb-4 rounded-full bg-muted p-3">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mb-1 font-medium">セクションがありません</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          最初のセクションを作成してフォームを構成しましょう
        </p>
        <Button onClick={onAddSection}>
          <Plus className="mr-2 h-4 w-4" />
          新規作成
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleSectionDragEnd}
      >
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {sections.map((section) => (
              <SortableSectionItem
                key={section.id}
                section={section}
                isExpanded={expandedSections.has(section.id)}
                isSelected={selectedSectionId === section.id}
                selectedFieldId={selectedFieldId}
                fields={fieldsMap.get(section.id) ?? []}
                isLoadingFields={loadingFields.has(section.id)}
                onToggle={() => handleToggleExpand(section.id)}
                onSelect={() => onSelectSection(section)}
                onSelectField={(field) => onSelectField(field, section)}
                onAddField={() => onAddField(section.id)}
                onFieldsReorder={(newFields) => handleFieldsReorder(section.id, newFields)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button variant="outline" className="w-full bg-transparent" onClick={onAddSection}>
        <Plus className="mr-2 h-4 w-4" />
        セクション追加
      </Button>
    </div>
  )
}

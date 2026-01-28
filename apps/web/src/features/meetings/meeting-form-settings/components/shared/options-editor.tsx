'use client'

import { useCallback } from 'react'
import type { FieldOptionDto } from '../../api/bff-client'
import { Button, Input, Label } from '@/shared/ui'
import { GripVertical, Trash2, Plus } from 'lucide-react'
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

interface OptionsEditorProps {
  options: FieldOptionDto[]
  onChange: (options: FieldOptionDto[]) => void
  error?: string
}

interface SortableOptionItemProps {
  option: FieldOptionDto
  index: number
  onUpdate: (index: number, field: 'value' | 'label', newValue: string) => void
  onRemove: (index: number) => void
  canRemove: boolean
}

function SortableOptionItem({
  option,
  index,
  onUpdate,
  onRemove,
  canRemove,
}: SortableOptionItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `option-${index}`,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('flex items-center gap-2', isDragging && 'opacity-50')}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <Input
        value={option.value}
        onChange={(e) => onUpdate(index, 'value', e.target.value)}
        placeholder="値"
        className="flex-1"
      />
      <Input
        value={option.label}
        onChange={(e) => onUpdate(index, 'label', e.target.value)}
        placeholder="ラベル"
        className="flex-1"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onRemove(index)}
        disabled={!canRemove}
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">削除</span>
      </Button>
    </div>
  )
}

export function OptionsEditor({ options, onChange, error }: OptionsEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = Number.parseInt(String(active.id).replace('option-', ''), 10)
      const newIndex = Number.parseInt(String(over.id).replace('option-', ''), 10)

      onChange(arrayMove(options, oldIndex, newIndex))
    },
    [options, onChange]
  )

  const handleUpdate = useCallback(
    (index: number, field: 'value' | 'label', newValue: string) => {
      const newOptions = [...options]
      newOptions[index] = { ...newOptions[index], [field]: newValue }
      onChange(newOptions)
    },
    [options, onChange]
  )

  const handleRemove = useCallback(
    (index: number) => {
      const newOptions = options.filter((_, i) => i !== index)
      onChange(newOptions)
    },
    [options, onChange]
  )

  const handleAdd = useCallback(() => {
    onChange([...options, { value: '', label: '' }])
  }, [options, onChange])

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">選択肢設定</Label>

      <div className="rounded-lg border bg-background p-3">
        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-6" />
          <span className="flex-1">値（value）</span>
          <span className="flex-1">ラベル（label）</span>
          <span className="w-9" />
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={options.map((_, index) => `option-${index}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {options.map((option, index) => (
                <SortableOptionItem
                  key={`option-${index}`}
                  option={option}
                  index={index}
                  onUpdate={handleUpdate}
                  onRemove={handleRemove}
                  canRemove={options.length > 1}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          className="mt-3 w-full bg-transparent"
        >
          <Plus className="mr-2 h-4 w-4" />
          選択肢を追加
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

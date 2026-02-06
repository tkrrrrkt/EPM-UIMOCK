'use client';

/**
 * FieldPalette Component
 *
 * Displays available fields for drag-and-drop to pivot zones
 * Groups fields by category: basic, dimx, option
 *
 * Reference: .kiro/specs/reporting/multidim-analysis/design.md (Task 16.1)
 */

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { BffFieldDef, BffMeasureDef } from '@epm/contracts/bff/multidim-analysis';
import { usePivotStore } from '../store/pivot-store';
import { cn } from '@/lib/utils';

interface DraggableFieldProps {
  field: BffFieldDef | BffMeasureDef;
  type: 'field' | 'measure';
  disabled?: boolean;
}

function DraggableField({ field, type, disabled }: DraggableFieldProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: field.id,
    data: { field, type },
    disabled,
  });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'px-3 py-2 text-sm rounded-md border cursor-grab',
        'hover:bg-accent hover:border-accent-foreground/20',
        'transition-colors',
        isDragging && 'opacity-50 cursor-grabbing',
        disabled && 'opacity-40 cursor-not-allowed'
      )}
    >
      <div className="font-medium">{field.nameJa}</div>
      {'description' in field && field.description && (
        <div className="text-xs text-muted-foreground mt-0.5">{field.description}</div>
      )}
    </div>
  );
}

interface FieldCategoryProps {
  title: string;
  fields: BffFieldDef[];
  disabledFields?: Set<string>;
}

function FieldCategory({ title, fields, disabledFields }: FieldCategoryProps) {
  if (fields.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {title}
      </h4>
      <div className="space-y-1">
        {fields.map((field) => (
          <DraggableField
            key={field.id}
            field={field}
            type="field"
            disabled={disabledFields?.has(field.id)}
          />
        ))}
      </div>
    </div>
  );
}

export function FieldPalette() {
  const { availableFields, mode, rows, cols, filters } = usePivotStore();

  // Group fields by category
  const basicFields = availableFields.filter((f) => f.category === 'basic');
  const dimxFields = availableFields.filter((f) => f.category === 'dimx');
  const optionFields = availableFields.filter((f) => f.category === 'option');

  // Calculate disabled fields based on mode and DimX rules
  const disabledFields = new Set<string>();

  // DimX mutual exclusion: if one dimx is used, others are disabled
  const usedDimX = [...rows, ...cols, ...Object.keys(filters)].filter((f) =>
    f.startsWith('dim')
  );
  if (usedDimX.length > 0) {
    dimxFields.forEach((f) => {
      if (!usedDimX.includes(f.id)) {
        disabledFields.add(f.id);
      }
    });
  }

  // Mode restrictions
  if (mode === 'project') {
    dimxFields.forEach((f) => disabledFields.add(f.id));
  } else {
    optionFields
      .filter((f) => f.id === 'project')
      .forEach((f) => disabledFields.add(f.id));
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b">
        <h3 className="font-semibold">フィールド</h3>
        <p className="text-xs text-muted-foreground mt-1">
          ドラッグしてゾーンにドロップ
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <FieldCategory title="基本" fields={basicFields} disabledFields={disabledFields} />
        <FieldCategory
          title="分析軸 (DimX)"
          fields={dimxFields}
          disabledFields={disabledFields}
        />
        <FieldCategory
          title="オプション"
          fields={optionFields}
          disabledFields={disabledFields}
        />
      </div>
    </div>
  );
}

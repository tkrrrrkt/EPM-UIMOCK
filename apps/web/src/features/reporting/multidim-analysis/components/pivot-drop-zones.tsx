'use client';

/**
 * PivotDropZones Component
 *
 * Drop zones for pivot layout configuration:
 * - Rows zone
 * - Columns zone
 * - Values zone
 * - Filters zone
 *
 * Reference: .kiro/specs/reporting/multidim-analysis/design.md (Task 16.2)
 */

import { useDroppable } from '@dnd-kit/core';
import { X, GripVertical, Rows, Columns, BarChart3, Filter } from 'lucide-react';
import { usePivotStore, type DropZone } from '../store/pivot-store';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/ui';

interface DropZoneFieldProps {
  fieldId: string;
  zone: DropZone;
  label: string;
}

function DropZoneField({ fieldId, zone, label }: DropZoneFieldProps) {
  const removeFieldFromZone = usePivotStore((s) => s.removeFieldFromZone);

  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-secondary rounded text-sm">
      <GripVertical className="h-3 w-3 text-muted-foreground cursor-grab" />
      <span className="flex-1">{label}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-4 w-4 hover:bg-destructive/20"
        onClick={() => removeFieldFromZone(fieldId, zone)}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}

interface DropZoneAreaProps {
  zone: DropZone;
  title: string;
  icon: React.ReactNode;
  fields: string[];
  maxFields?: number;
}

function DropZoneArea({ zone, title, icon, fields, maxFields }: DropZoneAreaProps) {
  const { availableFields } = usePivotStore();
  const { isOver, setNodeRef } = useDroppable({
    id: zone,
    data: { zone },
  });

  const getFieldLabel = (fieldId: string) => {
    const field = availableFields.find((f) => f.id === fieldId);
    return field?.nameJa || fieldId;
  };

  const isAtLimit = maxFields !== undefined && fields.length >= maxFields;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex-1 min-h-[80px] rounded-lg border-2 border-dashed p-3',
        'transition-colors',
        isOver && !isAtLimit && 'border-primary bg-primary/5',
        isAtLimit && 'border-muted-foreground/20'
      )}
    >
      <div className="flex items-center gap-2 mb-2 text-sm font-medium text-muted-foreground">
        {icon}
        <span>{title}</span>
        {maxFields && (
          <span className="text-xs">
            ({fields.length}/{maxFields})
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1">
        {fields.length === 0 ? (
          <div className="text-xs text-muted-foreground py-2">
            フィールドをドロップ
          </div>
        ) : (
          fields.map((fieldId) => (
            <DropZoneField
              key={fieldId}
              fieldId={fieldId}
              zone={zone}
              label={getFieldLabel(fieldId)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function PivotDropZones() {
  const { rows, cols, values, filters, error } = usePivotStore();

  const filterFields = Object.keys(filters);

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-2 bg-destructive/10 text-destructive text-sm rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <DropZoneArea
          zone="rows"
          title="行"
          icon={<Rows className="h-4 w-4" />}
          fields={rows}
          maxFields={2}
        />
        <DropZoneArea
          zone="cols"
          title="列"
          icon={<Columns className="h-4 w-4" />}
          fields={cols}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <DropZoneArea
          zone="values"
          title="値"
          icon={<BarChart3 className="h-4 w-4" />}
          fields={values}
        />
        <DropZoneArea
          zone="filters"
          title="フィルター"
          icon={<Filter className="h-4 w-4" />}
          fields={filterFields}
        />
      </div>
    </div>
  );
}

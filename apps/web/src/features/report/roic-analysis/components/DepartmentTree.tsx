'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, Building2 } from 'lucide-react';
import { Button, Switch, Label, ScrollArea } from '@/shared/ui';
import { cn } from '@/lib/utils';
import type { BffRoicDepartmentNode, RoicMode } from '../types';

interface DepartmentTreeProps {
  departments: BffRoicDepartmentNode[];
  selectedDepartmentId: string;
  includeSubDepartments: boolean;
  mode: RoicMode;
  onSelectDepartment: (stableId: string) => void;
  onToggleSubDepartments: (include: boolean) => void;
  onOpenSimpleInput?: () => void;
}

function DepartmentNode({
  node,
  selectedId,
  onSelect,
  level = 0,
}: {
  node: BffRoicDepartmentNode;
  selectedId: string;
  onSelect: (stableId: string) => void;
  level?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = node.stableId === selectedId;

  return (
    <div>
      <div
        className={cn(
          'flex cursor-pointer items-center gap-1 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent',
          isSelected && 'bg-primary/10 font-medium text-primary'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelect(node.stableId)}
      >
        {hasChildren ? (
          <button
            type="button"
            className="p-0.5 hover:bg-accent"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="truncate">{node.name}</span>
        <span className="ml-auto text-xs text-muted-foreground">
          {node.code}
        </span>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {node.children?.map((child) => (
            <DepartmentNode
              key={child.id}
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function DepartmentTree({
  departments,
  selectedDepartmentId,
  includeSubDepartments,
  mode,
  onSelectDepartment,
  onToggleSubDepartments,
  onOpenSimpleInput,
}: DepartmentTreeProps) {
  const isSimplified = mode === 'SIMPLIFIED';

  return (
    <div className="flex h-full flex-col border-r border-border bg-card">
      {/* ヘッダー */}
      <div className="border-b border-border p-4">
        <h3 className="font-semibold text-foreground">部門</h3>
        <div className="mt-3 flex items-center gap-2">
          <Switch
            id="include-sub"
            checked={includeSubDepartments}
            onCheckedChange={onToggleSubDepartments}
          />
          <Label htmlFor="include-sub" className="text-sm">
            配下集約
          </Label>
        </div>
      </div>

      {/* ツリー */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {departments.map((dept) => (
            <DepartmentNode
              key={dept.id}
              node={dept}
              selectedId={selectedDepartmentId}
              onSelect={onSelectDepartment}
            />
          ))}
        </div>
      </ScrollArea>

      {/* 簡易入力ボタン（簡易モード時のみ） */}
      {isSimplified && onOpenSimpleInput && (
        <div className="border-t border-border p-4">
          <Button
            variant="outline"
            className="w-full bg-transparent"
            onClick={onOpenSimpleInput}
            disabled={includeSubDepartments}
          >
            簡易入力
          </Button>
          {includeSubDepartments && (
            <p className="mt-2 text-xs text-muted-foreground">
              配下集約時は入力できません
            </p>
          )}
        </div>
      )}
    </div>
  );
}

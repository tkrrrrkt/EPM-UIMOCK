'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea, Switch, Label, Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui';
import type { BffCvpDepartmentNode } from '../types';

interface DepartmentTreeProps {
  departments: BffCvpDepartmentNode[];
  selectedStableId: string | null;
  includeSubDepartments: boolean;
  onSelect: (stableId: string) => void;
  onIncludeSubDepartmentsChange: (value: boolean) => void;
}

export function DepartmentTree({
  departments,
  selectedStableId,
  includeSubDepartments,
  onSelect,
  onIncludeSubDepartmentsChange,
}: DepartmentTreeProps) {
  return (
    <div className="flex flex-col h-full border rounded-lg bg-card">
      <div className="p-3 border-b">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">部門選択</span>
          <div className="flex items-center gap-2">
            <Label htmlFor="include-sub" className="text-xs text-muted-foreground">
              配下集約
            </Label>
            <Switch
              id="include-sub"
              checked={includeSubDepartments}
              onCheckedChange={onIncludeSubDepartmentsChange}
            />
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-0.5">
          {departments.map((node) => (
            <DepartmentNode
              key={node.id}
              node={node}
              selectedStableId={selectedStableId}
              onSelect={onSelect}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

interface DepartmentNodeProps {
  node: BffCvpDepartmentNode;
  selectedStableId: string | null;
  onSelect: (stableId: string) => void;
  depth?: number;
}

function DepartmentNode({ node, selectedStableId, onSelect, depth = 0 }: DepartmentNodeProps) {
  const [isOpen, setIsOpen] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedStableId === node.stableId;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div
        className={cn(
          'flex items-center gap-1 rounded-md px-2 py-1.5 cursor-pointer transition-colors',
          isSelected
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-accent hover:text-accent-foreground'
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => onSelect(node.stableId)}
      >
        {hasChildren ? (
          <CollapsibleTrigger
            asChild
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <button type="button" className="p-0.5 rounded hover:bg-primary/20">
              {isOpen ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>
          </CollapsibleTrigger>
        ) : (
          <span className="w-4" />
        )}
        <Building2 className="h-3.5 w-3.5 shrink-0" />
        <span className="text-sm truncate">{node.name}</span>
        <span className={cn(
          'text-xs ml-auto',
          isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'
        )}>
          {node.code}
        </span>
      </div>
      {hasChildren && (
        <CollapsibleContent>
          <div className="space-y-0.5">
            {node.children!.map((child) => (
              <DepartmentNode
                key={child.id}
                node={child}
                selectedStableId={selectedStableId}
                onSelect={onSelect}
                depth={depth + 1}
              />
            ))}
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}

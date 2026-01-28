'use client'

import { useState } from 'react'
import { Badge, Button, Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui'
import {
  ChevronDown,
  ChevronRight,
  GanttChart,
  KanbanSquare,
  ClipboardList,
  Building2,
  User,
} from 'lucide-react'
import type { BffKpiTreeNode, BffActionPlanSummary } from '../lib/types'
import { getAchievementBadgeVariant, getKpiTypeLabel } from '../lib/types'
import { cn } from '@/lib/utils'

interface KpiTreeViewProps {
  kpiTree: BffKpiTreeNode[]
  onSelectKpi: (kpiId: string) => void
  selectedKpiId?: string
}

export function KpiTreeView({ kpiTree, onSelectKpi, selectedKpiId }: KpiTreeViewProps) {
  return (
    <div className="space-y-2">
      {kpiTree.map((node) => (
        <KpiTreeNode
          key={node.id}
          node={node}
          level={0}
          onSelectKpi={onSelectKpi}
          selectedKpiId={selectedKpiId}
        />
      ))}
    </div>
  )
}

interface KpiTreeNodeProps {
  node: BffKpiTreeNode
  level: number
  onSelectKpi: (kpiId: string) => void
  selectedKpiId?: string
}

function KpiTreeNode({ node, level, onSelectKpi, selectedKpiId }: KpiTreeNodeProps) {
  const [isOpen, setIsOpen] = useState(true)
  const hasChildren = node.children.length > 0 || node.actionPlans.length > 0
  const isSelected = selectedKpiId === node.id
  const badgeVariant = getAchievementBadgeVariant(node.achievementRate)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div
        className={cn(
          'group rounded-lg border border-transparent transition-all',
          isSelected && 'border-primary/50 bg-primary/5',
          !isSelected && 'hover:border-border/50 hover:bg-muted/30'
        )}
      >
        <CollapsibleTrigger asChild>
          <div
            className={cn(
              'flex cursor-pointer items-center gap-3 px-4 py-3',
              level > 0 && 'ml-6 border-l border-border/30'
            )}
            onClick={() => onSelectKpi(node.id)}
          >
            {hasChildren ? (
              <div className="flex h-5 w-5 items-center justify-center text-muted-foreground">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            ) : (
              <div className="w-5" />
            )}

            <div className="flex flex-1 items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    {node.kpiName}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {node.hierarchyLevel === 1 ? 'KGI' : 'KPI'}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {getKpiTypeLabel(node.kpiType)}
                  </Badge>
                </div>
                <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                  {node.departmentName && (
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {node.departmentName}
                    </span>
                  )}
                  {node.ownerEmployeeName && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {node.ownerEmployeeName}
                    </span>
                  )}
                  {node.unit && (
                    <span className="text-muted-foreground/60">
                      単位: {node.unit}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {node.achievementRate !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">達成率</span>
                    <Badge
                      className={cn(
                        'min-w-[60px] justify-center',
                        badgeVariant === 'success' && 'bg-success text-success-foreground',
                        badgeVariant === 'warning' && 'bg-warning text-warning-foreground',
                        badgeVariant === 'destructive' && 'bg-destructive text-destructive-foreground'
                      )}
                    >
                      {node.achievementRate}%
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          {node.children.length > 0 && (
            <div className="space-y-1 pb-2">
              {node.children.map((child) => (
                <KpiTreeNode
                  key={child.id}
                  node={child}
                  level={level + 1}
                  onSelectKpi={onSelectKpi}
                  selectedKpiId={selectedKpiId}
                />
              ))}
            </div>
          )}

          {node.actionPlans.length > 0 && (
            <div className="ml-11 space-y-1 pb-3">
              {node.actionPlans.map((ap) => (
                <ActionPlanItem key={ap.id} actionPlan={ap} />
              ))}
            </div>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

interface ActionPlanItemProps {
  actionPlan: BffActionPlanSummary
}

function ActionPlanItem({ actionPlan }: ActionPlanItemProps) {
  return (
    <div
      className={cn(
        'ml-6 flex items-center gap-3 rounded-md border border-border/30 bg-muted/20 px-4 py-2.5',
        actionPlan.isDelayed && 'border-destructive/30 bg-destructive/5'
      )}
    >
      <ClipboardList className="h-4 w-4 text-muted-foreground" />
      <div className="flex flex-1 items-center gap-4">
        <span className="text-sm text-foreground">{actionPlan.planName}</span>
        {actionPlan.departmentName && (
          <span className="text-xs text-muted-foreground">
            {actionPlan.departmentName}
          </span>
        )}
        {actionPlan.dueDate && (
          <span
            className={cn(
              'text-xs',
              actionPlan.isDelayed ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            期限: {new Date(actionPlan.dueDate).toLocaleDateString('ja-JP')}
          </span>
        )}
        <Badge
          variant="outline"
          className={cn(
            'text-xs',
            actionPlan.progressRate >= 80 && 'border-success/50 text-success',
            actionPlan.progressRate >= 50 && actionPlan.progressRate < 80 && 'border-warning/50 text-warning',
            actionPlan.progressRate < 50 && 'border-muted-foreground/50 text-muted-foreground'
          )}
        >
          進捗 {actionPlan.progressRate}%
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1 px-2 text-xs bg-transparent"
          onClick={(e) => {
            e.stopPropagation()
            window.location.href = `/kpi/wbs/${actionPlan.id}`
          }}
        >
          <GanttChart className="h-3 w-3" />
          WBS
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1 px-2 text-xs bg-transparent"
          onClick={(e) => {
            e.stopPropagation()
            window.location.href = `/kpi/kanban/${actionPlan.id}`
          }}
        >
          <KanbanSquare className="h-3 w-3" />
          かんばん
        </Button>
      </div>
    </div>
  )
}

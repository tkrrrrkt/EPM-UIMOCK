"use client"

import { ChevronRight, Edit, Trash2 } from "lucide-react"
import { Button, Badge } from "@/shared/ui"
import { cn } from "@/lib/utils"
import type { BffStrategyThemeSummary, MtpEventStatus } from "@epm/contracts/bff/mtp"

interface StrategyThemeTreeProps {
  themes: BffStrategyThemeSummary[]
  eventStatus: MtpEventStatus
  onEdit: (theme: BffStrategyThemeSummary) => void
  onDelete: (themeId: string) => void
}

export function StrategyThemeTree({ themes, eventStatus, onEdit, onDelete }: StrategyThemeTreeProps) {
  const isReadOnly = eventStatus === "CONFIRMED"

  return (
    <div className="space-y-4">
      {themes.map((theme) => (
        <ThemeNode key={theme.id} theme={theme} isReadOnly={isReadOnly} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}

interface ThemeNodeProps {
  theme: BffStrategyThemeSummary
  isReadOnly: boolean
  onEdit: (theme: BffStrategyThemeSummary) => void
  onDelete: (themeId: string) => void
  level?: number
}

function ThemeNode({ theme, isReadOnly, onEdit, onDelete, level = 0 }: ThemeNodeProps) {
  return (
    <div className={cn("space-y-2", level > 0 && "ml-8")}>
      <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
        {level > 0 && (
          <div className="mt-1 flex-shrink-0">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        )}

        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{theme.themeName}</h4>
                {theme.strategyCategory && <Badge variant="outline">{theme.strategyCategory}</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">
                コード: {theme.themeCode}
                {theme.dimensionValueName && ` | ${theme.dimensionValueName}`}
              </p>
            </div>

            {!isReadOnly && (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => onEdit(theme)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(theme.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            )}
          </div>

          {(theme.ownerName || theme.targetDate || theme.kpis.length > 0) && (
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {theme.ownerName && <span>責任者: {theme.ownerName}</span>}
              {theme.targetDate && <span>期限: {new Date(theme.targetDate).toLocaleDateString("ja-JP")}</span>}
              {theme.kpis.length > 0 && (
                <div className="flex items-center gap-1">
                  <span>KPI:</span>
                  <div className="flex flex-wrap gap-1">
                    {theme.kpis.map((kpi) => (
                      <Badge key={kpi.subjectId} variant="secondary" className="text-xs">
                        {kpi.subjectName}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {theme.children.length > 0 && (
        <div className="space-y-2">
          {theme.children.map((child) => (
            <ThemeNode
              key={child.id}
              theme={child}
              isReadOnly={isReadOnly}
              onEdit={onEdit}
              onDelete={onDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

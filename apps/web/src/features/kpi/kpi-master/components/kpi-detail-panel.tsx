'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui'
import {
  X,
  Pencil,
  Plus,
  Check,
  LayoutGrid,
  Kanban,
  Building2,
  User,
} from 'lucide-react'
import type { BffKpiDetail, BffFactAmount } from '../lib/types'
import { getAchievementBadgeVariant, getKpiTypeLabel } from '../lib/types'
import { cn } from '@/lib/utils'

interface KpiDetailPanelProps {
  kpiDetail: BffKpiDetail
  onClose: () => void
  onAddPeriod: () => void
  onAddActionPlan: () => void
  onUpdateFactAmount: (factId: string, target?: number, actual?: number) => void
}

export function KpiDetailPanel({
  kpiDetail,
  onClose,
  onAddPeriod,
  onAddActionPlan,
  onUpdateFactAmount,
}: KpiDetailPanelProps) {
  const [editingFactId, setEditingFactId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{
    target?: number
    actual?: number
  }>({})

  const handleStartEdit = (fact: BffFactAmount) => {
    setEditingFactId(fact.id)
    setEditValues({
      target: fact.targetValue,
      actual: fact.actualValue,
    })
  }

  const handleSaveEdit = (factId: string) => {
    onUpdateFactAmount(factId, editValues.target, editValues.actual)
    setEditingFactId(null)
    setEditValues({})
  }

  const handleCancelEdit = () => {
    setEditingFactId(null)
    setEditValues({})
  }

  return (
    <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl">{kpiDetail.kpiName}</CardTitle>
            <Badge variant="outline" className="text-xs">
              {getKpiTypeLabel(kpiDetail.kpiType)}
            </Badge>
          </div>
          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
            {kpiDetail.departmentName && (
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                責任部門: {kpiDetail.departmentName}
              </span>
            )}
            {kpiDetail.ownerEmployeeName && (
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                責任者: {kpiDetail.ownerEmployeeName}
              </span>
            )}
            {kpiDetail.unit && (
              <span>単位: {kpiDetail.unit}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="mr-1 h-4 w-4" />
            閉じる
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Target/Actual Table */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">目標・実績</h3>
            <Button variant="outline" size="sm" onClick={onAddPeriod}>
              <Plus className="mr-1 h-4 w-4" />
              期間追加
            </Button>
          </div>
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-24">期間</TableHead>
                  <TableHead className="text-right">目標</TableHead>
                  <TableHead className="text-right">実績</TableHead>
                  <TableHead className="text-center">達成率</TableHead>
                  <TableHead className="w-20 text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kpiDetail.factAmounts.map((fact) => {
                  const isEditing = editingFactId === fact.id
                  const badgeVariant = getAchievementBadgeVariant(fact.achievementRate)

                  return (
                    <TableRow key={fact.id} className="hover:bg-muted/10">
                      <TableCell className="font-medium">
                        {fact.periodCode}
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editValues.target ?? ''}
                            onChange={(e) =>
                              setEditValues((prev) => ({
                                ...prev,
                                target: e.target.value ? Number(e.target.value) : undefined,
                              }))
                            }
                            className="h-8 w-24 text-right ml-auto"
                          />
                        ) : (
                          fact.targetValue?.toLocaleString() ?? '-'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editValues.actual ?? ''}
                            onChange={(e) =>
                              setEditValues((prev) => ({
                                ...prev,
                                actual: e.target.value ? Number(e.target.value) : undefined,
                              }))
                            }
                            className="h-8 w-24 text-right ml-auto"
                          />
                        ) : (
                          fact.actualValue?.toLocaleString() ?? '-'
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {fact.achievementRate !== undefined ? (
                          <Badge
                            className={cn(
                              'min-w-[60px] justify-center',
                              badgeVariant === 'success' && 'bg-success text-success-foreground',
                              badgeVariant === 'warning' && 'bg-warning text-warning-foreground',
                              badgeVariant === 'destructive' && 'bg-destructive text-destructive-foreground'
                            )}
                          >
                            {fact.achievementRate}%
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => handleSaveEdit(fact.id)}
                            >
                              <Check className="h-4 w-4 text-success" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={handleCancelEdit}
                            >
                              <X className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleStartEdit(fact)}
                          >
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Action Plans */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">アクションプラン</h3>
            <Button variant="outline" size="sm" onClick={onAddActionPlan}>
              <Plus className="mr-1 h-4 w-4" />
              AP追加
            </Button>
          </div>
          {kpiDetail.actionPlans.length > 0 ? (
            <div className="rounded-lg border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead>プラン名</TableHead>
                    <TableHead>担当</TableHead>
                    <TableHead>期限</TableHead>
                    <TableHead className="text-center">進捗</TableHead>
                    <TableHead className="text-right">クイック操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kpiDetail.actionPlans.map((ap) => (
                    <TableRow
                      key={ap.id}
                      className={cn(
                        'hover:bg-muted/10',
                        ap.isDelayed && 'bg-destructive/5'
                      )}
                    >
                      <TableCell className="font-medium">{ap.planName}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {ap.departmentName}
                        {ap.ownerEmployeeName && ` / ${ap.ownerEmployeeName}`}
                      </TableCell>
                      <TableCell
                        className={cn(
                          ap.isDelayed ? 'text-destructive' : 'text-muted-foreground'
                        )}
                      >
                        {ap.dueDate
                          ? new Date(ap.dueDate).toLocaleDateString('ja-JP')
                          : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs',
                            ap.progressRate >= 80 && 'border-success/50 text-success',
                            ap.progressRate >= 50 && ap.progressRate < 80 && 'border-warning/50 text-warning',
                            ap.progressRate < 50 && 'border-muted-foreground/50'
                          )}
                        >
                          {ap.progressRate}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 gap-1 px-2 text-xs bg-transparent"
                            onClick={() =>
                              (window.location.href = `/kpi/gantt/${ap.id}`)
                            }
                          >
                            <LayoutGrid className="h-3 w-3" />
                            WBS
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 gap-1 px-2 text-xs bg-transparent"
                            onClick={() =>
                              (window.location.href = `/kpi/kanban/${ap.id}`)
                            }
                          >
                            <Kanban className="h-3 w-3" />
                            かんばん
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border/50 p-8 text-center text-muted-foreground">
              アクションプランが登録されていません
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

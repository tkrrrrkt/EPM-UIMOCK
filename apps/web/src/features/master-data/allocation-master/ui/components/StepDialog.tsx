'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Alert,
  AlertDescription,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
} from '@/shared/ui'
import type {
  DriverType,
  DriverSourceType,
  TargetType,
  BffAllocationStepResponse,
  BffAllocationTargetResponse,
} from '@epm/contracts/bff/allocation-master'
import {
  DRIVER_TYPE_LABELS,
  DRIVER_SOURCE_TYPE_LABELS,
  TARGET_TYPE_LABELS,
  getErrorMessage,
} from '../constants'
import { bffClient } from '../api'

interface StepDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  step: BffAllocationStepResponse | null
  onSuccess: () => void
}

export function StepDialog({ open, onOpenChange, eventId, step, onSuccess }: StepDialogProps) {
  const isEditMode = !!step
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step form state
  const [stepName, setStepName] = useState('')
  const [fromSubjectId, setFromSubjectId] = useState('')
  const [fromDepartmentStableId, setFromDepartmentStableId] = useState('')
  const [driverType, setDriverType] = useState<DriverType>('FIXED')
  const [driverSourceType, setDriverSourceType] = useState<DriverSourceType>('MASTER')
  const [driverRefId, setDriverRefId] = useState('')
  const [notes, setNotes] = useState('')

  // Targets state
  const [targets, setTargets] = useState<BffAllocationTargetResponse[]>([])

  // Local targets for create mode (not yet saved)
  interface LocalTarget {
    localId: string
    targetType: TargetType
    targetId: string
    targetName: string
    toSubjectId: string
    toSubjectName: string
    fixedRatio: string
  }
  const [localTargets, setLocalTargets] = useState<LocalTarget[]>([])

  // Target form state
  const [showTargetForm, setShowTargetForm] = useState(false)
  const [targetType, setTargetType] = useState<TargetType>('DEPARTMENT')
  const [targetId, setTargetId] = useState('')
  const [targetName, setTargetName] = useState('')
  const [toSubjectId, setToSubjectId] = useState('')
  const [toSubjectName, setToSubjectName] = useState('')
  const [fixedRatio, setFixedRatio] = useState('')

  useEffect(() => {
    if (open && step) {
      // Edit mode - populate form
      setStepName(step.stepName)
      setFromSubjectId(step.fromSubjectId)
      setFromDepartmentStableId(step.fromDepartmentStableId)
      setDriverType(step.driverType)
      setDriverSourceType(step.driverSourceType)
      setDriverRefId(step.driverRefId || '')
      setNotes(step.notes || '')
      setTargets(step.targets)
    } else if (open) {
      // Create mode - reset form
      resetForm()
    }
  }, [open, step])

  const resetForm = () => {
    setStepName('')
    setFromSubjectId('')
    setFromDepartmentStableId('')
    setDriverType('FIXED')
    setDriverSourceType('MASTER')
    setDriverRefId('')
    setNotes('')
    setTargets([])
    setLocalTargets([])
    setError(null)
    resetTargetForm()
  }

  const resetTargetForm = () => {
    setShowTargetForm(false)
    setTargetType('DEPARTMENT')
    setTargetId('')
    setTargetName('')
    setToSubjectId('')
    setToSubjectName('')
    setFixedRatio('')
  }

  const handleSubmit = async () => {
    setError(null)

    if (!stepName.trim()) {
      setError('ステップ名を入力してください')
      return
    }
    if (!fromSubjectId.trim()) {
      setError('配賦元科目IDを入力してください')
      return
    }
    if (!fromDepartmentStableId.trim()) {
      setError('配賦元部門IDを入力してください')
      return
    }

    setLoading(true)
    try {
      if (isEditMode && step) {
        // Update step
        await bffClient.updateStep(eventId, step.id, {
          stepName: stepName.trim(),
          fromSubjectId: fromSubjectId.trim(),
          fromDepartmentStableId: fromDepartmentStableId.trim(),
          driverType,
          driverSourceType,
          driverRefId: driverRefId.trim() || undefined,
          notes: notes.trim() || undefined,
        })
      } else {
        // Create step
        await bffClient.createStep(eventId, {
          stepName: stepName.trim(),
          fromSubjectId: fromSubjectId.trim(),
          fromDepartmentStableId: fromDepartmentStableId.trim(),
          driverType,
          driverSourceType,
          driverRefId: driverRefId.trim() || undefined,
          notes: notes.trim() || undefined,
        })
      }
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(getErrorMessage(message))
    } finally {
      setLoading(false)
    }
  }

  const handleAddLocalTarget = () => {
    if (!targetId.trim()) {
      setError('配賦先部門IDを入力してください')
      return
    }

    if (driverType === 'FIXED' && fixedRatio) {
      const ratio = parseFloat(fixedRatio)
      if (isNaN(ratio) || ratio < 0 || ratio > 1) {
        setError('固定比率は0〜1の範囲で入力してください')
        return
      }
    }

    const newTarget: LocalTarget = {
      localId: `local-${Date.now()}`,
      targetType,
      targetId: targetId.trim(),
      targetName: targetName.trim() || targetId.trim(),
      toSubjectId: toSubjectId.trim(),
      toSubjectName: toSubjectName.trim(),
      fixedRatio: fixedRatio.trim(),
    }

    setLocalTargets([...localTargets, newTarget])
    resetTargetForm()
    setError(null)
  }

  const handleRemoveLocalTarget = (localId: string) => {
    setLocalTargets(localTargets.filter((t) => t.localId !== localId))
  }

  const handleAddTarget = async () => {
    if (!step) return

    if (!targetId.trim()) {
      setError('配賦先部門IDを入力してください')
      return
    }

    if (driverType === 'FIXED' && fixedRatio) {
      const ratio = parseFloat(fixedRatio)
      if (isNaN(ratio) || ratio < 0 || ratio > 1) {
        setError('固定比率は0〜1の範囲で入力してください')
        return
      }
    }

    setLoading(true)
    try {
      await bffClient.createTarget(eventId, step.id, {
        targetType,
        targetId: targetId.trim(),
        toSubjectId: toSubjectId.trim() || undefined,
        fixedRatio: fixedRatio.trim() || undefined,
        isActive: true,
      })
      // Reload step data
      const detail = await bffClient.getEventDetail(eventId)
      const updatedStep = detail.steps.find((s) => s.id === step.id)
      if (updatedStep) {
        setTargets(updatedStep.targets)
      }
      resetTargetForm()
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(getErrorMessage(message))
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTarget = async (targetId: string) => {
    if (!step) return

    if (!confirm('このターゲットを削除しますか？')) return

    setLoading(true)
    try {
      await bffClient.deleteTarget(eventId, step.id, targetId)
      setTargets(targets.filter((t) => t.id !== targetId))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(getErrorMessage(message))
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm()
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="!max-w-[70vw] !w-[70vw] min-h-[70vh] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'ステップ編集' : 'ステップ新規作成'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'ステップの設定とターゲットを編集します'
              : '新しいステップを作成します'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Step basic info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stepName">
                ステップ名 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="stepName"
                value={stepName}
                onChange={(e) => setStepName(e.target.value)}
                placeholder="例: 本社経費 → 各事業部"
                maxLength={200}
              />
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromSubjectId">
                  配賦元科目ID <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fromSubjectId"
                  value={fromSubjectId}
                  onChange={(e) => setFromSubjectId(e.target.value)}
                  placeholder="科目ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fromDepartmentStableId">
                  配賦元部門ID <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fromDepartmentStableId"
                  value={fromDepartmentStableId}
                  onChange={(e) => setFromDepartmentStableId(e.target.value)}
                  placeholder="部門Stable ID"
                />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="driverType">
                  ドライバタイプ <span className="text-destructive">*</span>
                </Label>
                <Select value={driverType} onValueChange={(v) => setDriverType(v as DriverType)}>
                  <SelectTrigger id="driverType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DRIVER_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="driverSourceType">
                  ソースタイプ <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={driverSourceType}
                  onValueChange={(v) => setDriverSourceType(v as DriverSourceType)}
                >
                  <SelectTrigger id="driverSourceType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DRIVER_SOURCE_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {driverType !== 'FIXED' && (
              <div className="space-y-2">
                <Label htmlFor="driverRefId">ドライバ参照ID</Label>
                <Input
                  id="driverRefId"
                  value={driverRefId}
                  onChange={(e) => setDriverRefId(e.target.value)}
                  placeholder="ドライバマスタのID"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">備考</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* Targets section - show in both create and edit mode */}
          <Separator />
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">
                配賦先設定（複数設定可）
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowTargetForm(!showTargetForm)}
              >
                <Plus className="mr-1 h-4 w-4" />
                配賦先追加
              </Button>
            </CardHeader>
            <CardContent>
              {showTargetForm && (
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg mb-4">
                  <h4 className="text-sm font-medium">配賦先を追加</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>配賦先タイプ</Label>
                      <Select
                        value={targetType}
                        onValueChange={(v) => setTargetType(v as TargetType)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(TARGET_TYPE_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>
                        配賦先部門ID <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        value={targetId}
                        onChange={(e) => setTargetId(e.target.value)}
                        placeholder={
                          targetType === 'DEPARTMENT' ? '部門Stable ID' : 'ディメンション値ID'
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>配賦先部門名（表示用）</Label>
                      <Input
                        value={targetName}
                        onChange={(e) => setTargetName(e.target.value)}
                        placeholder="例: 営業部"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>配賦先科目ID</Label>
                      <Input
                        value={toSubjectId}
                        onChange={(e) => setToSubjectId(e.target.value)}
                        placeholder="空=配賦元科目と同じ"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>配賦先科目名（表示用）</Label>
                      <Input
                        value={toSubjectName}
                        onChange={(e) => setToSubjectName(e.target.value)}
                        placeholder="例: 人件費"
                      />
                    </div>
                    {driverType === 'FIXED' && (
                      <div className="space-y-2">
                        <Label>固定比率</Label>
                        <Input
                          value={fixedRatio}
                          onChange={(e) => setFixedRatio(e.target.value)}
                          placeholder="0.25 等 (0〜1)"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={resetTargetForm}>
                      キャンセル
                    </Button>
                    <Button
                      size="sm"
                      onClick={isEditMode ? handleAddTarget : handleAddLocalTarget}
                      disabled={loading}
                    >
                      追加
                    </Button>
                  </div>
                </div>
              )}

              {/* Show local targets in create mode */}
              {!isEditMode && localTargets.length === 0 && (
                <div className="py-4 text-center text-muted-foreground text-sm">
                  配賦先がありません。「配賦先追加」ボタンから追加してください。
                </div>
              )}

              {!isEditMode && localTargets.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>タイプ</TableHead>
                      <TableHead>配賦先部門</TableHead>
                      <TableHead>配賦先科目</TableHead>
                      <TableHead>比率</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {localTargets.map((target) => (
                      <TableRow key={target.localId}>
                        <TableCell>
                          <Badge variant="outline">
                            {TARGET_TYPE_LABELS[target.targetType]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{target.targetName}</div>
                            <div className="text-muted-foreground text-xs">{target.targetId}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {target.toSubjectName || target.toSubjectId || (
                            <span className="text-muted-foreground">配賦元と同じ</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {target.fixedRatio ? (
                            <Badge variant="secondary">
                              {(parseFloat(target.fixedRatio) * 100).toFixed(1)}%
                            </Badge>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleRemoveLocalTarget(target.localId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Show saved targets in edit mode */}
              {isEditMode && targets.length === 0 && (
                <div className="py-4 text-center text-muted-foreground text-sm">
                  配賦先がありません。「配賦先追加」ボタンから追加してください。
                </div>
              )}

              {isEditMode && targets.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>タイプ</TableHead>
                      <TableHead>配賦先部門</TableHead>
                      <TableHead>配賦先科目</TableHead>
                      <TableHead>比率</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {targets.map((target) => (
                      <TableRow key={target.id}>
                        <TableCell>
                          <Badge variant="outline">
                            {TARGET_TYPE_LABELS[target.targetType]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{target.targetName}</div>
                            <div className="text-muted-foreground text-xs">{target.targetId}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {target.toSubjectName || (
                            <span className="text-muted-foreground">配賦元と同じ</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {target.fixedRatio ? (
                            <Badge variant="secondary">
                              {(parseFloat(target.fixedRatio) * 100).toFixed(1)}%
                            </Badge>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteTarget(target.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? '保存中...' : isEditMode ? '保存' : '作成'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

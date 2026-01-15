'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash2, Edit2 } from 'lucide-react'
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
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
  Switch,
} from '@/shared/ui'
import type {
  ScenarioType,
  BffAllocationEventDetailResponse,
  BffAllocationStepResponse,
} from '@epm/contracts/bff/allocation-master'
import {
  SCENARIO_TYPE_LABELS,
  DRIVER_TYPE_LABELS,
  DRIVER_SOURCE_TYPE_LABELS,
  getErrorMessage,
} from '../constants'
import { bffClient } from '../api'
import { StepDialog } from './StepDialog'

interface AllocationEventDetailDialogProps {
  eventId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AllocationEventDetailDialog({
  eventId,
  open,
  onOpenChange,
  onSuccess,
}: AllocationEventDetailDialogProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [event, setEvent] = useState<BffAllocationEventDetailResponse | null>(null)

  // Event form state
  const [eventCode, setEventCode] = useState('')
  const [eventName, setEventName] = useState('')
  const [scenarioType, setScenarioType] = useState<ScenarioType>('ACTUAL')
  const [isActive, setIsActive] = useState(true)
  const [notes, setNotes] = useState('')

  // Step dialog state
  const [stepDialogOpen, setStepDialogOpen] = useState(false)
  const [selectedStep, setSelectedStep] = useState<BffAllocationStepResponse | null>(null)

  useEffect(() => {
    if (open && eventId) {
      loadEvent()
    }
  }, [open, eventId])

  const loadEvent = async () => {
    if (!eventId) return

    setLoading(true)
    setError(null)
    try {
      const detail = await bffClient.getEventDetail(eventId)
      setEvent(detail)
      setEventCode(detail.eventCode)
      setEventName(detail.eventName)
      setScenarioType(detail.scenarioType)
      setIsActive(detail.isActive)
      setNotes(detail.notes || '')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(getErrorMessage(message))
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!eventId || !event) return

    setError(null)

    if (!eventCode.trim()) {
      setError('イベントコードを入力してください')
      return
    }
    if (!eventName.trim()) {
      setError('イベント名を入力してください')
      return
    }

    setSaving(true)
    try {
      await bffClient.updateEvent(eventId, {
        eventCode: eventCode.trim(),
        eventName: eventName.trim(),
        scenarioType,
        isActive,
        notes: notes.trim() || undefined,
      })
      loadEvent()
      onSuccess()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(getErrorMessage(message))
    } finally {
      setSaving(false)
    }
  }

  const handleMoveStep = async (stepId: string, direction: 'up' | 'down') => {
    if (!event || !eventId) return

    const steps = [...event.steps]
    const index = steps.findIndex((s) => s.id === stepId)
    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= steps.length) return

    // Swap stepNo values
    const stepOrders = steps.map((s, i) => {
      if (i === index) return { id: s.id, stepNo: steps[newIndex].stepNo }
      if (i === newIndex) return { id: s.id, stepNo: steps[index].stepNo }
      return { id: s.id, stepNo: s.stepNo }
    })

    try {
      await bffClient.reorderSteps(eventId, {
        eventVersion: event.version,
        stepOrders,
      })
      loadEvent()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(getErrorMessage(message))
    }
  }

  const handleDeleteStep = async (stepId: string) => {
    if (!eventId) return

    if (!confirm('このステップを削除しますか？')) return

    try {
      await bffClient.deleteStep(eventId, stepId)
      loadEvent()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(getErrorMessage(message))
    }
  }

  const handleCreateStep = () => {
    setSelectedStep(null)
    setStepDialogOpen(true)
  }

  const handleEditStep = (step: BffAllocationStepResponse) => {
    setSelectedStep(step)
    setStepDialogOpen(true)
  }

  const handleStepDialogSuccess = () => {
    loadEvent()
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setEvent(null)
      setError(null)
    }
    onOpenChange(newOpen)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="!max-w-[75vw] !w-[75vw] min-h-[80vh] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>配賦イベント詳細</DialogTitle>
            <DialogDescription>配賦イベントの設定とステップを管理します</DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="py-8 text-center text-muted-foreground">読み込み中...</div>
          ) : error && !event ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : event ? (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">基本情報</TabsTrigger>
                <TabsTrigger value="steps">
                  ステップ ({event.steps.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4 min-h-[60vh]">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventCode">
                      イベントコード <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="eventCode"
                      value={eventCode}
                      onChange={(e) => setEventCode(e.target.value)}
                      maxLength={50}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scenarioType">
                      シナリオタイプ <span className="text-destructive">*</span>
                    </Label>
                    <Select value={scenarioType} onValueChange={(v) => setScenarioType(v as ScenarioType)}>
                      <SelectTrigger id="scenarioType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(SCENARIO_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventName">
                    イベント名 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="eventName"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    maxLength={200}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <Label htmlFor="isActive">有効</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">備考</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>作成日時: {new Date(event.createdAt).toLocaleString('ja-JP')}</p>
                  <p>更新日時: {new Date(event.updatedAt).toLocaleString('ja-JP')}</p>
                  <p>バージョン: {event.version}</p>
                </div>
              </TabsContent>

              <TabsContent value="steps" className="mt-4 min-h-[60vh]">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-medium">配賦ステップ</CardTitle>
                    <Button size="sm" onClick={handleCreateStep}>
                      <Plus className="mr-1 h-4 w-4" />
                      ステップ追加
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {event.steps.length === 0 ? (
                      <div className="py-8 text-center text-muted-foreground">
                        ステップがありません。「ステップ追加」ボタンから追加してください。
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[60px]">順序</TableHead>
                            <TableHead>ステップ名</TableHead>
                            <TableHead>配賦元</TableHead>
                            <TableHead>ドライバ</TableHead>
                            <TableHead>ターゲット</TableHead>
                            <TableHead className="w-[120px]">操作</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {event.steps
                            .sort((a, b) => a.stepNo - b.stepNo)
                            .map((step, index) => (
                              <TableRow key={step.id}>
                                <TableCell>
                                  <div className="flex flex-col gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => handleMoveStep(step.id, 'up')}
                                      disabled={index === 0}
                                    >
                                      <ChevronUp className="h-4 w-4" />
                                    </Button>
                                    <span className="text-center text-sm">{step.stepNo}</span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => handleMoveStep(step.id, 'down')}
                                      disabled={index === event.steps.length - 1}
                                    >
                                      <ChevronDown className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium">{step.stepName}</TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    <div>{step.fromSubjectName}</div>
                                    <div className="text-muted-foreground">{step.fromDepartmentName}</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    <Badge variant="outline" className="mb-1">
                                      {DRIVER_TYPE_LABELS[step.driverType]}
                                    </Badge>
                                    <div className="text-muted-foreground">
                                      {DRIVER_SOURCE_TYPE_LABELS[step.driverSourceType]}
                                      {step.driverName && ` / ${step.driverName}`}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary">{step.targets.length}件</Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => handleEditStep(step)}
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-destructive hover:text-destructive"
                                      onClick={() => handleDeleteStep(step.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              閉じる
            </Button>
            <Button onClick={handleSave} disabled={saving || loading}>
              {saving ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {eventId && (
        <StepDialog
          open={stepDialogOpen}
          onOpenChange={setStepDialogOpen}
          eventId={eventId}
          step={selectedStep}
          onSuccess={handleStepDialogSuccess}
        />
      )}
    </>
  )
}

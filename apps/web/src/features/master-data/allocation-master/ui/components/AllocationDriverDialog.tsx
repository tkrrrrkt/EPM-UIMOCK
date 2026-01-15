'use client'

import { useState, useEffect } from 'react'
import {
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
} from '@/shared/ui'
import type {
  DriverType,
  DriverSourceType,
  BffAllocationDriverResponse,
} from '@epm/contracts/bff/allocation-master'
import { DRIVER_TYPE_LABELS, DRIVER_SOURCE_TYPE_LABELS, getErrorMessage } from '../constants'
import { bffClient } from '../api'

interface AllocationDriverDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  driverId: string | null
  onSuccess: () => void
}

export function AllocationDriverDialog({
  open,
  onOpenChange,
  driverId,
  onSuccess,
}: AllocationDriverDialogProps) {
  const isEditMode = !!driverId
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [driver, setDriver] = useState<BffAllocationDriverResponse | null>(null)

  // Form state
  const [driverCode, setDriverCode] = useState('')
  const [driverName, setDriverName] = useState('')
  const [driverType, setDriverType] = useState<DriverType>('FIXED')
  const [sourceType, setSourceType] = useState<DriverSourceType>('MASTER')
  const [driverSubjectId, setDriverSubjectId] = useState('')
  const [measureKey, setMeasureKey] = useState('')
  const [kpiSubjectId, setKpiSubjectId] = useState('')
  const [periodRule, setPeriodRule] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (open && driverId) {
      loadDriver()
    } else if (open) {
      resetForm()
    }
  }, [open, driverId])

  const loadDriver = async () => {
    if (!driverId) return

    setLoading(true)
    setError(null)
    try {
      const data = await bffClient.getDriver(driverId)
      setDriver(data)
      setDriverCode(data.driverCode)
      setDriverName(data.driverName)
      setDriverType(data.driverType)
      setSourceType(data.sourceType)
      setDriverSubjectId(data.driverSubjectId || '')
      setMeasureKey(data.measureKey || '')
      setKpiSubjectId(data.kpiSubjectId || '')
      setPeriodRule(data.periodRule || '')
      setNotes(data.notes || '')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(getErrorMessage(message))
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setDriver(null)
    setDriverCode('')
    setDriverName('')
    setDriverType('FIXED')
    setSourceType('MASTER')
    setDriverSubjectId('')
    setMeasureKey('')
    setKpiSubjectId('')
    setPeriodRule('')
    setNotes('')
    setError(null)
  }

  const handleSubmit = async () => {
    setError(null)

    if (!driverCode.trim()) {
      setError('ドライバコードを入力してください')
      return
    }
    if (!driverName.trim()) {
      setError('ドライバ名を入力してください')
      return
    }

    // Type-specific validation
    if (driverType === 'SUBJECT_AMOUNT' && !driverSubjectId.trim()) {
      setError('科目金額タイプの場合、ドライバ科目IDは必須です')
      return
    }
    if (driverType === 'MEASURE' && !measureKey.trim()) {
      setError('測定値タイプの場合、測定キーは必須です')
      return
    }
    if (driverType === 'KPI' && !kpiSubjectId.trim()) {
      setError('KPIタイプの場合、KPI科目IDは必須です')
      return
    }

    setSaving(true)
    try {
      if (isEditMode && driverId) {
        await bffClient.updateDriver(driverId, {
          driverCode: driverCode.trim(),
          driverName: driverName.trim(),
          driverType,
          sourceType,
          driverSubjectId: driverSubjectId.trim() || undefined,
          measureKey: measureKey.trim() || undefined,
          kpiSubjectId: kpiSubjectId.trim() || undefined,
          periodRule: periodRule.trim() || undefined,
          notes: notes.trim() || undefined,
        })
      } else {
        await bffClient.createDriver({
          companyId: 'company-001', // TODO: 実際のcompanyIdを取得
          driverCode: driverCode.trim(),
          driverName: driverName.trim(),
          driverType,
          sourceType,
          driverSubjectId: driverSubjectId.trim() || undefined,
          measureKey: measureKey.trim() || undefined,
          kpiSubjectId: kpiSubjectId.trim() || undefined,
          periodRule: periodRule.trim() || undefined,
          notes: notes.trim() || undefined,
        })
      }
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(getErrorMessage(message))
    } finally {
      setSaving(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm()
    }
    onOpenChange(newOpen)
  }

  const showDriverSubject = driverType === 'SUBJECT_AMOUNT'
  const showMeasureKey = driverType === 'MEASURE'
  const showKpiSubject = driverType === 'KPI'
  const showPeriodRule = sourceType === 'FACT' || sourceType === 'KPI'

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditMode ? '配賦ドライバ編集' : '配賦ドライバ新規作成'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'ドライバの設定を編集します' : '新しいドライバを作成します'}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">読み込み中...</div>
        ) : (
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="driverCode">
                  ドライバコード <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="driverCode"
                  value={driverCode}
                  onChange={(e) => setDriverCode(e.target.value)}
                  placeholder="例: DRV-001"
                  maxLength={50}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driverName">
                  ドライバ名 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="driverName"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="例: 人員比ドライバ"
                  maxLength={200}
                />
              </div>
            </div>

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
                <Label htmlFor="sourceType">
                  ソースタイプ <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={sourceType}
                  onValueChange={(v) => setSourceType(v as DriverSourceType)}
                >
                  <SelectTrigger id="sourceType">
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

            {showDriverSubject && (
              <div className="space-y-2">
                <Label htmlFor="driverSubjectId">
                  ドライバ科目ID <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="driverSubjectId"
                  value={driverSubjectId}
                  onChange={(e) => setDriverSubjectId(e.target.value)}
                  placeholder="科目ID"
                />
              </div>
            )}

            {showMeasureKey && (
              <div className="space-y-2">
                <Label htmlFor="measureKey">
                  測定キー <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="measureKey"
                  value={measureKey}
                  onChange={(e) => setMeasureKey(e.target.value)}
                  placeholder="例: AREA, HEADCOUNT"
                />
              </div>
            )}

            {showKpiSubject && (
              <div className="space-y-2">
                <Label htmlFor="kpiSubjectId">
                  KPI科目ID <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="kpiSubjectId"
                  value={kpiSubjectId}
                  onChange={(e) => setKpiSubjectId(e.target.value)}
                  placeholder="KPI科目ID"
                />
              </div>
            )}

            {showPeriodRule && (
              <div className="space-y-2">
                <Label htmlFor="periodRule">期間ルール</Label>
                <Select value={periodRule} onValueChange={setPeriodRule}>
                  <SelectTrigger id="periodRule">
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">月次</SelectItem>
                    <SelectItem value="QUARTERLY">四半期</SelectItem>
                    <SelectItem value="YEARLY">年次</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">備考</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {isEditMode && driver && (
              <div className="text-sm text-muted-foreground">
                <p>作成日時: {new Date(driver.createdAt).toLocaleString('ja-JP')}</p>
                <p>更新日時: {new Date(driver.updatedAt).toLocaleString('ja-JP')}</p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={saving}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={saving || loading}>
            {saving ? '保存中...' : isEditMode ? '保存' : '作成'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

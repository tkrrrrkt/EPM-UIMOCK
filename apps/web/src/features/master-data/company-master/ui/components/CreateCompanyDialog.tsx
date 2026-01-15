'use client'

import { useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import {
  Alert,
  AlertDescription,
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
} from '@/shared/ui'
import { bffClient } from '../api'
import {
  CONSOLIDATION_TYPE_LABELS,
  CURRENCY_OPTIONS,
  ERROR_MESSAGES,
  FISCAL_MONTH_OPTIONS,
  TIMEZONE_OPTIONS,
} from '../constants'
import type { BffCreateCompanyRequest, ConsolidationType } from '@epm/contracts/bff/company-master'

interface CreateCompanyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  availableParents: Array<{ id: string; name: string }>
}

export function CreateCompanyDialog({ open, onOpenChange, onSuccess, availableParents }: CreateCompanyDialogProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<BffCreateCompanyRequest>>({
    consolidationType: 'full',
    currencyCode: 'JPY',
    fiscalYearEndMonth: 3,
  })

  const handleCreate = async () => {
    setError(null)

    // Validation
    if (
      !formData.companyCode ||
      !formData.companyName ||
      !formData.consolidationType ||
      !formData.currencyCode ||
      !formData.fiscalYearEndMonth
    ) {
      setError('必須項目を入力してください')
      return
    }

    setSaving(true)
    try {
      await bffClient.createCompany(formData as BffCreateCompanyRequest)
      onSuccess()
      onOpenChange(false)
      resetForm()
    } catch (err) {
      setError(ERROR_MESSAGES[(err as Error).message] || '登録に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setFormData({
      consolidationType: 'full',
      currencyCode: 'JPY',
      fiscalYearEndMonth: 3,
    })
    setError(null)
  }

  const handleConsolidationTypeChange = (value: ConsolidationType) => {
    setFormData({
      ...formData,
      consolidationType: value,
      // Clear ratios if changing to 'none'
      ...(value === 'none' && {
        ownershipRatio: undefined,
        votingRatio: undefined,
      }),
    })
  }

  const isRatioDisabled = formData.consolidationType === 'none'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>法人新規登録</DialogTitle>
          <DialogDescription>新しい法人を登録します。必須項目を入力してください。</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-companyCode">
                法人コード <span className="text-destructive">*</span>
              </Label>
              <Input
                id="create-companyCode"
                value={formData.companyCode || ''}
                onChange={(e) => setFormData({ ...formData, companyCode: e.target.value })}
                maxLength={20}
                placeholder="例: JP001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-companyName">
                法人名 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="create-companyName"
                value={formData.companyName || ''}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                maxLength={200}
                placeholder="例: 株式会社EPMジャパン"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-companyNameShort">法人名略称</Label>
            <Input
              id="create-companyNameShort"
              value={formData.companyNameShort || ''}
              onChange={(e) => setFormData({ ...formData, companyNameShort: e.target.value })}
              maxLength={100}
              placeholder="例: EPM Japan"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-parentCompanyId">親法人</Label>
            <Select
              value={formData.parentCompanyId || 'none'}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  parentCompanyId: value === 'none' ? undefined : value,
                })
              }
            >
              <SelectTrigger id="create-parentCompanyId">
                <SelectValue placeholder="親法人なし" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">親法人なし</SelectItem>
                {availableParents.map((parent) => (
                  <SelectItem key={parent.id} value={parent.id}>
                    {parent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-consolidationType">
                連結種別 <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.consolidationType} onValueChange={handleConsolidationTypeChange}>
                <SelectTrigger id="create-consolidationType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CONSOLIDATION_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-ownershipRatio">出資比率 (%)</Label>
              <Input
                id="create-ownershipRatio"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.ownershipRatio || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ownershipRatio: e.target.value ? Number.parseFloat(e.target.value) : undefined,
                  })
                }
                disabled={isRatioDisabled}
                placeholder="0.0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-votingRatio">議決権比率 (%)</Label>
              <Input
                id="create-votingRatio"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.votingRatio || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    votingRatio: e.target.value ? Number.parseFloat(e.target.value) : undefined,
                  })
                }
                disabled={isRatioDisabled}
                placeholder="0.0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-currencyCode">
                通貨 <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.currencyCode}
                onValueChange={(value) => setFormData({ ...formData, currencyCode: value })}
              >
                <SelectTrigger id="create-currencyCode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-reportingCurrencyCode">レポート通貨</Label>
              <Select
                value={formData.reportingCurrencyCode || 'none'}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    reportingCurrencyCode: value === 'none' ? undefined : value,
                  })
                }
              >
                <SelectTrigger id="create-reportingCurrencyCode">
                  <SelectValue placeholder="未設定" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">未設定</SelectItem>
                  {CURRENCY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-fiscalYearEndMonth">
                決算月 <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.fiscalYearEndMonth?.toString()}
                onValueChange={(value) => setFormData({ ...formData, fiscalYearEndMonth: Number.parseInt(value) })}
              >
                <SelectTrigger id="create-fiscalYearEndMonth">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FISCAL_MONTH_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-timezone">タイムゾーン</Label>
              <Select
                value={formData.timezone || 'none'}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    timezone: value === 'none' ? undefined : value,
                  })
                }
              >
                <SelectTrigger id="create-timezone">
                  <SelectValue placeholder="未設定" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">未設定</SelectItem>
                  {TIMEZONE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              resetForm()
            }}
            disabled={saving}
          >
            キャンセル
          </Button>
          <Button onClick={handleCreate} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                登録中...
              </>
            ) : (
              '登録'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

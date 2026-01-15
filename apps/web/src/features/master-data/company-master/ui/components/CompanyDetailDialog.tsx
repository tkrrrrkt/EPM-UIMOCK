'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import {
  Alert,
  AlertDescription,
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
  Separator,
} from '@/shared/ui'
import { bffClient } from '../api'
import {
  CONSOLIDATION_TYPE_LABELS,
  CURRENCY_OPTIONS,
  ERROR_MESSAGES,
  FISCAL_MONTH_OPTIONS,
  TIMEZONE_OPTIONS,
} from '../constants'
import type { BffCompanyDetailResponse, ConsolidationType } from '@epm/contracts/bff/company-master'

interface CompanyDetailDialogProps {
  companyId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  availableParents: Array<{ id: string; name: string }>
}

export function CompanyDetailDialog({
  companyId,
  open,
  onOpenChange,
  onSuccess,
  availableParents,
}: CompanyDetailDialogProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [company, setCompany] = useState<BffCompanyDetailResponse | null>(null)
  const [formData, setFormData] = useState<Partial<BffCompanyDetailResponse>>({})

  useEffect(() => {
    if (open && companyId) {
      loadCompany()
    } else {
      resetState()
    }
  }, [open, companyId])

  const loadCompany = async () => {
    if (!companyId) return
    setLoading(true)
    setError(null)
    try {
      const data = await bffClient.getCompanyDetail(companyId)
      setCompany(data)
      setFormData(data)
    } catch (err) {
      setError(ERROR_MESSAGES[(err as Error).message] || '読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const resetState = () => {
    setCompany(null)
    setFormData({})
    setIsEditing(false)
    setError(null)
  }

  const handleSave = async () => {
    if (!companyId) return
    setSaving(true)
    setError(null)
    try {
      await bffClient.updateCompany(companyId, {
        companyCode: formData.companyCode,
        companyName: formData.companyName,
        companyNameShort: formData.companyNameShort ?? undefined,
        parentCompanyId: formData.parentCompanyId,
        consolidationType: formData.consolidationType,
        ownershipRatio: formData.ownershipRatio,
        votingRatio: formData.votingRatio,
        currencyCode: formData.currencyCode,
        reportingCurrencyCode: formData.reportingCurrencyCode,
        fiscalYearEndMonth: formData.fiscalYearEndMonth,
        timezone: formData.timezone,
      })
      setIsEditing(false)
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      setError(ERROR_MESSAGES[(err as Error).message] || '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async () => {
    if (!companyId || !confirm('この法人を無効化しますか？')) return
    setSaving(true)
    setError(null)
    try {
      await bffClient.deactivateCompany(companyId)
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      setError(ERROR_MESSAGES[(err as Error).message] || '無効化に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleReactivate = async () => {
    if (!companyId || !confirm('この法人を再有効化しますか？')) return
    setSaving(true)
    setError(null)
    try {
      await bffClient.reactivateCompany(companyId)
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      setError(ERROR_MESSAGES[(err as Error).message] || '再有効化に失敗しました')
    } finally {
      setSaving(false)
    }
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
          <DialogTitle>法人詳細</DialogTitle>
          <DialogDescription>
            {isEditing ? '法人情報を編集できます' : '法人の詳細情報を表示しています'}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {company && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Badge variant={company.isActive ? 'default' : 'secondary'}>
                    {company.isActive ? '有効' : '無効'}
                  </Badge>
                  <Badge variant="outline">{CONSOLIDATION_TYPE_LABELS[company.consolidationType]}</Badge>
                </div>

                <Separator />

                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyCode">法人コード *</Label>
                      {isEditing ? (
                        <Input
                          id="companyCode"
                          value={formData.companyCode || ''}
                          onChange={(e) => setFormData({ ...formData, companyCode: e.target.value })}
                          maxLength={20}
                          required
                        />
                      ) : (
                        <p className="text-sm font-mono">{company.companyCode}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyName">法人名 *</Label>
                      {isEditing ? (
                        <Input
                          id="companyName"
                          value={formData.companyName || ''}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          maxLength={200}
                          required
                        />
                      ) : (
                        <p className="text-sm">{company.companyName}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyNameShort">法人名略称</Label>
                    {isEditing ? (
                      <Input
                        id="companyNameShort"
                        value={formData.companyNameShort || ''}
                        onChange={(e) => setFormData({ ...formData, companyNameShort: e.target.value })}
                        maxLength={100}
                      />
                    ) : (
                      <p className="text-sm">{company.companyNameShort || '-'}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parentCompanyId">親法人</Label>
                    {isEditing ? (
                      <Select
                        value={formData.parentCompanyId || 'none'}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            parentCompanyId: value === 'none' ? undefined : value,
                          })
                        }
                      >
                        <SelectTrigger id="parentCompanyId">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">親法人なし</SelectItem>
                          {availableParents
                            .filter((p) => p.id !== companyId)
                            .map((parent) => (
                              <SelectItem key={parent.id} value={parent.id}>
                                {parent.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm">{company.parentCompanyName || '-'}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="consolidationType">連結種別 *</Label>
                      {isEditing ? (
                        <Select value={formData.consolidationType} onValueChange={handleConsolidationTypeChange}>
                          <SelectTrigger id="consolidationType">
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
                      ) : (
                        <p className="text-sm">{CONSOLIDATION_TYPE_LABELS[company.consolidationType]}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ownershipRatio">出資比率 (%)</Label>
                      {isEditing ? (
                        <Input
                          id="ownershipRatio"
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
                        />
                      ) : (
                        <p className="text-sm">{company.ownershipRatio != null ? `${company.ownershipRatio}%` : '-'}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="votingRatio">議決権比率 (%)</Label>
                      {isEditing ? (
                        <Input
                          id="votingRatio"
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
                        />
                      ) : (
                        <p className="text-sm">{company.votingRatio != null ? `${company.votingRatio}%` : '-'}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currencyCode">通貨 *</Label>
                      {isEditing ? (
                        <Select
                          value={formData.currencyCode}
                          onValueChange={(value) => setFormData({ ...formData, currencyCode: value })}
                        >
                          <SelectTrigger id="currencyCode">
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
                      ) : (
                        <p className="text-sm">{company.currencyCode}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reportingCurrencyCode">レポート通貨</Label>
                      {isEditing ? (
                        <Select
                          value={formData.reportingCurrencyCode || 'none'}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              reportingCurrencyCode: value === 'none' ? undefined : value,
                            })
                          }
                        >
                          <SelectTrigger id="reportingCurrencyCode">
                            <SelectValue />
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
                      ) : (
                        <p className="text-sm">{company.reportingCurrencyCode || '-'}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fiscalYearEndMonth">決算月 *</Label>
                      {isEditing ? (
                        <Select
                          value={formData.fiscalYearEndMonth?.toString()}
                          onValueChange={(value) =>
                            setFormData({ ...formData, fiscalYearEndMonth: Number.parseInt(value) })
                          }
                        >
                          <SelectTrigger id="fiscalYearEndMonth">
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
                      ) : (
                        <p className="text-sm">{company.fiscalYearEndMonth}月決算</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">タイムゾーン</Label>
                      {isEditing ? (
                        <Select
                          value={formData.timezone || 'none'}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              timezone: value === 'none' ? undefined : value,
                            })
                          }
                        >
                          <SelectTrigger id="timezone">
                            <SelectValue />
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
                      ) : (
                        <p className="text-sm">{company.timezone || '-'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {company && !isEditing && (
            <>
              {company.isActive ? (
                <Button variant="destructive" onClick={handleDeactivate} disabled={saving}>
                  無効化
                </Button>
              ) : (
                <Button variant="default" onClick={handleReactivate} disabled={saving}>
                  再有効化
                </Button>
              )}
            </>
          )}
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  setFormData(company || {})
                }}
                disabled={saving}
              >
                キャンセル
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  '保存'
                )}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} disabled={loading}>
              編集
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

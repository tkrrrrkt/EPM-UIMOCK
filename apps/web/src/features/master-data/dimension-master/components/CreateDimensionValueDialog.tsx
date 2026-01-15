'use client'

import type React from 'react'
import { useState } from 'react'
import type { BffCreateDimensionValueRequest, BffDimensionValueSummary } from '@epm/contracts/bff/dimension-master'

interface CreateDimensionValueDialogProps {
  open: boolean
  dimensionId: string
  availableParents: BffDimensionValueSummary[]
  onClose: () => void
  onCreate: (data: BffCreateDimensionValueRequest) => Promise<void>
}

export function CreateDimensionValueDialog({
  open,
  dimensionId,
  availableParents,
  onClose,
  onCreate,
}: CreateDimensionValueDialogProps) {
  const [formData, setFormData] = useState<BffCreateDimensionValueRequest>({
    valueCode: '',
    valueName: '',
    valueNameShort: '',
    scopeType: 'tenant',
    scopeCompanyId: undefined,
    parentId: undefined,
    sortOrder: 0,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.valueCode.trim()) {
      newErrors.valueCode = '値コードは必須です'
    }
    if (!formData.valueName.trim()) {
      newErrors.valueName = '値名は必須です'
    }
    if (formData.scopeType === 'company' && !formData.scopeCompanyId) {
      newErrors.scopeCompanyId = 'スコープタイプが会社の場合、会社IDは必須です'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)
    try {
      await onCreate(formData)
      onClose()
      // Reset form
      setFormData({
        valueCode: '',
        valueName: '',
        valueNameShort: '',
        scopeType: 'tenant',
        scopeCompanyId: undefined,
        parentId: undefined,
        sortOrder: 0,
      })
      setErrors({})
    } catch (error) {
      console.error('Failed to create dimension value:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background rounded-lg shadow-lg w-full max-w-lg p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold">ディメンション値新規登録</h2>
          <p className="text-sm text-muted-foreground mt-1">新しいディメンション値を登録します</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              値コード <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.valueCode}
              onChange={(e) => setFormData({ ...formData, valueCode: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="例: DOM"
            />
            {errors.valueCode && <p className="text-xs text-destructive">{errors.valueCode}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              値名 <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.valueName}
              onChange={(e) => setFormData({ ...formData, valueName: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="例: 国内事業"
            />
            {errors.valueName && <p className="text-xs text-destructive">{errors.valueName}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">値名（短縮）</label>
            <input
              type="text"
              value={formData.valueNameShort}
              onChange={(e) => setFormData({ ...formData, valueNameShort: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="例: 国内"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              スコープタイプ <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="tenant"
                  checked={formData.scopeType === 'tenant'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      scopeType: e.target.value as 'tenant' | 'company',
                      scopeCompanyId: undefined,
                    })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm">テナント</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="company"
                  checked={formData.scopeType === 'company'}
                  onChange={(e) => setFormData({ ...formData, scopeType: e.target.value as 'tenant' | 'company' })}
                  className="w-4 h-4"
                />
                <span className="text-sm">会社</span>
              </label>
            </div>
          </div>

          {formData.scopeType === 'company' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                スコープ会社 <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.scopeCompanyId || ''}
                onChange={(e) => setFormData({ ...formData, scopeCompanyId: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="会社IDを入力"
              />
              {errors.scopeCompanyId && <p className="text-xs text-destructive">{errors.scopeCompanyId}</p>}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">親値（階層構造用）</label>
            <select
              value={formData.parentId || ''}
              onChange={(e) => setFormData({ ...formData, parentId: e.target.value || undefined })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">親値なし（ルート）</option>
              {availableParents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.valueName} ({parent.valueCode})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">表示順</label>
            <input
              type="number"
              value={formData.sortOrder}
              onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-md border border-input hover:bg-muted"
              disabled={isSubmitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? '登録中...' : '登録'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

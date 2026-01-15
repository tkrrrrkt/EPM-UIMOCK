'use client'

import type React from 'react'
import { useState } from 'react'
import type { BffCreateDimensionRequest } from '@epm/contracts/bff/dimension-master'

interface CreateDimensionDialogProps {
  open: boolean
  onClose: () => void
  onCreate: (data: BffCreateDimensionRequest) => Promise<void>
}

const DIMENSION_TYPES = [
  { value: 'IR_SEGMENT', label: 'IRセグメント' },
  { value: 'PRODUCT_CATEGORY', label: '製品カテゴリ' },
  { value: 'CUSTOMER_GROUP', label: '得意先グループ' },
  { value: 'REGION', label: '地域' },
  { value: 'CHANNEL', label: '販売チャネル' },
]

export function CreateDimensionDialog({ open, onClose, onCreate }: CreateDimensionDialogProps) {
  const [formData, setFormData] = useState<BffCreateDimensionRequest>({
    dimensionCode: '',
    dimensionName: '',
    dimensionType: 'IR_SEGMENT',
    isHierarchical: false,
    isRequired: false,
    scopePolicy: 'tenant',
    sortOrder: 0,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.dimensionCode.trim()) {
      newErrors.dimensionCode = 'ディメンションコードは必須です'
    }
    if (!formData.dimensionName.trim()) {
      newErrors.dimensionName = 'ディメンション名は必須です'
    }
    if (!formData.dimensionType) {
      newErrors.dimensionType = 'ディメンションタイプは必須です'
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
        dimensionCode: '',
        dimensionName: '',
        dimensionType: 'IR_SEGMENT',
        isHierarchical: false,
        isRequired: false,
        scopePolicy: 'tenant',
        sortOrder: 0,
      })
      setErrors({})
    } catch (error) {
      console.error('Failed to create dimension:', error)
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
          <h2 className="text-lg font-semibold">ディメンション新規登録</h2>
          <p className="text-sm text-muted-foreground mt-1">新しいディメンションを登録します</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              ディメンションコード <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.dimensionCode}
              onChange={(e) => setFormData({ ...formData, dimensionCode: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="例: SEG_IR"
            />
            {errors.dimensionCode && <p className="text-xs text-destructive">{errors.dimensionCode}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              ディメンション名 <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.dimensionName}
              onChange={(e) => setFormData({ ...formData, dimensionName: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="例: IRセグメント"
            />
            {errors.dimensionName && <p className="text-xs text-destructive">{errors.dimensionName}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              ディメンションタイプ <span className="text-destructive">*</span>
            </label>
            <select
              value={formData.dimensionType}
              onChange={(e) => setFormData({ ...formData, dimensionType: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {DIMENSION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">スコープポリシー</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="tenant"
                  checked={formData.scopePolicy === 'tenant'}
                  onChange={(e) => setFormData({ ...formData, scopePolicy: e.target.value as 'tenant' | 'company' })}
                  className="w-4 h-4"
                />
                <span className="text-sm">テナント</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="company"
                  checked={formData.scopePolicy === 'company'}
                  onChange={(e) => setFormData({ ...formData, scopePolicy: e.target.value as 'tenant' | 'company' })}
                  className="w-4 h-4"
                />
                <span className="text-sm">会社</span>
              </label>
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isHierarchical}
                onChange={(e) => setFormData({ ...formData, isHierarchical: e.target.checked })}
                className="w-4 h-4 rounded border-input"
              />
              <span className="text-sm">階層構造</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isRequired}
                onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                className="w-4 h-4 rounded border-input"
              />
              <span className="text-sm">必須</span>
            </label>
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

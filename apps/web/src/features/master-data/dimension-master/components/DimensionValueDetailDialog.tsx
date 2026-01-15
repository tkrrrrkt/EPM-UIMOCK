'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import type {
  BffDimensionValueDetailResponse,
  BffUpdateDimensionValueRequest,
  BffDimensionValueSummary,
} from '@epm/contracts/bff/dimension-master'
import { formatDate } from '../ui/utils'

interface DimensionValueDetailDialogProps {
  value: BffDimensionValueDetailResponse | null
  availableParents: BffDimensionValueSummary[]
  open: boolean
  onClose: () => void
  onUpdate: (id: string, data: BffUpdateDimensionValueRequest) => Promise<void>
}

export function DimensionValueDetailDialog({
  value,
  availableParents,
  open,
  onClose,
  onUpdate,
}: DimensionValueDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<BffUpdateDimensionValueRequest>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (value && open) {
      setFormData({
        valueCode: value.valueCode,
        valueName: value.valueName,
        valueNameShort: value.valueNameShort || '',
        scopeType: value.scopeType,
        scopeCompanyId: value.scopeCompanyId || undefined,
        parentId: value.parentId || undefined,
        sortOrder: value.sortOrder,
      })
      setIsEditing(false)
    }
  }, [value, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!value) return

    setIsSubmitting(true)
    try {
      await onUpdate(value.id, formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update dimension value:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!open || !value) return null

  // Filter out self and descendants from parent options
  const filteredParents = availableParents.filter((p) => p.id !== value.id)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background rounded-lg shadow-lg w-full max-w-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">ディメンション値詳細</h2>
            <p className="text-sm text-muted-foreground mt-1">ID: {value.id}</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm font-medium rounded-md border border-input hover:bg-muted"
            >
              編集
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">値コード</label>
                <input
                  type="text"
                  value={formData.valueCode || ''}
                  onChange={(e) => setFormData({ ...formData, valueCode: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">値名</label>
                <input
                  type="text"
                  value={formData.valueName || ''}
                  onChange={(e) => setFormData({ ...formData, valueName: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">値名（短縮）</label>
                <input
                  type="text"
                  value={formData.valueNameShort || ''}
                  onChange={(e) => setFormData({ ...formData, valueNameShort: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">スコープタイプ</label>
                <div className="flex gap-4 pt-2">
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
                  <label className="text-sm font-medium">スコープ会社</label>
                  <input
                    type="text"
                    value={formData.scopeCompanyId || ''}
                    onChange={(e) => setFormData({ ...formData, scopeCompanyId: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="会社IDを入力"
                  />
                </div>
              )}

              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">親値</label>
                <select
                  value={formData.parentId || ''}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value || null })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">親値なし（ルート）</option>
                  {filteredParents.map((parent) => (
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
                  value={formData.sortOrder || 0}
                  onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
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
                {isSubmitting ? '更新中...' : '更新'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">値コード</p>
                <p className="text-sm font-mono mt-1">{value.valueCode}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">値名</p>
                <p className="text-sm mt-1">{value.valueName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">値名（短縮）</p>
                <p className="text-sm mt-1">{value.valueNameShort || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">スコープタイプ</p>
                <p className="text-sm mt-1">{value.scopeType === 'tenant' ? 'テナント' : '会社'}</p>
              </div>
              {value.scopeCompanyId && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">スコープ会社ID</p>
                  <p className="text-sm mt-1">{value.scopeCompanyId}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">階層レベル</p>
                <p className="text-sm mt-1">{value.hierarchyLevel}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-muted-foreground">階層パス</p>
                <p className="text-sm mt-1 font-mono">{value.hierarchyPath || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">表示順</p>
                <p className="text-sm mt-1">{value.sortOrder}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">状態</p>
                <p className="text-sm mt-1">{value.isActive ? '有効' : '無効'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">作成日時</p>
                <p className="text-sm mt-1">{formatDate(value.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">更新日時</p>
                <p className="text-sm mt-1">{formatDate(value.updatedAt)}</p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium rounded-md border border-input hover:bg-muted"
              >
                閉じる
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

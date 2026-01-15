'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import type { BffDimensionDetailResponse, BffUpdateDimensionRequest } from '@epm/contracts/bff/dimension-master'
import { formatDate } from '../ui/utils'

interface DimensionDetailDialogProps {
  dimension: BffDimensionDetailResponse | null
  open: boolean
  onClose: () => void
  onUpdate: (id: string, data: BffUpdateDimensionRequest) => Promise<void>
}

const DIMENSION_TYPES = [
  { value: 'IR_SEGMENT', label: 'IRセグメント' },
  { value: 'PRODUCT_CATEGORY', label: '製品カテゴリ' },
  { value: 'CUSTOMER_GROUP', label: '得意先グループ' },
  { value: 'REGION', label: '地域' },
  { value: 'CHANNEL', label: '販売チャネル' },
]

export function DimensionDetailDialog({ dimension, open, onClose, onUpdate }: DimensionDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<BffUpdateDimensionRequest>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (dimension && open) {
      setFormData({
        dimensionCode: dimension.dimensionCode,
        dimensionName: dimension.dimensionName,
        dimensionType: dimension.dimensionType,
        isHierarchical: dimension.isHierarchical,
        isRequired: dimension.isRequired,
        scopePolicy: dimension.scopePolicy,
        sortOrder: dimension.sortOrder,
      })
      setIsEditing(false)
    }
  }, [dimension, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dimension) return

    setIsSubmitting(true)
    try {
      await onUpdate(dimension.id, formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update dimension:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!open || !dimension) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background rounded-lg shadow-lg w-full max-w-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">ディメンション詳細</h2>
            <p className="text-sm text-muted-foreground mt-1">ID: {dimension.id}</p>
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
                <label className="text-sm font-medium">ディメンションコード</label>
                <input
                  type="text"
                  value={formData.dimensionCode || ''}
                  onChange={(e) => setFormData({ ...formData, dimensionCode: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">ディメンション名</label>
                <input
                  type="text"
                  value={formData.dimensionName || ''}
                  onChange={(e) => setFormData({ ...formData, dimensionName: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">ディメンションタイプ</label>
                <select
                  value={formData.dimensionType || ''}
                  onChange={(e) => setFormData({ ...formData, dimensionType: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                <div className="flex gap-4 pt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="tenant"
                      checked={formData.scopePolicy === 'tenant'}
                      onChange={(e) =>
                        setFormData({ ...formData, scopePolicy: e.target.value as 'tenant' | 'company' })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm">テナント</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="company"
                      checked={formData.scopePolicy === 'company'}
                      onChange={(e) =>
                        setFormData({ ...formData, scopePolicy: e.target.value as 'tenant' | 'company' })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm">会社</span>
                  </label>
                </div>
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

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isHierarchical || false}
                  onChange={(e) => setFormData({ ...formData, isHierarchical: e.target.checked })}
                  className="w-4 h-4 rounded border-input"
                />
                <span className="text-sm">階層構造</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isRequired || false}
                  onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                  className="w-4 h-4 rounded border-input"
                />
                <span className="text-sm">必須</span>
              </label>
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
                <p className="text-sm font-medium text-muted-foreground">ディメンションコード</p>
                <p className="text-sm font-mono mt-1">{dimension.dimensionCode}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">ディメンション名</p>
                <p className="text-sm mt-1">{dimension.dimensionName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">ディメンションタイプ</p>
                <p className="text-sm mt-1">{dimension.dimensionType}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">スコープポリシー</p>
                <p className="text-sm mt-1">{dimension.scopePolicy === 'tenant' ? 'テナント' : '会社'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">表示順</p>
                <p className="text-sm mt-1">{dimension.sortOrder}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">状態</p>
                <p className="text-sm mt-1">{dimension.isActive ? '有効' : '無効'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">階層構造</p>
                <p className="text-sm mt-1">{dimension.isHierarchical ? 'あり' : 'なし'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">必須</p>
                <p className="text-sm mt-1">{dimension.isRequired ? 'はい' : 'いいえ'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">作成日時</p>
                <p className="text-sm mt-1">{formatDate(dimension.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">更新日時</p>
                <p className="text-sm mt-1">{formatDate(dimension.updatedAt)}</p>
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

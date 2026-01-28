'use client'

import React from 'react'
import { useState } from 'react'
import type { InputScope } from '../../api/bff-client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
  Textarea,
  Checkbox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui'

interface CreateSectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    sectionCode: string
    sectionName: string
    inputScope: InputScope
    isRequired: boolean
    description?: string
  }) => Promise<void>
}

const INPUT_SCOPE_OPTIONS: { value: InputScope; label: string }[] = [
  { value: 'DEPARTMENT', label: '部門ごとに入力' },
  { value: 'BU', label: '事業部ごとに入力' },
  { value: 'COMPANY', label: '全社で1つ入力' },
]

export function CreateSectionDialog({ open, onOpenChange, onSubmit }: CreateSectionDialogProps) {
  const [sectionCode, setSectionCode] = useState('')
  const [sectionName, setSectionName] = useState('')
  const [inputScope, setInputScope] = useState<InputScope>('DEPARTMENT')
  const [isRequired, setIsRequired] = useState(false)
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!sectionCode.trim()) {
      newErrors.sectionCode = 'セクションコードは必須です'
    } else if (!/^[A-Z0-9_]+$/.test(sectionCode)) {
      newErrors.sectionCode = '英大文字・数字・アンダースコアのみ使用できます'
    } else if (sectionCode.length > 50) {
      newErrors.sectionCode = '50文字以内で入力してください'
    }
    if (!sectionName.trim()) {
      newErrors.sectionName = 'セクション名は必須です'
    } else if (sectionName.length > 200) {
      newErrors.sectionName = '200文字以内で入力してください'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        sectionCode,
        sectionName,
        inputScope,
        isRequired,
        description: description.trim() || undefined,
      })
      // Reset form
      setSectionCode('')
      setSectionName('')
      setInputScope('DEPARTMENT')
      setIsRequired(false)
      setDescription('')
      setErrors({})
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSectionCode('')
      setSectionName('')
      setInputScope('DEPARTMENT')
      setIsRequired(false)
      setDescription('')
      setErrors({})
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>セクションの追加</DialogTitle>
          <DialogDescription>
            新しいセクションを作成します。セクションコードは後から変更できません。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sectionCode">
              セクションコード <span className="text-destructive">*</span>
            </Label>
            <Input
              id="sectionCode"
              value={sectionCode}
              onChange={(e) => setSectionCode(e.target.value.toUpperCase())}
              placeholder="例: SALES_SUMMARY"
              className={errors.sectionCode ? 'border-destructive' : ''}
            />
            {errors.sectionCode && <p className="text-sm text-destructive">{errors.sectionCode}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sectionName">
              セクション名 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="sectionName"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              placeholder="例: 業績サマリー"
              className={errors.sectionName ? 'border-destructive' : ''}
            />
            {errors.sectionName && <p className="text-sm text-destructive">{errors.sectionName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="inputScope">
              入力スコープ <span className="text-destructive">*</span>
            </Label>
            <Select value={inputScope} onValueChange={(v) => setInputScope(v as InputScope)}>
              <SelectTrigger id="inputScope">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INPUT_SCOPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="isRequired"
              checked={isRequired}
              onCheckedChange={(checked) => setIsRequired(checked === true)}
            />
            <Label htmlFor="isRequired" className="cursor-pointer">
              必須セクション
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="セクションの説明を入力（任意）"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '作成中...' : '作成'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

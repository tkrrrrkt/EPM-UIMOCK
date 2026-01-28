'use client'

import { useState, useEffect } from 'react'
import type { FormSectionDto, InputScope, UpdateFormSectionDto } from '../api/bff-client'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Textarea,
  Checkbox,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui'
import { Trash2, Layers } from 'lucide-react'

interface SectionDetailPanelProps {
  section: FormSectionDto
  onUpdate: (data: UpdateFormSectionDto) => Promise<void>
  onDelete: () => void
}

const INPUT_SCOPE_OPTIONS: { value: InputScope; label: string }[] = [
  { value: 'DEPARTMENT', label: '部門ごとに入力' },
  { value: 'BU', label: '事業部ごとに入力' },
  { value: 'COMPANY', label: '全社で1つ入力' },
]

export function SectionDetailPanel({ section, onUpdate, onDelete }: SectionDetailPanelProps) {
  const [sectionName, setSectionName] = useState(section.sectionName)
  const [inputScope, setInputScope] = useState<InputScope>(section.inputScope)
  const [isRequired, setIsRequired] = useState(section.isRequired)
  const [description, setDescription] = useState(section.description ?? '')
  const [isActive, setIsActive] = useState(section.isActive)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasChanges, setHasChanges] = useState(false)

  // Reset form when section changes
  useEffect(() => {
    setSectionName(section.sectionName)
    setInputScope(section.inputScope)
    setIsRequired(section.isRequired)
    setDescription(section.description ?? '')
    setIsActive(section.isActive)
    setHasChanges(false)
    setErrors({})
  }, [section])

  // Track changes
  useEffect(() => {
    const changed =
      sectionName !== section.sectionName ||
      inputScope !== section.inputScope ||
      isRequired !== section.isRequired ||
      description !== (section.description ?? '') ||
      isActive !== section.isActive
    setHasChanges(changed)
  }, [sectionName, inputScope, isRequired, description, isActive, section])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!sectionName.trim()) {
      newErrors.sectionName = 'セクション名は必須です'
    } else if (sectionName.length > 200) {
      newErrors.sectionName = '200文字以内で入力してください'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return

    setIsSaving(true)
    try {
      await onUpdate({
        sectionName,
        inputScope,
        isRequired,
        description: description.trim() || undefined,
        isActive,
      })
      setHasChanges(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setSectionName(section.sectionName)
    setInputScope(section.inputScope)
    setIsRequired(section.isRequired)
    setDescription(section.description ?? '')
    setIsActive(section.isActive)
    setHasChanges(false)
    setErrors({})
  }

  return (
    <Card className="border shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Layers className="h-5 w-5 text-primary" />
          セクション設定
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sectionCode">セクションコード</Label>
          <Input id="sectionCode" value={section.sectionCode} disabled className="bg-muted" />
          <p className="text-xs text-muted-foreground">セクションコードは変更できません</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sectionName">
            セクション名 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="sectionName"
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
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

        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="space-y-0.5">
            <Label htmlFor="isActive" className="cursor-pointer">
              有効にする
            </Label>
            <p className="text-xs text-muted-foreground">
              無効にすると、このセクションは表示されません
            </p>
          </div>
          <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            削除
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={!hasChanges || isSaving}
            >
              キャンセル
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
              {isSaving ? '保存中...' : '保存'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

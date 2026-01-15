'use client'

import type React from 'react'

import { useState } from 'react'
import { Button, Label, Textarea, RadioGroup, RadioGroupItem, Card } from '@/shared/ui'
import { GroupSubjectSelectDialog } from './GroupSubjectSelectDialog'
import type {
  BffGroupSubjectSelectTreeNode,
  BffCreateMappingRequest,
} from '@epm/contracts/bff/group-subject-mapping'
import type { BffClient } from '../api/BffClient'

interface CreateMappingFormProps {
  companySubjectId: string
  companySubjectCode: string
  companySubjectName: string
  companySubjectType: 'FIN' | 'KPI'
  isContra: boolean
  bffClient: BffClient
  onSubmit: (data: BffCreateMappingRequest) => void
  onCancel: () => void
}

export function CreateMappingForm({
  companySubjectId,
  companySubjectCode,
  companySubjectName,
  companySubjectType,
  isContra,
  bffClient,
  onSubmit,
  onCancel,
}: CreateMappingFormProps) {
  const [selectedGroupSubject, setSelectedGroupSubject] =
    useState<BffGroupSubjectSelectTreeNode | null>(null)
  const [coefficient, setCoefficient] = useState<'1' | '-1'>(isContra ? '-1' : '1')
  const [mappingNote, setMappingNote] = useState('')
  const [showSelectDialog, setShowSelectDialog] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGroupSubject) return

    onSubmit({
      companySubjectId,
      groupSubjectId: selectedGroupSubject.id,
      coefficient: coefficient === '1' ? 1 : -1,
      mappingNote: mappingNote || undefined,
    })
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-4 bg-muted">
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">会社科目</div>
            <div className="flex items-center gap-4">
              <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                {companySubjectCode}
              </code>
              <span className="text-sm font-medium">{companySubjectName}</span>
              {isContra && (
                <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded">
                  控除科目
                </span>
              )}
            </div>
          </div>
        </Card>

        <div>
          <Label className="text-sm font-medium mb-2 block">
            連結科目 <span className="text-destructive">*</span>
          </Label>
          {selectedGroupSubject ? (
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <code className="text-sm font-mono">{selectedGroupSubject.groupSubjectCode}</code>
                  <span className="text-sm font-medium">{selectedGroupSubject.groupSubjectName}</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSelectDialog(true)}
                >
                  変更
                </Button>
              </div>
            </Card>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => setShowSelectDialog(true)}
            >
              連結科目を選択
            </Button>
          )}
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">
            係数 <span className="text-destructive">*</span>
          </Label>
          <RadioGroup value={coefficient} onValueChange={(v) => setCoefficient(v as '1' | '-1')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="coeff-plus" />
              <Label htmlFor="coeff-plus" className="font-normal cursor-pointer">
                +1（通常）
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="-1" id="coeff-minus" />
              <Label htmlFor="coeff-minus" className="font-normal cursor-pointer">
                -1（控除・マイナス）
              </Label>
            </div>
          </RadioGroup>
          {isContra && (
            <p className="text-xs text-muted-foreground mt-2">
              ※ 控除科目のため、デフォルトで -1 が選択されています
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="note" className="text-sm font-medium mb-2 block">
            マッピングメモ
          </Label>
          <Textarea
            id="note"
            placeholder="マッピングに関するメモを入力（任意）"
            value={mappingNote}
            onChange={(e) => setMappingNote(e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            キャンセル
          </Button>
          <Button type="submit" disabled={!selectedGroupSubject}>
            登録
          </Button>
        </div>
      </form>

      <GroupSubjectSelectDialog
        open={showSelectDialog}
        onOpenChange={setShowSelectDialog}
        onSelect={setSelectedGroupSubject}
        bffClient={bffClient}
        recommendedType={companySubjectType}
      />
    </>
  )
}

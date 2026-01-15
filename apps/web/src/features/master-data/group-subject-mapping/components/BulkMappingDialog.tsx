'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Label,
  RadioGroup,
  RadioGroupItem,
  Card,
  ScrollArea,
  Badge,
} from '@/shared/ui'
import { CheckCircle2, XCircle } from 'lucide-react'
import { GroupSubjectSelectDialog } from './GroupSubjectSelectDialog'
import type {
  BffGroupSubjectSelectTreeNode,
  BffMappingListItem,
  BffBulkMappingResponse,
} from '@epm/contracts/bff/group-subject-mapping'
import type { BffClient } from '../api/BffClient'

interface BulkMappingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedSubjects: BffMappingListItem[]
  bffClient: BffClient
  onSuccess: () => void
}

export function BulkMappingDialog({
  open,
  onOpenChange,
  selectedSubjects,
  bffClient,
  onSuccess,
}: BulkMappingDialogProps) {
  const [selectedGroupSubject, setSelectedGroupSubject] =
    useState<BffGroupSubjectSelectTreeNode | null>(null)
  const [coefficient, setCoefficient] = useState<'1' | '-1'>('1')
  const [showSelectDialog, setShowSelectDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<BffBulkMappingResponse | null>(null)

  const handleSubmit = async () => {
    if (!selectedGroupSubject) return

    setIsSubmitting(true)
    try {
      const response = await bffClient.bulkCreateMapping({
        companySubjectIds: selectedSubjects.map((s) => s.companySubjectId),
        groupSubjectId: selectedGroupSubject.id,
        coefficient: coefficient === '1' ? 1 : -1,
      })
      setResult(response)
    } catch (error) {
      console.error('Bulk mapping failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (result) {
      onSuccess()
    }
    onOpenChange(false)
    setSelectedGroupSubject(null)
    setCoefficient('1')
    setResult(null)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>一括マッピング設定</DialogTitle>
          </DialogHeader>

          {!result ? (
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  選択された会社科目（{selectedSubjects.length}件）
                </Label>
                <ScrollArea className="h-32 border rounded-md">
                  <div className="p-3 space-y-2">
                    {selectedSubjects.map((subject) => (
                      <div
                        key={subject.companySubjectId}
                        className="flex items-center gap-3 text-sm"
                      >
                        <code className="font-mono text-xs">{subject.companySubjectCode}</code>
                        <span>{subject.companySubjectName}</span>
                        <Badge variant="secondary" className="text-xs">
                          {subject.companySubjectType}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">
                  マッピング先連結科目 <span className="text-destructive">*</span>
                </Label>
                {selectedGroupSubject ? (
                  <Card className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <code className="text-sm font-mono">
                          {selectedGroupSubject.groupSubjectCode}
                        </code>
                        <span className="text-sm font-medium">
                          {selectedGroupSubject.groupSubjectName}
                        </span>
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
                <RadioGroup
                  value={coefficient}
                  onValueChange={(v) => setCoefficient(v as '1' | '-1')}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="bulk-coeff-plus" />
                    <Label htmlFor="bulk-coeff-plus" className="font-normal cursor-pointer">
                      +1（通常）
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="-1" id="bulk-coeff-minus" />
                    <Label htmlFor="bulk-coeff-minus" className="font-normal cursor-pointer">
                      -1（控除・マイナス）
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Card className="p-4 bg-accent">
                <div className="flex items-center gap-4">
                  <CheckCircle2 className="h-8 w-8 text-primary flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-lg">一括マッピング完了</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {result.successCount}件のマッピングを設定しました
                    </div>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="text-sm text-muted-foreground mb-1">成功</div>
                  <div className="text-2xl font-semibold text-primary">{result.successCount}件</div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-muted-foreground mb-1">スキップ</div>
                  <div className="text-2xl font-semibold text-muted-foreground">
                    {result.skippedCount}件
                  </div>
                </Card>
              </div>

              {result.skippedCount > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    スキップされた科目（既存マッピング）
                  </Label>
                  <ScrollArea className="h-24 border rounded-md">
                    <div className="p-3 space-y-1">
                      {result.skippedSubjectIds.map((id) => {
                        const subject = selectedSubjects.find((s) => s.companySubjectId === id)
                        return subject ? (
                          <div
                            key={id}
                            className="flex items-center gap-2 text-sm text-muted-foreground"
                          >
                            <XCircle className="h-3 w-3" />
                            <code className="font-mono text-xs">{subject.companySubjectCode}</code>
                            <span>{subject.companySubjectName}</span>
                          </div>
                        ) : null
                      })}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {!result ? (
              <>
                <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                  キャンセル
                </Button>
                <Button onClick={handleSubmit} disabled={!selectedGroupSubject || isSubmitting}>
                  {isSubmitting ? '実行中...' : '実行'}
                </Button>
              </>
            ) : (
              <Button onClick={handleClose}>閉じる</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <GroupSubjectSelectDialog
        open={showSelectDialog}
        onOpenChange={setShowSelectDialog}
        onSelect={setSelectedGroupSubject}
        bffClient={bffClient}
      />
    </>
  )
}

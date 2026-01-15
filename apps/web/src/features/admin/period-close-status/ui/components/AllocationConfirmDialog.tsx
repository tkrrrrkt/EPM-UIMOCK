'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui'
import { Calculator, Play, Eye } from 'lucide-react'
import type { BffRunAllocationResponse, BffAllocationResultItem } from '@epm/contracts/bff/period-close-status'

interface AllocationConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  periodLabel: string
  onExecute: (dryRun: boolean) => Promise<BffRunAllocationResponse>
  loading?: boolean
}

function formatAmount(amount: number): string {
  return amount.toLocaleString('ja-JP')
}

export function AllocationConfirmDialog({
  open,
  onOpenChange,
  periodLabel,
  onExecute,
  loading,
}: AllocationConfirmDialogProps) {
  const [previewResult, setPreviewResult] = useState<BffRunAllocationResponse | null>(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [isExecuteLoading, setIsExecuteLoading] = useState(false)

  const handlePreview = async () => {
    setIsPreviewLoading(true)
    try {
      const result = await onExecute(true)
      setPreviewResult(result)
    } finally {
      setIsPreviewLoading(false)
    }
  }

  const handleExecute = async () => {
    setIsExecuteLoading(true)
    try {
      const result = await onExecute(false)
      if (result.success) {
        onOpenChange(false)
        setPreviewResult(null)
      }
    } finally {
      setIsExecuteLoading(false)
    }
  }

  const handleClose = () => {
    setPreviewResult(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            配賦処理の実行
          </DialogTitle>
          <DialogDescription>
            <span className="font-medium">{periodLabel}</span>の配賦処理を実行します。
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {!previewResult && (
            <div className="text-sm text-muted-foreground space-y-2">
              <p>配賦マスタに登録されているルールに従って、対象科目の金額を配賦します。</p>
              <p>まずプレビューで配賦内容を確認してから実行することをお勧めします。</p>
            </div>
          )}

          {previewResult && (
            <div className="space-y-4">
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>配賦ルール</TableHead>
                      <TableHead className="text-right">配賦元金額</TableHead>
                      <TableHead className="text-right">配賦金額</TableHead>
                      <TableHead className="text-right">配賦先数</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewResult.results.map((item: BffAllocationResultItem) => (
                      <TableRow key={item.allocationRuleId}>
                        <TableCell>{item.allocationRuleName}</TableCell>
                        <TableCell className="text-right font-mono">
                          ¥{formatAmount(item.sourceAmount)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          ¥{formatAmount(item.allocatedAmount)}
                        </TableCell>
                        <TableCell className="text-right">{item.targetCount}件</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">配賦元合計:</span>{' '}
                  <span className="font-mono font-medium">¥{formatAmount(previewResult.totalSourceAmount)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">配賦金額合計:</span>{' '}
                  <span className="font-mono font-medium">¥{formatAmount(previewResult.totalAllocatedAmount)}</span>
                </div>
              </div>

              <p className="text-sm text-amber-600">
                上記の内容で配賦を実行します。実行すると取り消しできません。
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading || isPreviewLoading || isExecuteLoading}>
            キャンセル
          </Button>
          {!previewResult ? (
            <Button onClick={handlePreview} disabled={loading || isPreviewLoading}>
              <Eye className="h-4 w-4 mr-1" />
              {isPreviewLoading ? 'プレビュー中...' : 'プレビュー'}
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handlePreview} disabled={loading || isPreviewLoading || isExecuteLoading}>
                <Eye className="h-4 w-4 mr-1" />
                再プレビュー
              </Button>
              <Button onClick={handleExecute} disabled={loading || isExecuteLoading}>
                <Play className="h-4 w-4 mr-1" />
                {isExecuteLoading ? '実行中...' : '配賦を実行'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

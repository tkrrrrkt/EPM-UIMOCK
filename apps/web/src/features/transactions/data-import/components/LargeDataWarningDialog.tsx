"use client"

import * as React from "react"
import { AlertTriangle, Layers, ArrowRight, X } from "lucide-react"

import { Button } from "@/shared/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/components/dialog"
import { Alert, AlertDescription } from "@/shared/ui/components/alert"

import { LARGE_DATA_THRESHOLD } from "@epm/contracts/bff/data-import"

interface LargeDataWarningDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rowCount: number
  onAggregate: () => void
  onContinue: () => void
  onCancel: () => void
  isAggregating?: boolean
}

export function LargeDataWarningDialog({
  open,
  onOpenChange,
  rowCount,
  onAggregate,
  onContinue,
  onCancel,
  isAggregating = false,
}: LargeDataWarningDialogProps) {
  const handleAggregate = () => {
    onAggregate()
  }

  const handleContinue = () => {
    onContinue()
  }

  const handleCancel = () => {
    onCancel()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <DialogTitle>大量データの検出</DialogTitle>
              <DialogDescription className="mt-1">
                データ処理方法を選択してください
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">取込データ行数</span>
              <span className="text-lg font-semibold tabular-nums">
                {rowCount.toLocaleString()} 行
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">閾値</span>
              <span className="text-sm font-medium">
                {LARGE_DATA_THRESHOLD.toLocaleString()} 行
              </span>
            </div>
          </div>

          <Alert variant="default" className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              {rowCount.toLocaleString()} 行のデータがあります。
              パフォーマンス確保のため、事前集計を推奨します。
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            {/* 推奨オプション: 集計して続行 */}
            <button
              onClick={handleAggregate}
              disabled={isAggregating}
              className="w-full flex items-start gap-4 p-4 rounded-lg border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-colors text-left disabled:opacity-50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Layers className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">集計して続行</span>
                  <span className="px-1.5 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded">
                    推奨
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  同一キー（科目・部門・期間）の行を集計し、行数を削減します。
                  明細情報（摘要等）は失われます。
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-primary shrink-0 mt-2.5" />
            </button>

            {/* そのまま続行 */}
            <button
              onClick={handleContinue}
              disabled={isAggregating}
              className="w-full flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left disabled:opacity-50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium">そのまま続行</span>
                <p className="mt-1 text-sm text-muted-foreground">
                  集計せずに全行をプレビュー表示します。
                  処理に時間がかかる場合があります。
                </p>
              </div>
            </button>
          </div>
        </div>

        <DialogFooter className="sm:justify-start">
          <Button
            variant="ghost"
            onClick={handleCancel}
            disabled={isAggregating}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            キャンセル
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default LargeDataWarningDialog

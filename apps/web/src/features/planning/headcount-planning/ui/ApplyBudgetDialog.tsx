"use client"

import { useState } from "react"
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  Button,
  Alert,
  AlertDescription,
} from "@/shared/ui"
import { useBffClient } from "../lib/bff-client-provider"
import { BffClientError } from "../api/BffClient"
import { getErrorMessage } from "../lib/error-messages"
import type { BffApplyBudgetResponse } from "@epm/contracts/bff/headcount-planning"
import type { SearchParams } from "./SearchPanel"

interface ApplyBudgetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  searchParams: SearchParams | null
  onSuccess: () => void
}

type ApplyState = "confirm" | "processing" | "success" | "error"

export function ApplyBudgetDialog({
  open,
  onOpenChange,
  searchParams,
  onSuccess,
}: ApplyBudgetDialogProps) {
  const client = useBffClient()
  const [state, setState] = useState<ApplyState>("confirm")
  const [result, setResult] = useState<BffApplyBudgetResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleApply = async () => {
    if (!searchParams) return

    try {
      setState("processing")
      setError(null)

      const response = await client.applyBudget({
        companyId: searchParams.companyId,
        planEventId: searchParams.planEventId,
        planVersionId: searchParams.planVersionId,
      })

      setResult(response)
      setState("success")
      onSuccess()
    } catch (err) {
      if (err instanceof BffClientError) {
        setError(getErrorMessage(err.error.code))
      } else {
        setError("予算反映に失敗しました")
      }
      setState("error")
    }
  }

  const handleClose = () => {
    setState("confirm")
    setResult(null)
    setError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>予算反映</DialogTitle>
          {state === "confirm" && (
            <DialogDescription>
              人員計画データを予算データに反映します。この操作により既存の人件費予算データは上書きされます。
            </DialogDescription>
          )}
        </DialogHeader>

        {state === "confirm" && (
          <>
            <div className="space-y-4 py-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc ml-4 space-y-1">
                    <li>この操作は元に戻せません</li>
                    <li>対象期間の人件費予算が全て置き換わります</li>
                    <li>配賦設定に基づいて各部門に予算が配分されます</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                キャンセル
              </Button>
              <Button onClick={handleApply}>予算に反映する</Button>
            </DialogFooter>
          </>
        )}

        {state === "processing" && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">予算データを反映中...</p>
          </div>
        )}

        {state === "success" && result && (
          <>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium">予算反映が完了しました</p>
                  <p className="text-sm text-muted-foreground">
                    人員計画データが予算に反映されました
                  </p>
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>影響を受けたレコード数</span>
                  <span className="font-mono">{result.affectedCount}件</span>
                </div>
                <div className="flex justify-between">
                  <span>削除されたレコード数</span>
                  <span className="font-mono">{result.deletedCount}件</span>
                </div>
                <div className="flex justify-between">
                  <span>追加されたレコード数</span>
                  <span className="font-mono">{result.insertedCount}件</span>
                </div>
              </div>

              {result.warnings && result.warnings.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium mb-1">警告</p>
                    <ul className="list-disc ml-4 space-y-1">
                      {result.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button onClick={handleClose}>閉じる</Button>
            </DialogFooter>
          </>
        )}

        {state === "error" && (
          <>
            <div className="space-y-4 py-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                閉じる
              </Button>
              <Button onClick={() => setState("confirm")}>再試行</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

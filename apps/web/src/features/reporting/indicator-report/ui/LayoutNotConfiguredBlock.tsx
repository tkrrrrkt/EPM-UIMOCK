"use client"

// ============================================================
// LayoutNotConfiguredBlock - Display when layout is not configured
// ============================================================

import { AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/shared/ui"

export function LayoutNotConfiguredBlock() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <Card className="w-full max-w-lg border-border bg-card">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <AlertTriangle className="size-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              レイアウトが設定されていません
            </h2>
            <p className="text-sm text-muted-foreground">
              財務指標分析レポートを表示するには、管理者がレイアウトを設定する
              <br />
              必要があります。システム管理者にお問い合わせください。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

// ============================================================
// RequiredFieldsBlock - Display when required fields are not selected
// ============================================================

import { Info } from "lucide-react"
import { Card, CardContent } from "@/shared/ui"

export function RequiredFieldsBlock() {
  return (
    <Card className="flex h-full min-h-80 items-center justify-center border-dashed border-border bg-muted/30">
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
          <Info className="size-7 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-foreground">
            必須項目を選択してください
          </h3>
          <p className="text-sm text-muted-foreground">
            年度 / Primary / 期間 / 粒度 / 部門 が揃うまで
            <br />
            レポートは表示されません
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import type { BffLineSummary } from "@epm/contracts/bff/report-layout"
import { Alert, AlertDescription } from "@/shared/ui"

interface LayoutPreviewProps {
  lines: BffLineSummary[]
}

export function LayoutPreview({ lines }: LayoutPreviewProps) {
  if (lines.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">プレビューする行がありません</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <Alert>
        <AlertDescription>レイアウトのプレビューです。実際の金額は表示されません。</AlertDescription>
      </Alert>

      <div className="border rounded-lg p-6 bg-background">
        <div className="flex flex-col gap-1 font-mono text-sm">
          {lines.map((line) => {
            const indentPadding = `${line.indentLevel * 2}rem`

            if (line.lineType === "blank") {
              return <div key={line.id} className="h-4" />
            }

            if (line.lineType === "header") {
              return (
                <div
                  key={line.id}
                  style={{ paddingLeft: indentPadding }}
                  className={`text-base ${line.isBold ? "font-bold" : ""}`}
                >
                  {line.displayName}
                </div>
              )
            }

            if (line.lineType === "note") {
              return (
                <div
                  key={line.id}
                  style={{ paddingLeft: indentPadding }}
                  className={`italic text-muted-foreground text-xs ${line.isBold ? "font-bold" : ""}`}
                >
                  {line.displayName}
                </div>
              )
            }

            if (line.lineType === "account") {
              return (
                <div
                  key={line.id}
                  style={{ paddingLeft: indentPadding }}
                  className={`flex justify-between ${line.isBold ? "font-bold" : ""}`}
                >
                  <span>{line.displayName || line.subjectName}</span>
                  <span className="text-muted-foreground">¥0</span>
                </div>
              )
            }

            return null
          })}
        </div>
      </div>
    </div>
  )
}

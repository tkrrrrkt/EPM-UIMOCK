"use client"

import * as React from "react"
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/components/card"
import { Badge } from "@/shared/ui/components/badge"
import { Button } from "@/shared/ui/components/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/components/collapsible"
import { cn } from "@/lib/utils"

import type {
  BffValidationError,
  ValidationErrorType,
  ValidationSeverity,
} from "@epm/contracts/bff/data-import"

// エラータイプの日本語ラベル
const ERROR_TYPE_LABELS: Record<ValidationErrorType, string> = {
  REQUIRED: "必須項目",
  FORMAT: "形式エラー",
  MAPPING: "マッピングエラー",
  RANGE: "範囲エラー",
}

interface ValidationSummaryProps {
  status: "VALID" | "HAS_ERRORS" | "HAS_WARNINGS"
  summary: {
    totalRows: number
    validRows: number
    errorRows: number
    warningRows: number
    excludedRows: number
  }
  errors: BffValidationError[]
  onJumpToRow?: (rowIndex: number) => void
}

export function ValidationSummary({
  status,
  summary,
  errors,
  onJumpToRow,
}: ValidationSummaryProps) {
  const [isErrorListOpen, setIsErrorListOpen] = React.useState(true)

  // エラーをタイプ別にグループ化
  const errorsByType = React.useMemo(() => {
    const grouped = new Map<ValidationErrorType, BffValidationError[]>()
    errors.forEach((error) => {
      const existing = grouped.get(error.errorType) || []
      grouped.set(error.errorType, [...existing, error])
    })
    return grouped
  }, [errors])

  // 重大度でエラーをフィルタ
  const criticalErrors = errors.filter((e) => e.severity === "ERROR")
  const warnings = errors.filter((e) => e.severity === "WARNING")

  const getStatusIcon = () => {
    switch (status) {
      case "VALID":
        return <CheckCircle2 className="h-6 w-6 text-green-500" />
      case "HAS_ERRORS":
        return <XCircle className="h-6 w-6 text-red-500" />
      case "HAS_WARNINGS":
        return <AlertTriangle className="h-6 w-6 text-amber-500" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case "VALID":
        return "検証OK - 取込可能です"
      case "HAS_ERRORS":
        return "エラーあり - 修正が必要です"
      case "HAS_WARNINGS":
        return "警告あり - 確認してください"
    }
  }

  const getStatusBgColor = () => {
    switch (status) {
      case "VALID":
        return "bg-green-50 border-green-200"
      case "HAS_ERRORS":
        return "bg-red-50 border-red-200"
      case "HAS_WARNINGS":
        return "bg-amber-50 border-amber-200"
    }
  }

  return (
    <div className="space-y-4">
      {/* ステータスカード */}
      <Card className={cn("border-2", getStatusBgColor())}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            {getStatusIcon()}
            <div className="flex-1">
              <h3 className="font-semibold">{getStatusText()}</h3>
              <p className="text-sm text-muted-foreground">
                {summary.totalRows.toLocaleString()} 行中、
                {summary.validRows.toLocaleString()} 行が有効です
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* サマリー統計 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-green-600 tabular-nums">
              {summary.validRows.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">正常</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-red-600 tabular-nums">
              {summary.errorRows.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">エラー</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-amber-600 tabular-nums">
              {summary.warningRows.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">警告</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-2xl font-bold text-gray-500 tabular-nums">
              {summary.excludedRows.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">除外</div>
          </CardContent>
        </Card>
      </div>

      {/* エラー詳細リスト */}
      {errors.length > 0 && (
        <Collapsible open={isErrorListOpen} onOpenChange={setIsErrorListOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isErrorListOpen ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <CardTitle className="text-base">エラー詳細</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    {criticalErrors.length > 0 && (
                      <Badge variant="destructive">
                        エラー {criticalErrors.length}
                      </Badge>
                    )}
                    {warnings.length > 0 && (
                      <Badge variant="outline" className="border-amber-300 text-amber-600">
                        警告 {warnings.length}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {Array.from(errorsByType.entries()).map(([errorType, typeErrors]) => (
                    <div key={errorType} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {ERROR_TYPE_LABELS[errorType]}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {typeErrors.length} 件
                        </span>
                      </div>
                      <div className="space-y-1 pl-4">
                        {typeErrors.slice(0, 10).map((error, idx) => (
                          <div
                            key={`${error.rowIndex}-${error.columnKey}-${idx}`}
                            className={cn(
                              "flex items-start gap-3 p-2 rounded-md text-sm",
                              error.severity === "ERROR"
                                ? "bg-red-50"
                                : "bg-amber-50"
                            )}
                          >
                            {error.severity === "ERROR" ? (
                              <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">行 {error.rowIndex + 1}</span>
                                <span className="text-muted-foreground">-</span>
                                <code className="px-1 py-0.5 bg-muted rounded text-xs">
                                  {error.columnKey}
                                </code>
                              </div>
                              <p className="text-muted-foreground mt-0.5">
                                {error.message}
                              </p>
                              {error.suggestion && (
                                <p className="text-xs text-primary mt-1">
                                  💡 提案: {error.suggestion}
                                </p>
                              )}
                            </div>
                            {onJumpToRow && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onJumpToRow(error.rowIndex)}
                                className="shrink-0"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                        {typeErrors.length > 10 && (
                          <p className="text-xs text-muted-foreground pl-7">
                            ... 他 {typeErrors.length - 10} 件
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
    </div>
  )
}

export default ValidationSummary

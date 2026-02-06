"use client"

import * as React from "react"
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  GitCompare,
  PlayCircle,
  RotateCcw,
  Settings2,
} from "lucide-react"

import { Button } from "@/shared/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/components/card"
import { Badge } from "@/shared/ui/components/badge"
import { Separator } from "@/shared/ui/components/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/components/alert-dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/ui/components/sheet"

import type { BffClient } from "../api/BffClient"
import type {
  ImportType,
  BffStagingRow,
  BffStagingColumn,
  BffColumnMapping,
  BffCodeMapping,
  BffSubjectForMapping,
  BffDepartmentForMapping,
  BffTemplate,
  BffValidationError,
} from "@epm/contracts/bff/data-import"
import { LARGE_DATA_THRESHOLD } from "@epm/contracts/bff/data-import"
import { getErrorMessage } from "../error-messages"

import { ImportPreviewGrid } from "./ImportPreviewGrid"
import { LargeDataWarningDialog } from "./LargeDataWarningDialog"
import { MappingPanel } from "./MappingPanel"
import { ValidationSummary } from "./ValidationSummary"

interface StagingSummary {
  totalRows: number
  includedRows: number
  excludedRows: number
  validRows?: number
  errorRows?: number
  warningRows?: number
}

interface StagingSectionProps {
  bffClient: BffClient
  batchId: string
  importType: ImportType
  eventName: string
  versionName: string
  onBack: () => void
  onComplete: () => void
}

// ステージングのサブステップ
type StagingSubStep = "large-data-warning" | "mapping" | "preview" | "complete"

interface StagingState {
  subStep: StagingSubStep
  columns: BffStagingColumn[]
  rows: BffStagingRow[]
  summary: StagingSummary | null
  isLoading: boolean
  isValidating: boolean
  isExecuting: boolean
  isAggregating: boolean
  error: string | null
  validationResult: "VALID" | "HAS_ERRORS" | "HAS_WARNINGS" | null
  validationErrors: BffValidationError[]
  showExecuteDialog: boolean
  showMappingSheet: boolean
  executeResult: {
    status: "COMPLETED" | "FAILED"
    importedRows: number
    excludedRows: number
    message: string
  } | null
  // 大量データ検出
  detectedRowCount: number | null
  needsAggregation: boolean
  // マッピング関連
  columnMappings: BffColumnMapping[]
  subjectCodes: BffCodeMapping[]
  departmentCodes: BffCodeMapping[]
  templates: BffTemplate[]
  subjects: BffSubjectForMapping[]
  departments: BffDepartmentForMapping[]
  selectedTemplateCode: string | null
  saveMapping: boolean
  saveMappingName: string
}

const initialState: StagingState = {
  subStep: "preview",
  columns: [],
  rows: [],
  summary: null,
  isLoading: true,
  isValidating: false,
  isExecuting: false,
  isAggregating: false,
  error: null,
  validationResult: null,
  validationErrors: [],
  showExecuteDialog: false,
  showMappingSheet: false,
  executeResult: null,
  detectedRowCount: null,
  needsAggregation: false,
  columnMappings: [],
  subjectCodes: [],
  departmentCodes: [],
  templates: [],
  subjects: [],
  departments: [],
  selectedTemplateCode: null,
  saveMapping: false,
  saveMappingName: "",
}

export function StagingSection({
  bffClient,
  batchId,
  importType,
  eventName,
  versionName,
  onBack,
  onComplete,
}: StagingSectionProps) {
  const [state, setState] = React.useState<StagingState>(initialState)

  // ステージングデータの取得
  React.useEffect(() => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    bffClient
      .getStaging({ batchId })
      .then(res => {
        setState(prev => ({
          ...prev,
          columns: res.columns,
          rows: res.rows,
          summary: res.summary,
          isLoading: false,
        }))
      })
      .catch(err => {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: getErrorMessage(err),
        }))
      })
  }, [bffClient, batchId])

  // マッピングデータとマスタデータの取得
  React.useEffect(() => {
    // 並行して取得
    Promise.all([
      bffClient.getPreMapping({ batchId }),
      bffClient.getMappingMaster(),
      bffClient.getTemplates({ includeSystem: true }),
    ])
      .then(([preMapping, masterData, templatesRes]) => {
        setState(prev => ({
          ...prev,
          columnMappings: preMapping.columnMappings,
          subjectCodes: preMapping.subjectCodes,
          departmentCodes: preMapping.departmentCodes,
          subjects: masterData.subjects,
          departments: masterData.departments,
          templates: templatesRes.templates,
        }))
      })
      .catch(err => {
        console.error("Failed to load mapping data:", err)
      })
  }, [bffClient, batchId])

  // 行の除外状態変更
  const handleRowExcludedChange = React.useCallback(async (rowIndex: number, excluded: boolean) => {
    // ローカル状態を即座に更新
    setState(prev => ({
      ...prev,
      rows: prev.rows.map((row, idx) =>
        idx === rowIndex ? { ...row, excluded } : row
      ),
      summary: prev.summary ? {
        ...prev.summary,
        includedRows: prev.summary.includedRows + (excluded ? -1 : 1),
        excludedRows: prev.summary.excludedRows + (excluded ? 1 : -1),
      } : null,
      validationResult: null, // 変更があったら検証結果をリセット
    }))

    // サーバーに同期
    try {
      await bffClient.updateStaging({
        batchId,
        updates: [{ rowIndex, excluded }],
      })
    } catch (err) {
      console.error("Failed to update staging:", err)
    }
  }, [bffClient, batchId])

  // セル値変更
  const handleCellChange = React.useCallback(async (
    rowIndex: number,
    columnKey: string,
    value: string | null
  ) => {
    // ローカル状態を即座に更新
    setState(prev => ({
      ...prev,
      rows: prev.rows.map((row, idx) =>
        idx === rowIndex
          ? { ...row, cells: { ...row.cells, [columnKey]: value } }
          : row
      ),
      validationResult: null, // 変更があったら検証結果をリセット
    }))

    // サーバーに同期
    try {
      await bffClient.updateStaging({
        batchId,
        updates: [{ rowIndex, cells: { [columnKey]: value } }],
      })
    } catch (err) {
      console.error("Failed to update staging:", err)
    }
  }, [bffClient, batchId])

  // 行へのジャンプ処理（ValidationSummaryから呼ばれる）
  // NOTE: Hooksは条件付きreturnの前に配置する必要がある
  const handleJumpToRow = React.useCallback((rowIndex: number) => {
    // AG-GridへのスクロールはgridのensureIndexVisibleを呼ぶ必要があるが
    // 現在のコンポーネント構造ではrefを渡していないため、将来の拡張として残す
    console.log("[handleJumpToRow] Jump to row:", rowIndex)
  }, [])

  // 検証実行
  const handleValidate = async () => {
    console.log("[handleValidate] Start validation for batchId:", batchId)
    setState(prev => ({ ...prev, isValidating: true, error: null }))
    try {
      console.log("[handleValidate] Calling bffClient.validate...")
      const result = await bffClient.validate({ batchId })
      console.log("[handleValidate] Validation result:", result)

      // Map API status to UI status
      const mappedStatus = result.status === "VALID"
        ? "VALID" as const
        : result.summary.errorRows > 0
          ? "HAS_ERRORS" as const
          : "HAS_WARNINGS" as const

      setState(prev => ({
        ...prev,
        isValidating: false,
        validationResult: mappedStatus,
        validationErrors: result.errors,
        rows: prev.rows.map(row => {
          const error = result.errors.find(e => e.rowIndex === row.rowIndex)
          if (error) {
            return { ...row, validationStatus: error.severity === "ERROR" ? "ERROR" as const : "WARNING" as const }
          }
          return { ...row, validationStatus: "OK" as const }
        }),
        summary: prev.summary ? {
          ...prev.summary,
          validRows: result.summary.validRows,
          errorRows: result.summary.errorRows,
          warningRows: result.summary.warningRows,
        } : null,
      }))
    } catch (err) {
      setState(prev => ({
        ...prev,
        isValidating: false,
        error: getErrorMessage(err),
      }))
    }
  }

  // 取込実行
  const handleExecute = async () => {
    setState(prev => ({ ...prev, isExecuting: true, showExecuteDialog: false, error: null }))
    try {
      const result = await bffClient.execute({ batchId, overwrite: true })
      setState(prev => ({
        ...prev,
        isExecuting: false,
        executeResult: {
          status: result.status,
          importedRows: result.importedRows,
          excludedRows: result.excludedRows,
          message: result.message ?? "取込が完了しました",
        },
      }))
    } catch (err) {
      setState(prev => ({
        ...prev,
        isExecuting: false,
        error: getErrorMessage(err),
      }))
    }
  }

  // 全除外の復元
  const handleRestoreAll = async () => {
    const excludedRows = state.rows
      .map((row, idx) => (row.excluded ? idx : -1))
      .filter(idx => idx >= 0)

    if (excludedRows.length === 0) return

    // ローカル状態を更新
    setState(prev => ({
      ...prev,
      rows: prev.rows.map(row => ({ ...row, excluded: false })),
      summary: prev.summary ? {
        ...prev.summary,
        includedRows: prev.summary.totalRows,
        excludedRows: 0,
      } : null,
      validationResult: null,
    }))

    // サーバーに同期
    try {
      await bffClient.updateStaging({
        batchId,
        updates: excludedRows.map(rowIndex => ({ rowIndex, excluded: false })),
      })
    } catch (err) {
      console.error("Failed to restore all rows:", err)
    }
  }

  const getImportTypeLabel = (type: ImportType) => {
    switch (type) {
      case "BUDGET": return "予算"
      case "FORECAST": return "見込"
      case "ACTUAL": return "実績"
      default: return type
    }
  }

  // 完了結果表示
  if (state.executeResult) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            {state.executeResult.status === "COMPLETED" ? (
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            ) : (
              <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            )}
            <CardTitle>
              {state.executeResult.status === "COMPLETED"
                ? "取込が完了しました"
                : "取込に失敗しました"}
            </CardTitle>
            <CardDescription>{state.executeResult.message}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {state.executeResult.importedRows.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">取込件数</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-gray-500">
                  {state.executeResult.excludedRows.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">除外件数</div>
              </div>
            </div>

            <Separator />

            <div className="text-sm text-muted-foreground">
              <p>取込先: {getImportTypeLabel(importType)} / {eventName} / {versionName}</p>
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <Button variant="outline" onClick={onBack}>
                新しい取込を開始
              </Button>
              <Button onClick={onComplete}>
                閉じる
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">データを読み込み中...</p>
        </div>
      </div>
    )
  }

  if (state.error && !state.rows.length) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="py-8 text-center space-y-4">
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <p className="text-sm text-destructive">{state.error}</p>
            <Button variant="outline" onClick={onBack}>
              戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const excludedCount = state.summary?.excludedRows ?? 0
  const canExecute = state.validationResult === "VALID" || state.validationResult === "HAS_WARNINGS"

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="font-semibold">ステージング</h2>
            <p className="text-sm text-muted-foreground">
              {getImportTypeLabel(importType)} / {eventName} / {versionName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* マッピング設定シート */}
          <Sheet
            open={state.showMappingSheet}
            onOpenChange={(open) => setState(prev => ({ ...prev, showMappingSheet: open }))}
          >
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="h-4 w-4 mr-1" />
                マッピング設定
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-3xl w-[800px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>カラムマッピング設定</SheetTitle>
                <SheetDescription>
                  取込ファイルの列とシステム項目のマッピングを確認・変更できます
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <MappingPanel
                  columnMappings={state.columnMappings}
                  subjectCodes={state.subjectCodes}
                  departmentCodes={state.departmentCodes}
                  templates={state.templates}
                  subjects={state.subjects}
                  departments={state.departments}
                  selectedTemplateCode={state.selectedTemplateCode ?? undefined}
                  saveMapping={state.saveMapping}
                  saveMappingName={state.saveMappingName}
                  onColumnMappingChange={(idx, target) => {
                    setState(prev => ({
                      ...prev,
                      columnMappings: prev.columnMappings.map((m, i) =>
                        i === idx ? { ...m, mappingTarget: target } : m
                      ),
                    }))
                  }}
                  onCodeMappingChange={(type, sourceValue, targetId) => {
                    if (type === "subject") {
                      setState(prev => ({
                        ...prev,
                        subjectCodes: prev.subjectCodes.map(c =>
                          c.sourceValue === sourceValue
                            ? { ...c, targetId, status: targetId ? "MAPPED" : "UNMAPPED" }
                            : c
                        ),
                      }))
                    } else {
                      setState(prev => ({
                        ...prev,
                        departmentCodes: prev.departmentCodes.map(c =>
                          c.sourceValue === sourceValue
                            ? { ...c, targetId, status: targetId ? "MAPPED" : "UNMAPPED" }
                            : c
                        ),
                      }))
                    }
                  }}
                  onTemplateSelect={(code) => {
                    setState(prev => ({ ...prev, selectedTemplateCode: code ?? null }))
                  }}
                  onSaveMappingChange={(save) => {
                    setState(prev => ({ ...prev, saveMapping: save }))
                  }}
                  onSaveMappingNameChange={(name) => {
                    setState(prev => ({ ...prev, saveMappingName: name }))
                  }}
                  onApply={async () => {
                    setState(prev => ({ ...prev, showMappingSheet: false }))
                  }}
                  isApplying={false}
                />
              </div>
            </SheetContent>
          </Sheet>

          {excludedCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleRestoreAll}>
              <RotateCcw className="h-4 w-4 mr-1" />
              除外を全解除
            </Button>
          )}
        </div>
      </div>

      {/* Summary Bar */}
      <div className="flex items-center gap-6 p-3 bg-muted/50 rounded-lg text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">総件数:</span>
          <span className="font-medium">{state.summary?.totalRows.toLocaleString() ?? 0}</span>
        </div>
        <Separator orientation="vertical" className="h-4" />
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="text-muted-foreground">取込対象:</span>
          <span className="font-medium text-green-600">
            {state.summary?.includedRows.toLocaleString() ?? 0}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <XCircle className="h-4 w-4 text-gray-400" />
          <span className="text-muted-foreground">除外:</span>
          <span className="font-medium text-gray-500">
            {excludedCount.toLocaleString()}
          </span>
        </div>
        {state.validationResult && (
          <>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2">
              {state.validationResult === "VALID" ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  検証OK
                </Badge>
              ) : state.validationResult === "HAS_WARNINGS" ? (
                <Badge variant="outline" className="border-amber-300 text-amber-600">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  警告あり
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  エラーあり
                </Badge>
              )}
            </div>
          </>
        )}
      </div>

      {/* Validation Summary（検証結果がある場合のみ表示） */}
      {state.validationResult && state.summary && (
        <ValidationSummary
          status={state.validationResult}
          summary={{
            totalRows: state.summary.totalRows,
            validRows: state.summary.validRows ?? 0,
            errorRows: state.summary.errorRows ?? 0,
            warningRows: state.summary.warningRows ?? 0,
            excludedRows: state.summary.excludedRows,
          }}
          errors={state.validationErrors}
          onJumpToRow={handleJumpToRow}
        />
      )}

      {/* Error Display */}
      {state.error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          {state.error}
        </div>
      )}

      {/* Grid - AG-Grid ベースの ImportPreviewGrid を使用 */}
      <div className="border rounded-lg overflow-hidden">
        <ImportPreviewGrid
          columns={state.columns}
          rows={state.rows}
          onRowExcludedChange={handleRowExcludedChange}
          onCellChange={handleCellChange}
          height={450}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-muted-foreground">
          チェックボックスをOFFにすると、その行は取込対象から除外されます
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleValidate}
            disabled={state.isValidating || state.isExecuting}
          >
            {state.isValidating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <GitCompare className="h-4 w-4 mr-2" />
            )}
            検証
          </Button>

          <Button
            onClick={() => setState(prev => ({ ...prev, showExecuteDialog: true }))}
            disabled={!canExecute || state.isExecuting}
          >
            {state.isExecuting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <PlayCircle className="h-4 w-4 mr-2" />
            )}
            取込実行
          </Button>
        </div>
      </div>

      {/* Execute Confirmation Dialog */}
      <AlertDialog
        open={state.showExecuteDialog}
        onOpenChange={(open) => setState(prev => ({ ...prev, showExecuteDialog: open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>データを取り込みますか？</AlertDialogTitle>
            <AlertDialogDescription>
              以下の内容で取込を実行します。
              <div className="mt-4 p-3 bg-muted rounded-md space-y-1 text-sm">
                <p>取込先: {getImportTypeLabel(importType)} / {eventName} / {versionName}</p>
                <p>取込件数: {state.summary?.includedRows.toLocaleString() ?? 0}件</p>
                {excludedCount > 0 && (
                  <p className="text-muted-foreground">除外: {excludedCount.toLocaleString()}件</p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleExecute}>
              取込実行
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

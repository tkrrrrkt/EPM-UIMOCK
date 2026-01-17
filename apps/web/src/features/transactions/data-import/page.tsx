"use client"

import * as React from "react"
import { ArrowLeft, ChevronRight, FileUp, History, Info, Loader2 } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Button } from "@/shared/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/components/card"
import { Label } from "@/shared/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/components/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/components/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui/components/tooltip"
import { Badge } from "@/shared/ui/components/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/components/table"
import { Separator } from "@/shared/ui/components/separator"

import { ImportDropzone } from "./components/ImportDropzone"
import { StagingSection } from "./components/StagingSection"
import { MockBffClient } from "./api/MockBffClient"
import type { BffClient } from "./api/BffClient"
import type {
  ImportType,
  BffImportContextResponse,
  BffImportHistoryItem,
} from "@epm/contracts/bff/data-import"
import { getErrorMessage } from "./error-messages"

// BffClient instance
const bffClient: BffClient = new MockBffClient()

type ImportStep = "select" | "upload" | "staging" | "complete"

interface ImportState {
  step: ImportStep
  importType: ImportType | null
  eventId: string | null
  eventName: string | null
  versionId: string | null
  versionName: string | null
  templateCode: string | null
  batchId: string | null
  isLoading: boolean
  error: string | null
}

const initialState: ImportState = {
  step: "select",
  importType: null,
  eventId: null,
  eventName: null,
  versionId: null,
  versionName: null,
  templateCode: null,
  batchId: null,
  isLoading: false,
  error: null,
}

export default function DataImportPage() {
  const [activeTab, setActiveTab] = React.useState<"import" | "history">("import")

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold">データ取込</h1>
              <p className="text-sm text-muted-foreground">
                予算・見込・実績データをファイルまたはコピペで取り込みます
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "import" | "history")}>
          <TabsList className="mb-6">
            <TabsTrigger value="import" className="gap-2">
              <FileUp className="h-4 w-4" />
              データ取込
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              取込履歴
            </TabsTrigger>
          </TabsList>

          <TabsContent value="import">
            <ImportSection />
          </TabsContent>

          <TabsContent value="history">
            <HistorySection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function ImportSection() {
  const [state, setState] = React.useState<ImportState>(initialState)
  const [context, setContext] = React.useState<BffImportContextResponse | null>(null)

  // Fetch context when import type changes
  React.useEffect(() => {
    if (state.importType) {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      bffClient
        .getContext({ importType: state.importType })
        .then(ctx => {
          setContext(ctx)
          const firstEvent = ctx.events[0]
          const firstVersion = ctx.versions[0]
          setState(prev => ({
            ...prev,
            isLoading: false,
            eventId: firstEvent?.id ?? null,
            eventName: firstEvent?.name ?? null,
            versionId: firstVersion?.id ?? null,
            versionName: firstVersion?.name ?? null,
            templateCode: ctx.templates[0]?.code ?? null,
          }))
        })
        .catch(err => {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: getErrorMessage(err),
          }))
        })
    }
  }, [state.importType])

  const handleImportTypeChange = (value: string) => {
    setState(prev => ({
      ...prev,
      importType: value as ImportType,
      eventId: null,
      eventName: null,
      versionId: null,
      versionName: null,
    }))
    setContext(null)
  }

  const handleEventChange = (eventId: string) => {
    const event = context?.events.find(e => e.id === eventId)
    setState(prev => ({
      ...prev,
      eventId,
      eventName: event?.name ?? null,
    }))
  }

  const handleVersionChange = (versionId: string) => {
    const version = context?.versions.find(v => v.id === versionId)
    setState(prev => ({
      ...prev,
      versionId,
      versionName: version?.name ?? null,
    }))
  }

  const handleFileSelect = async (file: File) => {
    if (!state.importType || !state.eventId || !state.versionId) {
      setState(prev => ({ ...prev, error: "取込先を選択してください" }))
      return
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const result = await bffClient.startImport({
        importType: state.importType,
        eventId: state.eventId,
        versionId: state.versionId,
        templateCode: state.templateCode ?? undefined,
      })

      await bffClient.uploadFile(result.uploadUrl, file)

      setState(prev => ({
        ...prev,
        batchId: result.batchId,
        step: "staging",
        isLoading: false,
      }))
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: getErrorMessage(err),
      }))
    }
  }

  const handlePaste = async (data: string[][]) => {
    if (!state.importType || !state.eventId || !state.versionId) {
      setState(prev => ({ ...prev, error: "取込先を選択してください" }))
      return
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const result = await bffClient.startPasteImport({
        importType: state.importType,
        eventId: state.eventId,
        versionId: state.versionId,
        templateCode: state.templateCode ?? undefined,
        data,
      })

      setState(prev => ({
        ...prev,
        batchId: result.batchId,
        step: result.needsAggregation ? "staging" : "staging",
        isLoading: false,
      }))
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: getErrorMessage(err),
      }))
    }
  }

  const handleReset = () => {
    setState(initialState)
    setContext(null)
  }

  const canProceed = state.importType && state.eventId && state.versionId

  if (state.step === "staging") {
    return (
      <StagingSection
        bffClient={bffClient}
        batchId={state.batchId!}
        importType={state.importType!}
        eventName={state.eventName ?? ""}
        versionName={state.versionName ?? ""}
        onBack={handleReset}
        onComplete={handleReset}
      />
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center gap-2 text-sm">
        <Badge variant={state.step === "select" ? "default" : "secondary"}>
          1. 取込先選択
        </Badge>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <Badge variant={state.step === "upload" ? "default" : "outline"}>
          2. データ取込
        </Badge>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <Badge variant="outline">
          3. 確認・実行
        </Badge>
      </div>

      {/* Import Type & Target Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">取込先の設定</CardTitle>
          <CardDescription>
            取り込むデータの種類と保存先を選択してください
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Import Type */}
            <div className="space-y-2">
              <Label htmlFor="import-type">データ種類</Label>
              <Select
                value={state.importType ?? ""}
                onValueChange={handleImportTypeChange}
              >
                <SelectTrigger id="import-type">
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BUDGET">予算データ</SelectItem>
                  <SelectItem value="FORECAST">見込データ</SelectItem>
                  <SelectItem value="ACTUAL">実績データ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Event */}
            <div className="space-y-2">
              <Label htmlFor="event">イベント</Label>
              <Select
                value={state.eventId ?? ""}
                onValueChange={handleEventChange}
                disabled={!context}
              >
                <SelectTrigger id="event">
                  <SelectValue placeholder={context ? "選択してください" : "データ種類を先に選択"} />
                </SelectTrigger>
                <SelectContent>
                  {context?.events.map(event => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name} ({event.fiscalYear}年度)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Version */}
            <div className="space-y-2">
              <Label htmlFor="version">バージョン</Label>
              <Select
                value={state.versionId ?? ""}
                onValueChange={handleVersionChange}
                disabled={!context}
              >
                <SelectTrigger id="version">
                  <SelectValue placeholder={context ? "選択してください" : "イベントを先に選択"} />
                </SelectTrigger>
                <SelectContent>
                  {context?.versions.map(version => (
                    <SelectItem key={version.id} value={version.id}>
                      {version.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Template */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="template">テンプレート</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      テンプレートを指定すると、列のマッピングが自動適用されます
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select
                value={state.templateCode ?? "__auto__"}
                onValueChange={(v) => setState(prev => ({ ...prev, templateCode: v === "__auto__" ? null : v }))}
                disabled={!context}
              >
                <SelectTrigger id="template">
                  <SelectValue placeholder="自動検出" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__auto__">自動検出</SelectItem>
                  {context?.templates.map(template => (
                    <SelectItem key={template.code} value={template.code}>
                      {template.name}
                      {template.isSystem && (
                        <span className="ml-2 text-xs text-muted-foreground">(システム)</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {state.error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {state.error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dropzone */}
      <div className={cn(!canProceed && "opacity-50 pointer-events-none")}>
        <ImportDropzone
          onFileSelect={handleFileSelect}
          onPaste={handlePaste}
          isLoading={state.isLoading}
        />
      </div>

      {!canProceed && (
        <p className="text-sm text-center text-muted-foreground">
          取込先を選択するとデータ取込が有効になります
        </p>
      )}
    </div>
  )
}

function HistorySection() {
  const [history, setHistory] = React.useState<BffImportHistoryItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [filterType, setFilterType] = React.useState<ImportType | "__all__">("__all__")

  React.useEffect(() => {
    setIsLoading(true)
    bffClient
      .getHistory({
        importType: filterType === "__all__" ? undefined : filterType,
        page: 1,
        pageSize: 20,
      })
      .then(res => {
        setHistory(res.items)
        setIsLoading(false)
      })
      .catch(() => {
        setIsLoading(false)
      })
  }, [filterType])

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getImportTypeLabel = (type: ImportType) => {
    switch (type) {
      case "BUDGET":
        return "予算"
      case "FORECAST":
        return "見込"
      case "ACTUAL":
        return "実績"
      default:
        return type
    }
  }

  const getSourceTypeLabel = (type: string) => {
    switch (type) {
      case "EXCEL":
        return "Excel"
      case "CSV":
        return "CSV"
      case "PASTE":
        return "コピペ"
      case "API":
        return "API"
      default:
        return type
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="w-48">
          <Select
            value={filterType}
            onValueChange={(v) => setFilterType(v as ImportType | "__all__")}
          >
            <SelectTrigger>
              <SelectValue placeholder="すべての種類" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">すべての種類</SelectItem>
              <SelectItem value="BUDGET">予算</SelectItem>
              <SelectItem value="FORECAST">見込</SelectItem>
              <SelectItem value="ACTUAL">実績</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* History Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>日時</TableHead>
              <TableHead>種類</TableHead>
              <TableHead>イベント</TableHead>
              <TableHead>バージョン</TableHead>
              <TableHead className="text-right">件数</TableHead>
              <TableHead>ソース</TableHead>
              <TableHead>結果</TableHead>
              <TableHead>実行者</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : history.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  取込履歴がありません
                </TableCell>
              </TableRow>
            ) : (
              history.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="text-sm">
                    {formatDate(item.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getImportTypeLabel(item.importType)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {item.eventName ?? "-"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {item.versionName ?? "-"}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {item.totalRows.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm">
                    {getSourceTypeLabel(item.sourceType)}
                    {item.sourceFilename && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({item.sourceFilename})
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.result === "SUCCESS" ? "default" : "destructive"}>
                      {item.result === "SUCCESS" ? "成功" : "失敗"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {item.createdByName}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

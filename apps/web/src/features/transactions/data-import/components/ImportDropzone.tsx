"use client"

import * as React from "react"
import { Upload, FileSpreadsheet, ClipboardPaste, X, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/shared/ui/components/button"
import { Card, CardContent } from "@/shared/ui/components/card"

interface ImportDropzoneProps {
  onFileSelect: (file: File) => void
  onPaste: (data: string[][]) => void
  isLoading?: boolean
  acceptedFormats?: string[]
  className?: string
}

const DEFAULT_ACCEPTED_FORMATS = [".xlsx", ".xls", ".csv"]

export function ImportDropzone({
  onFileSelect,
  onPaste,
  isLoading = false,
  acceptedFormats = DEFAULT_ACCEPTED_FORMATS,
  className,
}: ImportDropzoneProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [pasteMode, setPasteMode] = React.useState(false)
  const [pasteError, setPasteError] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const pasteAreaRef = React.useRef<HTMLTextAreaElement>(null)

  const handleDragEnter = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isLoading) {
      setIsDragging(true)
    }
  }, [isLoading])

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (isLoading) return

    const files = Array.from(e.dataTransfer.files)
    const validFile = files.find(file => {
      const ext = `.${file.name.split(".").pop()?.toLowerCase()}`
      return acceptedFormats.includes(ext)
    })

    if (validFile) {
      onFileSelect(validFile)
    }
  }, [isLoading, acceptedFormats, onFileSelect])

  const handleFileChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
    // Reset input to allow selecting same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [onFileSelect])

  const handlePaste = React.useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    setPasteError(null)

    const text = e.clipboardData.getData("text/plain")
    if (!text.trim()) {
      setPasteError("貼り付けるデータがありません")
      return
    }

    // タブ区切りまたはカンマ区切りを解析
    const lines = text.trim().split("\n")
    const data: string[][] = []

    for (const line of lines) {
      // タブ区切りを優先、なければカンマ区切り
      const cells = line.includes("\t")
        ? line.split("\t")
        : line.split(",")
      data.push(cells.map(cell => cell.trim()))
    }

    if (data.length === 0 || data[0].length === 0) {
      setPasteError("有効なデータを認識できませんでした")
      return
    }

    onPaste(data)
  }, [onPaste])

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  if (pasteMode) {
    return (
      <Card className={cn("border-2 border-dashed", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ClipboardPaste className="h-4 w-4" />
              コピペ取込モード
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPasteMode(false)
                setPasteError(null)
              }}
            >
              <X className="h-4 w-4" />
              閉じる
            </Button>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Excelやスプレッドシートからデータをコピーして、下のエリアに貼り付けてください。
            </p>
            <textarea
              ref={pasteAreaRef}
              className={cn(
                "w-full h-32 p-3 text-sm border rounded-md resize-none",
                "focus:outline-none focus:ring-2 focus:ring-primary",
                "placeholder:text-muted-foreground",
                pasteError && "border-destructive"
              )}
              placeholder="ここにデータを貼り付け (Ctrl+V / Cmd+V)"
              onPaste={handlePaste}
              disabled={isLoading}
              autoFocus
            />
            {pasteError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {pasteError}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              対応形式: タブ区切り、カンマ区切り
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        "border-2 border-dashed transition-colors",
        isDragging && "border-primary bg-primary/5",
        isLoading && "opacity-50 pointer-events-none",
        className
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <CardContent className="p-8">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className={cn(
            "p-4 rounded-full bg-muted transition-colors",
            isDragging && "bg-primary/10"
          )}>
            {isDragging ? (
              <FileSpreadsheet className="h-8 w-8 text-primary" />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground" />
            )}
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">
              {isDragging ? "ファイルをドロップ" : "データを取り込む"}
            </h3>
            <p className="text-sm text-muted-foreground">
              ファイルをドラッグ＆ドロップ、またはブラウズしてファイルを選択
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="default"
              onClick={handleBrowseClick}
              disabled={isLoading}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              ファイルを選択
            </Button>
            <span className="text-sm text-muted-foreground">または</span>
            <Button
              variant="outline"
              onClick={() => setPasteMode(true)}
              disabled={isLoading}
            >
              <ClipboardPaste className="h-4 w-4 mr-2" />
              コピペで取込
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            対応形式: {acceptedFormats.join(", ")}
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(",")}
          onChange={handleFileChange}
          className="hidden"
        />
      </CardContent>
    </Card>
  )
}

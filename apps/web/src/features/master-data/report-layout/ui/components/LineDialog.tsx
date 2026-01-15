"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Alert,
  AlertDescription,
} from "@/shared/ui"
import type { LineType, SignDisplayPolicy, LayoutType } from "@epm/contracts/bff/report-layout"
import { bffClient } from "../api/client"
import { getErrorMessage } from "../lib/error-messages"
import { SubjectSelectionDialog } from "./SubjectSelectionDialog"

interface LineDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  layoutId: string
  layoutType: LayoutType
  lineId?: string | null
  onSuccess: () => void
}

export function LineDialog({ open, onOpenChange, layoutId, layoutType, lineId, onSuccess }: LineDialogProps) {
  const isEdit = !!lineId
  const [lineType, setLineType] = useState<LineType>("header")
  const [displayName, setDisplayName] = useState("")
  const [subjectId, setSubjectId] = useState<string | null>(null)
  const [subjectCode, setSubjectCode] = useState<string | null>(null)
  const [subjectName, setSubjectName] = useState<string | null>(null)
  const [indentLevel, setIndentLevel] = useState(0)
  const [signDisplayPolicy, setSignDisplayPolicy] = useState<SignDisplayPolicy>("auto")
  const [isBold, setIsBold] = useState(false)
  const [confidenceEnabled, setConfidenceEnabled] = useState(false)
  const [wnbEnabled, setWnbEnabled] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSubjectDialog, setShowSubjectDialog] = useState(false)

  useEffect(() => {
    if (open && lineId) {
      loadLine()
    } else if (open && !lineId) {
      resetForm()
    }
  }, [open, lineId])

  const loadLine = async () => {
    if (!lineId) return
    try {
      const line = await bffClient.getLineDetail(lineId)
      setLineType(line.lineType)
      setDisplayName(line.displayName || "")
      setSubjectId(line.subjectId)
      setSubjectCode(line.subjectCode)
      setSubjectName(line.subjectName)
      setIndentLevel(line.indentLevel)
      setSignDisplayPolicy(line.signDisplayPolicy || "auto")
      setIsBold(line.isBold)
      setConfidenceEnabled(line.confidenceEnabled)
      setWnbEnabled(line.wnbEnabled)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const resetForm = () => {
    setLineType("header")
    setDisplayName("")
    setSubjectId(null)
    setSubjectCode(null)
    setSubjectName(null)
    setIndentLevel(0)
    setSignDisplayPolicy("auto")
    setIsBold(false)
    setConfidenceEnabled(false)
    setWnbEnabled(false)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (lineType === "account" && !subjectId) {
      setError("account行には科目を選択してください")
      return
    }
    if ((lineType === "header" || lineType === "note") && !displayName) {
      setError("表示名を入力してください")
      return
    }

    setIsSubmitting(true)
    try {
      if (isEdit && lineId) {
        await bffClient.updateLine(lineId, {
          displayName: displayName || undefined,
          subjectId: subjectId || undefined,
          indentLevel,
          signDisplayPolicy: lineType === "account" ? signDisplayPolicy : undefined,
          isBold,
          confidenceEnabled: lineType === "account" ? confidenceEnabled : undefined,
          wnbEnabled: lineType === "account" ? wnbEnabled : undefined,
        })
      } else {
        await bffClient.createLine(layoutId, {
          lineType,
          displayName: displayName || undefined,
          subjectId: subjectId || undefined,
          indentLevel,
          signDisplayPolicy: lineType === "account" ? signDisplayPolicy : undefined,
          isBold,
          confidenceEnabled: lineType === "account" ? confidenceEnabled : undefined,
          wnbEnabled: lineType === "account" ? wnbEnabled : undefined,
        })
      }
      onSuccess()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const companyId = "company-001"

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEdit ? "行編集" : "行追加"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4 py-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {!isEdit && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    行種別 <span className="text-destructive">*</span>
                  </label>
                  <Select value={lineType} onValueChange={(v) => setLineType(v as LineType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="header">見出し</SelectItem>
                      <SelectItem value="account">科目</SelectItem>
                      <SelectItem value="note">注記</SelectItem>
                      <SelectItem value="blank">空白</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {lineType === "account" && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      科目選択 <span className="text-destructive">*</span>
                    </label>
                    <div className="flex gap-2 items-start">
                      <div className="flex-1">
                        {subjectId ? (
                          <div className="px-3 py-2 border rounded-md bg-muted">
                            <span className="font-mono text-sm">{subjectCode}</span>
                            <span className="text-sm text-muted-foreground ml-2">- {subjectName}</span>
                          </div>
                        ) : (
                          <div className="px-3 py-2 border rounded-md text-muted-foreground text-sm">
                            科目を選択してください
                          </div>
                        )}
                      </div>
                      <Button type="button" onClick={() => setShowSubjectDialog(true)}>
                        {subjectId ? "変更" : "選択"}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">表示項目名</label>
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="未入力の場合は科目名が使用されます"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      科目名と異なる表示にしたい場合は編集してください
                    </p>
                  </div>
                </>
              )}

              {(lineType === "header" || lineType === "note") && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    表示名 <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="表示名を入力"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">インデントレベル</label>
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    value={indentLevel}
                    onChange={(e) => setIndentLevel(Number(e.target.value))}
                  />
                </div>

                {lineType === "account" && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">符号表示ポリシー</label>
                    <Select
                      value={signDisplayPolicy}
                      onValueChange={(v) => setSignDisplayPolicy(v as SignDisplayPolicy)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">自動</SelectItem>
                        <SelectItem value="force_plus">常に+</SelectItem>
                        <SelectItem value="force_minus">常に-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isBold"
                  checked={isBold}
                  onChange={(e) => setIsBold(e.target.checked)}
                  className="rounded border-input"
                />
                <label htmlFor="isBold" className="text-sm font-medium cursor-pointer">
                  太字で表示
                </label>
              </div>

              {/* 確度管理・W/N/B設定（科目行のみ） */}
              {lineType === "account" && (
                <div className="border rounded-lg p-4 bg-muted/30">
                  <p className="text-sm font-medium mb-3">予算・見込入力オプション</p>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="confidenceEnabled"
                        checked={confidenceEnabled}
                        onChange={(e) => setConfidenceEnabled(e.target.checked)}
                        className="rounded border-input"
                      />
                      <label htmlFor="confidenceEnabled" className="text-sm cursor-pointer">
                        確度管理を有効にする
                      </label>
                      <span className="text-xs text-muted-foreground">（S/A/B/C/D/Z別入力）</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="wnbEnabled"
                        checked={wnbEnabled}
                        onChange={(e) => setWnbEnabled(e.target.checked)}
                        className="rounded border-input"
                      />
                      <label htmlFor="wnbEnabled" className="text-sm cursor-pointer">
                        W/N/B入力を有効にする
                      </label>
                      <span className="text-xs text-muted-foreground">（ワースト/ノーマル/ベスト）</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    ※ ディメンション展開科目との併用はできません
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                キャンセル
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "保存中..." : "保存"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {lineType === "account" && (
        <SubjectSelectionDialog
          open={showSubjectDialog}
          onOpenChange={setShowSubjectDialog}
          layoutType={layoutType}
          companyId={companyId}
          onSelect={(subject) => {
            setSubjectId(subject.id)
            setSubjectCode(subject.subjectCode)
            setSubjectName(subject.subjectName)
            if (!displayName) {
              setDisplayName(subject.subjectName)
            }
            setShowSubjectDialog(false)
          }}
        />
      )}
    </>
  )
}

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
  Checkbox,
  Textarea,
} from "@/shared/ui"
import type { LineType, SignDisplayPolicy, LayoutType } from "@epm/contracts/bff/group-report-layout"
import { bffClient } from "../api/client"
import { getErrorMessage } from "../lib/error-messages"
import { GroupSubjectSelectionDialog } from "./GroupSubjectSelectionDialog"
import { SIGN_DISPLAY_POLICY_LABELS } from "../lib/line-type-labels"

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
  const [groupSubjectId, setGroupSubjectId] = useState<string | null>(null)
  const [groupSubjectCode, setGroupSubjectCode] = useState<string | null>(null)
  const [groupSubjectName, setGroupSubjectName] = useState<string | null>(null)
  const [indentLevel, setIndentLevel] = useState(0)
  const [signDisplayPolicy, setSignDisplayPolicy] = useState<SignDisplayPolicy>("auto")
  const [isBold, setIsBold] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [isDoubleUnderline, setIsDoubleUnderline] = useState(false)
  const [bgHighlight, setBgHighlight] = useState(false)
  const [notes, setNotes] = useState("")
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
      setGroupSubjectId(line.groupSubjectId)
      setGroupSubjectCode(line.groupSubjectCode)
      setGroupSubjectName(line.groupSubjectName)
      setIndentLevel(line.indentLevel)
      setSignDisplayPolicy(line.signDisplayPolicy || "auto")
      setIsBold(line.isBold)
      setIsUnderline(line.isUnderline)
      setIsDoubleUnderline(line.isDoubleUnderline)
      setBgHighlight(line.bgHighlight)
      setNotes(line.notes || "")
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const resetForm = () => {
    setLineType("header")
    setDisplayName("")
    setGroupSubjectId(null)
    setGroupSubjectCode(null)
    setGroupSubjectName(null)
    setIndentLevel(0)
    setSignDisplayPolicy("auto")
    setIsBold(false)
    setIsUnderline(false)
    setIsDoubleUnderline(false)
    setBgHighlight(false)
    setNotes("")
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (lineType === "account" && !groupSubjectId) {
      setError("account行には連結科目を選択してください")
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
          groupSubjectId: groupSubjectId || undefined,
          indentLevel,
          signDisplayPolicy: lineType === "account" ? signDisplayPolicy : undefined,
          isBold,
          isUnderline,
          isDoubleUnderline,
          bgHighlight,
          notes: notes || undefined,
        })
      } else {
        await bffClient.createLine(layoutId, {
          lineType,
          displayName: displayName || undefined,
          groupSubjectId: groupSubjectId || undefined,
          indentLevel,
          signDisplayPolicy: lineType === "account" ? signDisplayPolicy : undefined,
          isBold,
          isUnderline,
          isDoubleUnderline,
          bgHighlight,
          notes: notes || undefined,
        })
      }
      onSuccess()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

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
                      連結科目選択 <span className="text-destructive">*</span>
                    </label>
                    <div className="flex gap-2 items-start">
                      <div className="flex-1">
                        {groupSubjectId ? (
                          <div className="px-3 py-2 border rounded-md bg-muted">
                            <span className="font-mono text-sm">{groupSubjectCode}</span>
                            <span className="text-sm text-muted-foreground ml-2">- {groupSubjectName}</span>
                          </div>
                        ) : (
                          <div className="px-3 py-2 border rounded-md text-muted-foreground text-sm">
                            連結科目を選択してください
                          </div>
                        )}
                      </div>
                      <Button type="button" onClick={() => setShowSubjectDialog(true)}>
                        {groupSubjectId ? "変更" : "選択"}
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
                  <label className="text-sm font-medium mb-2 block">インデントレベル（0〜10）</label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
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
                        <SelectItem value="auto">{SIGN_DISPLAY_POLICY_LABELS.auto}</SelectItem>
                        <SelectItem value="force_plus">{SIGN_DISPLAY_POLICY_LABELS.force_plus}</SelectItem>
                        <SelectItem value="force_minus">{SIGN_DISPLAY_POLICY_LABELS.force_minus}</SelectItem>
                        <SelectItem value="force_paren">{SIGN_DISPLAY_POLICY_LABELS.force_paren}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium block">表示スタイル</label>
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={isBold}
                      onCheckedChange={(checked) => setIsBold(checked === true)}
                    />
                    <span className="text-sm font-bold">太字</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={isUnderline}
                      onCheckedChange={(checked) => {
                        setIsUnderline(checked === true)
                        if (checked) setIsDoubleUnderline(false)
                      }}
                    />
                    <span className="text-sm underline">下線</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={isDoubleUnderline}
                      onCheckedChange={(checked) => {
                        setIsDoubleUnderline(checked === true)
                        if (checked) setIsUnderline(false)
                      }}
                    />
                    <span className="text-sm underline decoration-double">二重下線</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={bgHighlight}
                      onCheckedChange={(checked) => setBgHighlight(checked === true)}
                    />
                    <span className="text-sm bg-yellow-100 px-1">ハイライト</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">備考</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="行に関する備考を入力..."
                  rows={2}
                />
              </div>
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
        <GroupSubjectSelectionDialog
          open={showSubjectDialog}
          onOpenChange={setShowSubjectDialog}
          layoutType={layoutType}
          onSelect={(subject) => {
            setGroupSubjectId(subject.id)
            setGroupSubjectCode(subject.groupSubjectCode)
            setGroupSubjectName(subject.groupSubjectName)
            if (!displayName) {
              setDisplayName(subject.groupSubjectName)
            }
            setShowSubjectDialog(false)
          }}
        />
      )}
    </>
  )
}

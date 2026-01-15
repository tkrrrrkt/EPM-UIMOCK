"use client"

import type React from "react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/ui"
import type { BffCreateGroupSubjectRequest } from "@epm/contracts/bff/group-subject-master"

interface CreateGroupSubjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subjectClass: "BASE" | "AGGREGATE"
  onSubmit: (request: BffCreateGroupSubjectRequest) => Promise<void>
}

export function CreateGroupSubjectDialog({
  open,
  onOpenChange,
  subjectClass,
  onSubmit,
}: CreateGroupSubjectDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Partial<BffCreateGroupSubjectRequest>>({
    subjectClass,
    subjectType: "FIN",
    aggregationMethod: "SUM",
    scale: 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.groupSubjectCode || !formData.groupSubjectName || !formData.measureKind) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData as BffCreateGroupSubjectRequest)
      onOpenChange(false)
      setFormData({ subjectClass, subjectType: "FIN", aggregationMethod: "SUM", scale: 0 })
    } catch (error) {
      console.error("Failed to create subject:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{subjectClass === "BASE" ? "通常科目を追加" : "集計科目を追加"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">基本情報</TabsTrigger>
              <TabsTrigger value="financial" disabled={formData.subjectType !== "FIN"}>
                財務属性
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="groupSubjectCode">連結勘定科目コード *</Label>
                  <Input
                    id="groupSubjectCode"
                    value={formData.groupSubjectCode || ""}
                    onChange={(e) => setFormData({ ...formData, groupSubjectCode: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="groupSubjectName">科目名 *</Label>
                  <Input
                    id="groupSubjectName"
                    value={formData.groupSubjectName || ""}
                    onChange={(e) => setFormData({ ...formData, groupSubjectName: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="groupSubjectNameShort">科目名略称</Label>
                  <Input
                    id="groupSubjectNameShort"
                    value={formData.groupSubjectNameShort || ""}
                    onChange={(e) => setFormData({ ...formData, groupSubjectNameShort: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="subjectType">科目タイプ *</Label>
                  <Select
                    value={formData.subjectType}
                    onValueChange={(value: "FIN" | "KPI") => setFormData({ ...formData, subjectType: value })}
                  >
                    <SelectTrigger id="subjectType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FIN">FIN（財務）</SelectItem>
                      <SelectItem value="KPI">KPI（業績指標）</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="measureKind">メジャー種別 *</Label>
                  <Input
                    id="measureKind"
                    value={formData.measureKind || ""}
                    onChange={(e) => setFormData({ ...formData, measureKind: e.target.value })}
                    placeholder="例: AMOUNT, COUNT"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="unit">単位</Label>
                    <Input
                      id="unit"
                      value={formData.unit || ""}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      placeholder="例: JPY, USD"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="scale">スケール</Label>
                    <Input
                      id="scale"
                      type="number"
                      value={formData.scale ?? 0}
                      onChange={(e) => setFormData({ ...formData, scale: Number.parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="aggregationMethod">集計方法 *</Label>
                  <Select
                    value={formData.aggregationMethod}
                    onValueChange={(value: "SUM" | "EOP" | "AVG" | "MAX" | "MIN") =>
                      setFormData({ ...formData, aggregationMethod: value })
                    }
                  >
                    <SelectTrigger id="aggregationMethod">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SUM">SUM（合計）</SelectItem>
                      <SelectItem value="EOP">EOP（期末残高）</SelectItem>
                      <SelectItem value="AVG">AVG（平均）</SelectItem>
                      <SelectItem value="MAX">MAX（最大）</SelectItem>
                      <SelectItem value="MIN">MIN（最小）</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">備考</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ""}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="financial" className="space-y-4 mt-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="finStmtClass">財務諸表区分</Label>
                  <Select
                    value={formData.finStmtClass || ""}
                    onValueChange={(value: "PL" | "BS") => setFormData({ ...formData, finStmtClass: value })}
                  >
                    <SelectTrigger id="finStmtClass">
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PL">損益計算書</SelectItem>
                      <SelectItem value="BS">貸借対照表</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="glElement">勘定要素</Label>
                  <Input
                    id="glElement"
                    value={formData.glElement || ""}
                    onChange={(e) => setFormData({ ...formData, glElement: e.target.value })}
                    placeholder="例: REVENUE, EXPENSE, ASSET"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="normalBalance">正常残高</Label>
                  <Select
                    value={formData.normalBalance || ""}
                    onValueChange={(value: "debit" | "credit") => setFormData({ ...formData, normalBalance: value })}
                  >
                    <SelectTrigger id="normalBalance">
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debit">借方</SelectItem>
                      <SelectItem value="credit">貸方</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="isContra">控除科目</Label>
                  <Select
                    value={formData.isContra ? "true" : "false"}
                    onValueChange={(value) => setFormData({ ...formData, isContra: value === "true" })}
                  >
                    <SelectTrigger id="isContra">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">いいえ</SelectItem>
                      <SelectItem value="true">はい</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "登録中..." : "登録"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

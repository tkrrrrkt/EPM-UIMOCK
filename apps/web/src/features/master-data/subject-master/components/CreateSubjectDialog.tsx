"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Alert,
  AlertDescription,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Switch,
} from "@/shared/ui"
import { AlertCircle } from "lucide-react"
import type { BffCreateSubjectRequest } from "@contracts/bff/subject-master"

interface CreateSubjectDialogProps {
  open: boolean
  onClose: () => void
  subjectClass: "BASE" | "AGGREGATE"
  onCreate: (request: BffCreateSubjectRequest) => Promise<void>
}

export function CreateSubjectDialog({ open, onClose, subjectClass, onCreate }: CreateSubjectDialogProps) {
  const [formData, setFormData] = useState<Partial<BffCreateSubjectRequest>>({
    subjectClass,
    subjectType: "FIN",
    aggregationMethod: "SUM",
    measureKind: "AMOUNT",
    scale: 1,
    allowNegative: false,
    isLaborCostApplicable: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.subjectCode || !formData.subjectName || !formData.measureKind) {
      setError("必須項目を入力してください")
      return
    }

    setIsSubmitting(true)
    try {
      await onCreate(formData as BffCreateSubjectRequest)
      onClose()
      // フォームをリセット
      setFormData({
        subjectClass,
        subjectType: "FIN",
        aggregationMethod: "SUM",
        measureKind: "AMOUNT",
        scale: 1,
        allowNegative: false,
        isLaborCostApplicable: false,
      })
    } catch (err: any) {
      setError(err.message || "エラーが発生しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{subjectClass === "BASE" ? "通常科目" : "集計科目"}の新規登録</DialogTitle>
          <DialogDescription>
            {subjectClass === "BASE"
              ? "財務科目またはKPI指標を登録します。"
              : "複数の科目を集計する科目を登録します。登録後に構成科目を追加できます。"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="subjectCode">科目コード *</Label>
              <Input
                id="subjectCode"
                value={formData.subjectCode || ""}
                onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value })}
                placeholder="例: 4010"
                required
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
                  <SelectItem value="FIN">FIN（財務科目）</SelectItem>
                  <SelectItem value="KPI">KPI（非財務指標）</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="subjectName">科目名 *</Label>
            <Input
              id="subjectName"
              value={formData.subjectName || ""}
              onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
              placeholder="例: 売上高"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="subjectNameShort">科目名略称</Label>
            <Input
              id="subjectNameShort"
              value={formData.subjectNameShort || ""}
              onChange={(e) => setFormData({ ...formData, subjectNameShort: e.target.value })}
              placeholder="例: 売上"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="measureKind">メジャー種別 *</Label>
              <Select
                value={formData.measureKind}
                onValueChange={(value) => setFormData({ ...formData, measureKind: value })}
              >
                <SelectTrigger id="measureKind">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AMOUNT">AMOUNT（金額）</SelectItem>
                  <SelectItem value="COUNT">COUNT（数量）</SelectItem>
                  <SelectItem value="WEIGHT">WEIGHT（重量）</SelectItem>
                  <SelectItem value="RATIO">RATIO（比率）</SelectItem>
                </SelectContent>
              </Select>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="unit">単位</Label>
              <Input
                id="unit"
                value={formData.unit || ""}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="例: 円"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="scale">スケール</Label>
              <Input
                id="scale"
                type="number"
                value={formData.scale || 1}
                onChange={(e) => setFormData({ ...formData, scale: Number(e.target.value) })}
                placeholder="1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="direction">方向性</Label>
              <Select
                value={formData.direction || "none"}
                onValueChange={(value) =>
                  setFormData({ ...formData, direction: value === "none" ? undefined : value })
                }
              >
                <SelectTrigger id="direction">
                  <SelectValue placeholder="指定なし" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">指定なし</SelectItem>
                  <SelectItem value="DEBIT">借方（DEBIT）</SelectItem>
                  <SelectItem value="CREDIT">貸方（CREDIT）</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="allowNegative">負値許可</Label>
              <Select
                value={formData.allowNegative ? "true" : "false"}
                onValueChange={(value) => setFormData({ ...formData, allowNegative: value === "true" })}
              >
                <SelectTrigger id="allowNegative">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">不許可</SelectItem>
                  <SelectItem value="true">許可</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {subjectClass === "AGGREGATE" && (
            <Alert>
              <AlertDescription>集計科目の場合、計上可否は自動的に「不可」に設定されます。</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between border rounded-lg p-4">
            <div className="space-y-0.5">
              <Label htmlFor="isLaborCostApplicable">労務費単価利用</Label>
              <p className="text-xs text-muted-foreground">労務費単価マスタの科目内訳で利用できるようにする</p>
            </div>
            <Switch
              id="isLaborCostApplicable"
              checked={formData.isLaborCostApplicable ?? false}
              onCheckedChange={(checked) => setFormData({ ...formData, isLaborCostApplicable: checked })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">備考</Label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="備考を入力..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
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

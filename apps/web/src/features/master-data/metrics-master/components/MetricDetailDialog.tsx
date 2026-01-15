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
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui"
import { bffClient } from "../api/client"
import type {
  BffMetricDetailResponse,
  BffCreateMetricRequest,
  BffUpdateMetricRequest,
  MetricType,
} from "@epm/contracts/bff/metrics-master"

/**
 * 指標詳細ダイアログ（新規登録・編集）
 * SSoT: .kiro/specs/master-data/metrics-master/design.md
 */

interface MetricDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  metric: BffMetricDetailResponse | null
  onSuccess: () => void
}

interface FormData {
  metricCode: string
  metricName: string
  metricType: MetricType
  resultMeasureKind: string
  unit: string
  scale: number
  formulaExpr: string
  description: string
}

const initialFormData: FormData = {
  metricCode: "",
  metricName: "",
  metricType: "FIN_METRIC",
  resultMeasureKind: "AMOUNT",
  unit: "",
  scale: 0,
  formulaExpr: "",
  description: "",
}

export function MetricDetailDialog({ open, onOpenChange, metric, onSuccess }: MetricDetailDialogProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (metric) {
      setFormData({
        metricCode: metric.metricCode,
        metricName: metric.metricName,
        metricType: metric.metricType,
        resultMeasureKind: metric.resultMeasureKind,
        unit: metric.unit ?? "",
        scale: metric.scale,
        formulaExpr: metric.formulaExpr,
        description: metric.description ?? "",
      })
    } else {
      setFormData(initialFormData)
    }
    setErrors({})
  }, [metric, open])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    // 必須項目チェック（design.md: BffCreateMetricRequest）
    if (!formData.metricCode.trim()) {
      newErrors.metricCode = "指標コードは必須です"
    } else if (formData.metricCode.length > 50) {
      newErrors.metricCode = "指標コードは50文字以内で入力してください"
    }

    if (!formData.metricName.trim()) {
      newErrors.metricName = "指標名は必須です"
    } else if (formData.metricName.length > 200) {
      newErrors.metricName = "指標名は200文字以内で入力してください"
    }

    if (!formData.metricType) {
      newErrors.metricType = "指標タイプは必須です"
    }

    if (!formData.resultMeasureKind.trim()) {
      newErrors.resultMeasureKind = "結果測定種別は必須です"
    }

    if (!formData.formulaExpr.trim()) {
      newErrors.formulaExpr = "式は必須です"
    }

    // 任意項目の長さチェック
    if (formData.unit && formData.unit.length > 30) {
      newErrors.unit = "単位は30文字以内で入力してください"
    }

    if (formData.scale < 0) {
      newErrors.scale = "スケールは0以上で入力してください"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setSubmitting(true)
    try {
      if (metric) {
        // 更新（design.md: BffUpdateMetricRequest - 全てオプショナル）
        const updateData: BffUpdateMetricRequest = {
          metricCode: formData.metricCode !== metric.metricCode ? formData.metricCode : undefined,
          metricName: formData.metricName,
          metricType: formData.metricType,
          resultMeasureKind: formData.resultMeasureKind,
          unit: formData.unit || undefined,
          scale: formData.scale,
          formulaExpr: formData.formulaExpr,
          description: formData.description || undefined,
        }
        await bffClient.updateMetric(metric.id, updateData)
      } else {
        // 新規登録（design.md: BffCreateMetricRequest）
        const createData: BffCreateMetricRequest = {
          metricCode: formData.metricCode,
          metricName: formData.metricName,
          metricType: formData.metricType,
          resultMeasureKind: formData.resultMeasureKind,
          unit: formData.unit || undefined,
          scale: formData.scale || undefined,
          formulaExpr: formData.formulaExpr,
          description: formData.description || undefined,
        }
        await bffClient.createMetric(createData)
      }
      onSuccess()
    } catch (error) {
      console.error("Failed to save metric:", error)
      // エラーコード別のメッセージ（design.md: MetricsMasterErrorCode）
      if (error instanceof Error) {
        if (error.message === "METRIC_CODE_DUPLICATE") {
          setErrors({ metricCode: "この指標コードは既に使用されています" })
        } else if (error.message === "FORMULA_SYNTAX_ERROR") {
          setErrors({ formulaExpr: "式の構文が不正です" })
        } else if (error.message === "SUBJECT_CODE_NOT_FOUND") {
          setErrors({ formulaExpr: "参照されている科目コードが存在しません" })
        } else {
          setErrors({ submit: "保存に失敗しました" })
        }
      } else {
        setErrors({ submit: "保存に失敗しました" })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{metric ? "指標編集" : "指標登録"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* 指標コード */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="metricCode">
              指標コード <span className="text-destructive">*</span>
            </Label>
            <Input
              id="metricCode"
              value={formData.metricCode}
              onChange={(e) => handleChange("metricCode", e.target.value)}
              placeholder="例: EBITDA"
              maxLength={50}
              className={errors.metricCode ? "border-destructive" : ""}
            />
            {errors.metricCode && <p className="text-sm text-destructive">{errors.metricCode}</p>}
          </div>

          {/* 指標名 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="metricName">
              指標名 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="metricName"
              value={formData.metricName}
              onChange={(e) => handleChange("metricName", e.target.value)}
              placeholder="例: EBITDA"
              maxLength={200}
              className={errors.metricName ? "border-destructive" : ""}
            />
            {errors.metricName && <p className="text-sm text-destructive">{errors.metricName}</p>}
          </div>

          {/* 指標タイプ */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="metricType">
              指標タイプ <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.metricType}
              onValueChange={(value) => handleChange("metricType", value as MetricType)}
            >
              <SelectTrigger className={errors.metricType ? "border-destructive" : ""}>
                <SelectValue placeholder="指標タイプを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FIN_METRIC">財務指標 (FIN_METRIC)</SelectItem>
                <SelectItem value="KPI_METRIC">KPI指標 (KPI_METRIC)</SelectItem>
              </SelectContent>
            </Select>
            {errors.metricType && <p className="text-sm text-destructive">{errors.metricType}</p>}
          </div>

          {/* 結果測定種別 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="resultMeasureKind">
              結果測定種別 <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.resultMeasureKind}
              onValueChange={(value) => handleChange("resultMeasureKind", value)}
            >
              <SelectTrigger className={errors.resultMeasureKind ? "border-destructive" : ""}>
                <SelectValue placeholder="結果測定種別を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AMOUNT">金額 (AMOUNT)</SelectItem>
              </SelectContent>
            </Select>
            {errors.resultMeasureKind && <p className="text-sm text-destructive">{errors.resultMeasureKind}</p>}
          </div>

          {/* 単位・スケール（横並び） */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="unit">単位</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => handleChange("unit", e.target.value)}
                placeholder="例: 円, %, 人"
                maxLength={30}
                className={errors.unit ? "border-destructive" : ""}
              />
              {errors.unit && <p className="text-sm text-destructive">{errors.unit}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="scale">スケール</Label>
              <Input
                id="scale"
                type="number"
                value={formData.scale}
                onChange={(e) => handleChange("scale", parseInt(e.target.value, 10) || 0)}
                min={0}
                className={errors.scale ? "border-destructive" : ""}
              />
              {errors.scale && <p className="text-sm text-destructive">{errors.scale}</p>}
            </div>
          </div>

          {/* 式 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="formulaExpr">
              式 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="formulaExpr"
              value={formData.formulaExpr}
              onChange={(e) => handleChange("formulaExpr", e.target.value)}
              placeholder='例: SUB("OP") + SUB("DA")'
              className={`font-mono ${errors.formulaExpr ? "border-destructive" : ""}`}
            />
            <p className="text-xs text-muted-foreground">
              SUB(&quot;科目コード&quot;) 形式で科目を参照できます。演算子: +, -, *, /
            </p>
            {errors.formulaExpr && <p className="text-sm text-destructive">{errors.formulaExpr}</p>}
          </div>

          {/* 説明 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="指標の説明を入力"
              rows={3}
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          {errors.submit && <p className="text-sm text-destructive">{errors.submit}</p>}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              キャンセル
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "保存中..." : metric ? "更新" : "登録"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

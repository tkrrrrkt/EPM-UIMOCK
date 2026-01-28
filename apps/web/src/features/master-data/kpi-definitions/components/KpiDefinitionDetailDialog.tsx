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
  BffKpiDefinitionDetailResponse,
  BffCreateKpiDefinitionRequest,
  BffUpdateKpiDefinitionRequest,
  AggregationMethod,
  Direction,
} from "@epm/contracts/bff/kpi-definitions"

/**
 * KPI定義詳細ダイアログ（新規登録・編集）
 * SSoT: .kiro/specs/master-data/kpi-definitions/design.md
 */

interface KpiDefinitionDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  kpiDefinition: BffKpiDefinitionDetailResponse | null
  onSuccess: () => void
}

interface FormData {
  kpiCode: string
  kpiName: string
  description: string
  unit: string
  aggregationMethod: AggregationMethod
  direction: Direction | null
}

const initialFormData: FormData = {
  kpiCode: "",
  kpiName: "",
  description: "",
  unit: "",
  aggregationMethod: "SUM",
  direction: null,
}

export function KpiDefinitionDetailDialog({ open, onOpenChange, kpiDefinition, onSuccess }: KpiDefinitionDetailDialogProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (kpiDefinition) {
      setFormData({
        kpiCode: kpiDefinition.kpiCode,
        kpiName: kpiDefinition.kpiName,
        description: kpiDefinition.description ?? "",
        unit: kpiDefinition.unit ?? "",
        aggregationMethod: kpiDefinition.aggregationMethod,
        direction: kpiDefinition.direction,
      })
    } else {
      setFormData(initialFormData)
    }
    setErrors({})
  }, [kpiDefinition, open])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    // 必須項目チェック（design.md: BffCreateKpiDefinitionRequest）
    if (!formData.kpiCode.trim()) {
      newErrors.kpiCode = "KPIコードは必須です"
    } else if (formData.kpiCode.length > 50) {
      newErrors.kpiCode = "KPIコードは50文字以内で入力してください"
    }

    if (!formData.kpiName.trim()) {
      newErrors.kpiName = "KPI名は必須です"
    } else if (formData.kpiName.length > 200) {
      newErrors.kpiName = "KPI名は200文字以内で入力してください"
    }

    if (!formData.aggregationMethod) {
      newErrors.aggregationMethod = "集計方法は必須です"
    }

    // 任意項目の長さチェック
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = "説明は1000文字以内で入力してください"
    }

    if (formData.unit && formData.unit.length > 30) {
      newErrors.unit = "単位は30文字以内で入力してください"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setSubmitting(true)
    try {
      if (kpiDefinition) {
        // 更新（design.md: BffUpdateKpiDefinitionRequest - 全てオプショナル）
        const updateData: BffUpdateKpiDefinitionRequest = {
          kpiCode: formData.kpiCode !== kpiDefinition.kpiCode ? formData.kpiCode : undefined,
          kpiName: formData.kpiName,
          description: formData.description || undefined,
          unit: formData.unit || undefined,
          aggregationMethod: formData.aggregationMethod,
          direction: formData.direction,
        }
        await bffClient.updateKpiDefinition(kpiDefinition.id, updateData)
      } else {
        // 新規登録（design.md: BffCreateKpiDefinitionRequest）
        const createData: BffCreateKpiDefinitionRequest = {
          kpiCode: formData.kpiCode,
          kpiName: formData.kpiName,
          description: formData.description || undefined,
          unit: formData.unit || undefined,
          aggregationMethod: formData.aggregationMethod,
          direction: formData.direction || undefined,
        }
        await bffClient.createKpiDefinition(createData)
      }
      onSuccess()
    } catch (error) {
      console.error("Failed to save KPI definition:", error)
      // エラーコード別のメッセージ（design.md: KpiDefinitionsErrorCode）
      if (error instanceof Error) {
        if (error.message === "KPI_CODE_DUPLICATE") {
          setErrors({ kpiCode: "このKPIコードは既に使用されています" })
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

  const handleChange = (field: keyof FormData, value: string | AggregationMethod | Direction | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{kpiDefinition ? "KPI定義編集" : "KPI定義登録"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* KPIコード */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="kpiCode">
              KPIコード <span className="text-destructive">*</span>
            </Label>
            <Input
              id="kpiCode"
              value={formData.kpiCode}
              onChange={(e) => handleChange("kpiCode", e.target.value)}
              placeholder="例: CO2-001"
              maxLength={50}
              className={errors.kpiCode ? "border-destructive" : ""}
            />
            {errors.kpiCode && <p className="text-sm text-destructive">{errors.kpiCode}</p>}
          </div>

          {/* KPI名 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="kpiName">
              KPI名 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="kpiName"
              value={formData.kpiName}
              onChange={(e) => handleChange("kpiName", e.target.value)}
              placeholder="例: CO2排出量削減率"
              maxLength={200}
              className={errors.kpiName ? "border-destructive" : ""}
            />
            {errors.kpiName && <p className="text-sm text-destructive">{errors.kpiName}</p>}
          </div>

          {/* 集計方法・単位（横並び） */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="aggregationMethod">
                集計方法 <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.aggregationMethod}
                onValueChange={(value) => handleChange("aggregationMethod", value as AggregationMethod)}
              >
                <SelectTrigger className={errors.aggregationMethod ? "border-destructive" : ""}>
                  <SelectValue placeholder="集計方法を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUM">合計 (SUM)</SelectItem>
                  <SelectItem value="EOP">期末値 (EOP)</SelectItem>
                  <SelectItem value="AVG">平均 (AVG)</SelectItem>
                  <SelectItem value="MAX">最大 (MAX)</SelectItem>
                  <SelectItem value="MIN">最小 (MIN)</SelectItem>
                </SelectContent>
              </Select>
              {errors.aggregationMethod && <p className="text-sm text-destructive">{errors.aggregationMethod}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="unit">単位</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => handleChange("unit", e.target.value)}
                placeholder="例: %, 件, pt"
                maxLength={30}
                className={errors.unit ? "border-destructive" : ""}
              />
              {errors.unit && <p className="text-sm text-destructive">{errors.unit}</p>}
            </div>
          </div>

          {/* 方向性 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="direction">方向性</Label>
            <Select
              value={formData.direction || "none"}
              onValueChange={(value) => handleChange("direction", value === "none" ? null : (value as Direction))}
            >
              <SelectTrigger>
                <SelectValue placeholder="方向性を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">指定なし</SelectItem>
                <SelectItem value="higher_is_better">高いほど良い</SelectItem>
                <SelectItem value="lower_is_better">低いほど良い</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              高いほど良い: 顧客満足度、売上高など / 低いほど良い: CO2排出量、離職率など
            </p>
          </div>

          {/* 説明 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="KPIの説明を入力"
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
              {submitting ? "保存中..." : kpiDefinition ? "更新" : "登録"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
  Separator,
  ScrollArea,
  Switch,
  Label,
} from "@/shared/ui"
import { Pencil, Save, X } from "lucide-react"
import type { BffSubjectDetailResponse, BffUpdateSubjectRequest } from "@contracts/bff/subject-master"

interface SubjectDetailPanelProps {
  subject: BffSubjectDetailResponse | null
  onUpdate: (id: string, data: BffUpdateSubjectRequest) => Promise<void>
}

export function SubjectDetailPanel({ subject, onUpdate }: SubjectDetailPanelProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<BffUpdateSubjectRequest>({})

  if (!subject) {
    return null
  }

  const handleEdit = () => {
    setFormData({
      subjectCode: subject.subjectCode,
      subjectName: subject.subjectName,
      subjectNameShort: subject.subjectNameShort ?? undefined,
      measureKind: subject.measureKind,
      unit: subject.unit ?? undefined,
      scale: subject.scale,
      aggregationMethod: subject.aggregationMethod as BffUpdateSubjectRequest['aggregationMethod'],
      direction: subject.direction ?? undefined,
      allowNegative: subject.allowNegative,
      isLaborCostApplicable: subject.isLaborCostApplicable,
      notes: subject.notes ?? undefined,
    })
    setIsEditing(true)
  }

  const handleCancel = () => {
    setFormData({})
    setIsEditing(false)
  }

  const handleSave = async () => {
    await onUpdate(subject.id, formData)
    setIsEditing(false)
  }

  const renderField = (
    label: string,
    value: string | number | boolean | null,
    field?: keyof BffUpdateSubjectRequest,
    editable = true,
  ) => {
    const displayValue = value === null ? "-" : String(value)

    return (
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        {isEditing && editable && field ? (
          <Input
            value={(formData[field] as string) ?? displayValue}
            onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
            className="h-8"
          />
        ) : (
          <div className="text-sm">{displayValue}</div>
        )}
      </div>
    )
  }

  return (
    <Card className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold text-foreground">科目詳細</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Header Section */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-foreground">{subject.subjectName}</h3>
                  <Badge variant={subject.isActive ? "default" : "destructive"}>
                    {subject.isActive ? "有効" : "無効"}
                  </Badge>
                </div>
                <p className="font-mono text-sm text-muted-foreground">{subject.subjectCode}</p>
                {subject.subjectNameShort && (
                  <p className="text-sm text-muted-foreground">略称: {subject.subjectNameShort}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <Badge variant="outline">{subject.subjectClass === "BASE" ? "通常科目" : "集計科目"}</Badge>
              <Badge variant="secondary">{subject.subjectType}</Badge>
              {subject.postingAllowed && <Badge variant="default">計上可</Badge>}
            </div>
          </div>

          <Separator />

          {/* Basic Information */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-foreground">基本情報</h4>
            <div className="grid grid-cols-2 gap-4">
              {renderField("科目コード", subject.subjectCode, "subjectCode", false)}
              {renderField("科目名", subject.subjectName, "subjectName")}
              {renderField("科目名略称", subject.subjectNameShort, "subjectNameShort")}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">科目タイプ</label>
                <div className="text-sm">{subject.subjectType}</div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">科目クラス</label>
                <div className="text-sm">{subject.subjectClass === "AGGREGATE" ? "集計科目" : "通常科目"}</div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">計上可否</label>
                <div className="text-sm">{subject.postingAllowed ? "可" : "不可"}</div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-semibold mb-3">計算設定</h4>
            <div className="grid grid-cols-2 gap-4">
              {renderField("メジャー種別", subject.measureKind, "measureKind")}
              {renderField("単位", subject.unit, "unit")}
              {renderField("スケール", subject.scale, "scale")}
              {renderField("集計方法", subject.aggregationMethod, "aggregationMethod")}
              {renderField("方向性", subject.direction, "direction")}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">負値許可</label>
                <div className="text-sm">{subject.allowNegative ? "許可" : "不許可"}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* 利用設定 */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-foreground">利用設定</h4>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="labor-cost-applicable" className="text-sm">労務費単価利用</Label>
                <p className="text-xs text-muted-foreground">労務費単価マスタの科目内訳で利用できるようにする</p>
              </div>
              {isEditing ? (
                <Switch
                  id="labor-cost-applicable"
                  checked={formData.isLaborCostApplicable ?? subject.isLaborCostApplicable}
                  onCheckedChange={(checked) => setFormData({ ...formData, isLaborCostApplicable: checked })}
                />
              ) : (
                <Badge variant={subject.isLaborCostApplicable ? "default" : "secondary"}>
                  {subject.isLaborCostApplicable ? "有効" : "無効"}
                </Badge>
              )}
            </div>
          </div>

          {subject.notes && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-3">備考</h4>
                {renderField("", subject.notes, "notes")}
              </div>
            </>
          )}

          <Separator />

          <div>
            <h4 className="text-sm font-semibold mb-3">メタ情報</h4>
            <div className="grid grid-cols-2 gap-4">
              {renderField("作成日時", new Date(subject.createdAt).toLocaleString("ja-JP"), undefined, false)}
              {renderField("更新日時", new Date(subject.updatedAt).toLocaleString("ja-JP"), undefined, false)}
            </div>
          </div>

          {subject.subjectClass === "AGGREGATE" && (
            <>
              <Separator />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm text-foreground">構成科目</h4>
                </div>
                <div className="text-sm text-muted-foreground">構成科目の管理は今後のバージョンで実装予定です</div>
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      {/* Actions */}
      <div className="p-4 border-t space-y-2">
        {isEditing ? (
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              キャンセル
            </Button>
            <Button className="flex-1" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              保存
            </Button>
          </div>
        ) : (
          <Button className="w-full" onClick={handleEdit}>
            <Pencil className="h-4 w-4 mr-2" />
            編集
          </Button>
        )}
      </div>
    </Card>
  )
}

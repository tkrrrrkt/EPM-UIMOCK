"use client"

import { Card, Button, Badge, ScrollArea, Separator } from "@/shared/ui"
import { Edit, ToggleLeft, ToggleRight, X, Plus } from "lucide-react"
import type { BffGroupSubjectDetailResponse } from "@epm/contracts/bff/group-subject-master"
import { format } from "date-fns"

interface GroupSubjectDetailPanelProps {
  detail: BffGroupSubjectDetailResponse | null
  onClose: () => void
  onEdit?: (detail: BffGroupSubjectDetailResponse) => void
  onDeactivate?: (id: string) => void
  onReactivate?: (id: string) => void
  onAddRollup?: (detail: BffGroupSubjectDetailResponse) => void
}

export function GroupSubjectDetailPanel({
  detail,
  onClose,
  onEdit,
  onDeactivate,
  onReactivate,
  onAddRollup,
}: GroupSubjectDetailPanelProps) {
  if (!detail) {
    return null
  }

  const isParentCompany = detail.isParentCompany
  const canEdit = isParentCompany

  return (
    <Card className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold text-foreground">科目詳細</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Header Section */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-foreground">{detail.groupSubjectName}</h3>
                  <Badge variant={detail.isActive ? "default" : "destructive"}>
                    {detail.isActive ? "有効" : "無効"}
                  </Badge>
                </div>
                <p className="font-mono text-sm text-muted-foreground">{detail.groupSubjectCode}</p>
                {detail.groupSubjectNameShort && (
                  <p className="text-sm text-muted-foreground">略称: {detail.groupSubjectNameShort}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <Badge variant="outline">{detail.subjectClass === "BASE" ? "通常科目" : "集計科目"}</Badge>
              <Badge variant="secondary">{detail.subjectType}</Badge>
              {detail.postingAllowed && <Badge variant="default">計上可</Badge>}
            </div>
          </div>

          <Separator />

          {/* Basic Information */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-foreground">基本情報</h4>
            <div className="grid gap-3 text-sm">
              <DetailRow label="メジャー種別" value={detail.measureKind} />
              <DetailRow label="単位" value={detail.unit || "-"} />
              <DetailRow label="スケール" value={String(detail.scale)} />
              <DetailRow label="集計方法" value={detail.aggregationMethod} />
            </div>
          </div>

          {/* Financial Attributes (FIN only) */}
          {detail.subjectType === "FIN" && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-foreground">財務属性</h4>
                <div className="grid gap-3 text-sm">
                  <DetailRow
                    label="財務諸表区分"
                    value={
                      detail.finStmtClass === "PL" ? "損益計算書" : detail.finStmtClass === "BS" ? "貸借対照表" : "-"
                    }
                  />
                  <DetailRow label="勘定要素" value={detail.glElement || "-"} />
                  <DetailRow
                    label="正常残高"
                    value={detail.normalBalance === "debit" ? "借方" : detail.normalBalance === "credit" ? "貸方" : "-"}
                  />
                  <DetailRow label="控除科目" value={detail.isContra ? "はい" : "いいえ"} />
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          {detail.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-foreground">備考</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{detail.notes}</p>
              </div>
            </>
          )}

          {/* Rollup Section (AGGREGATE only) */}
          {detail.subjectClass === "AGGREGATE" && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-foreground">構成科目</h4>
                  {canEdit && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAddRollup?.(detail)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      追加
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  この集計科目に含まれる構成科目はツリー上で子ノードとして表示されます。
                  構成科目を追加するには「追加」ボタンをクリックしてください。
                </p>
              </div>
            </>
          )}

          {/* Metadata */}
          <Separator />
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-foreground">メタ情報</h4>
            <div className="grid gap-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>作成日時</span>
                <span>{format(new Date(detail.createdAt), "yyyy/MM/dd HH:mm")}</span>
              </div>
              <div className="flex justify-between">
                <span>更新日時</span>
                <span>{format(new Date(detail.updatedAt), "yyyy/MM/dd HH:mm")}</span>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Actions */}
      {canEdit && (
        <div className="p-4 border-t space-y-2">
          <Button className="w-full" onClick={() => onEdit?.(detail)}>
            <Edit className="h-4 w-4 mr-2" />
            編集
          </Button>
          {detail.isActive ? (
            <Button variant="outline" className="w-full bg-transparent" onClick={() => onDeactivate?.(detail.id)}>
              <ToggleLeft className="h-4 w-4 mr-2" />
              無効化
            </Button>
          ) : (
            <Button variant="outline" className="w-full bg-transparent" onClick={() => onReactivate?.(detail.id)}>
              <ToggleRight className="h-4 w-4 mr-2" />
              再有効化
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start">
      <span className="text-muted-foreground font-medium">{label}</span>
      <span className="text-foreground text-right">{value}</span>
    </div>
  )
}

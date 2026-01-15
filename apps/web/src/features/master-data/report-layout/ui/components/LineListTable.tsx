"use client"

import type { BffLineSummary } from "@epm/contracts/bff/report-layout"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Button } from "@/shared/ui"
import { LINE_TYPE_ICONS } from "../lib/line-type-labels"

interface LineListTableProps {
  lines: BffLineSummary[]
  onEdit: (lineId: string) => void
  onDelete: (lineId: string) => void
  onMove: (lineId: string, targetLineNo: number) => void
}

export function LineListTable({ lines, onEdit, onDelete }: LineListTableProps) {
  if (lines.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">行が登録されていません</div>
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">No.</TableHead>
            <TableHead className="w-24">種別</TableHead>
            <TableHead>表示内容</TableHead>
            <TableHead className="w-24">スタイル</TableHead>
            <TableHead className="w-28">入力設定</TableHead>
            <TableHead className="w-32 text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lines.map((line) => (
            <TableRow key={line.id}>
              <TableCell className="font-mono text-muted-foreground">{line.lineNo}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs font-mono">
                  {LINE_TYPE_ICONS[line.lineType]}
                </Badge>
              </TableCell>
              <TableCell>
                <div
                  style={{ paddingLeft: `${line.indentLevel * 1}rem` }}
                  className={line.isBold ? "font-bold" : ""}
                >
                  {line.lineType === "blank" ? (
                    <span className="text-muted-foreground italic">（空白行）</span>
                  ) : line.lineType === "account" ? (
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        {line.subjectCode}
                      </span>
                      <span>{line.displayName || line.subjectName}</span>
                    </div>
                  ) : (
                    line.displayName
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {line.isBold && (
                    <Badge variant="secondary" className="text-xs">
                      B
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {line.confidenceEnabled && (
                    <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                      確度
                    </Badge>
                  )}
                  {line.wnbEnabled && (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      W/N/B
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button size="sm" variant="outline" onClick={() => onEdit(line.id)}>
                    編集
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive"
                    onClick={() => onDelete(line.id)}
                  >
                    削除
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Button } from "@/shared/ui"
import type { BffGroupLineSummary } from "@epm/contracts/bff/group-report-layout"
import { LINE_TYPE_LABELS, LINE_TYPE_ICONS } from "../lib/line-type-labels"

interface LineListTableProps {
  lines: BffGroupLineSummary[]
  canEdit: boolean
  onEditLine: (line: BffGroupLineSummary) => void
  onDeleteLine: (line: BffGroupLineSummary) => void
}

export function LineListTable({ lines, canEdit, onEditLine, onDeleteLine }: LineListTableProps) {
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
            {canEdit && <TableHead className="w-32 text-right">操作</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {lines.map((line) => (
            <TableRow
              key={line.id}
              className={`${line.bgHighlight ? "bg-yellow-50 dark:bg-yellow-900/20" : ""}`}
            >
              <TableCell className="font-mono text-muted-foreground">{line.lineNo}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs font-mono">
                  {LINE_TYPE_ICONS[line.lineType]}
                </Badge>
              </TableCell>
              <TableCell>
                <div
                  style={{ paddingLeft: `${line.indentLevel * 1}rem` }}
                  className={`
                    ${line.isBold ? "font-bold" : ""}
                    ${line.isUnderline ? "underline" : ""}
                    ${line.isDoubleUnderline ? "underline decoration-double" : ""}
                  `}
                >
                  {line.lineType === "blank" ? (
                    <span className="text-muted-foreground italic">（空白行）</span>
                  ) : line.lineType === "account" ? (
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        {line.groupSubjectCode}
                      </span>
                      <span>{line.displayName || line.groupSubjectName}</span>
                      {line.subjectClass && (
                        <Badge variant="secondary" className="text-xs">
                          {line.subjectClass === "BASE" ? "基礎" : "集計"}
                        </Badge>
                      )}
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
                  {line.isUnderline && (
                    <Badge variant="secondary" className="text-xs">
                      U
                    </Badge>
                  )}
                  {line.isDoubleUnderline && (
                    <Badge variant="secondary" className="text-xs">
                      U2
                    </Badge>
                  )}
                  {line.bgHighlight && (
                    <Badge variant="secondary" className="text-xs">
                      HL
                    </Badge>
                  )}
                </div>
              </TableCell>
              {canEdit && (
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="outline" onClick={() => onEditLine(line)}>
                      編集
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive"
                      onClick={() => onDeleteLine(line)}
                    >
                      削除
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

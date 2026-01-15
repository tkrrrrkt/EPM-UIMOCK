"use client"

import type { BffLayoutSummary } from "@epm/contracts/bff/report-layout"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Button } from "@/shared/ui"
import { LAYOUT_TYPE_LABELS } from "../lib/layout-type-labels"

interface LayoutListTableProps {
  layouts: BffLayoutSummary[]
  page: number
  pageSize: number
  totalCount: number
  onPageChange: (page: number) => void
  onRowClick: (layoutId: string) => void
}

export function LayoutListTable({
  layouts,
  page,
  pageSize,
  totalCount,
  onPageChange,
  onRowClick,
}: LayoutListTableProps) {
  const totalPages = Math.ceil(totalCount / pageSize)

  if (layouts.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">レイアウトが見つかりません</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">種別</TableHead>
              <TableHead className="w-40">レイアウトコード</TableHead>
              <TableHead>レイアウト名</TableHead>
              <TableHead>会社名</TableHead>
              <TableHead className="w-24 text-right">行数</TableHead>
              <TableHead className="w-32 text-center">状態</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {layouts.map((layout) => (
              <TableRow
                key={layout.id}
                className={`cursor-pointer hover:bg-muted/50 ${!layout.isActive ? "opacity-60" : ""}`}
                onClick={() => onRowClick(layout.id)}
              >
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {LAYOUT_TYPE_LABELS[layout.layoutType]}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono">{layout.layoutCode}</TableCell>
                <TableCell>{layout.layoutName}</TableCell>
                <TableCell>{layout.companyName || "全社共通"}</TableCell>
                <TableCell className="text-right">{layout.lineCount}</TableCell>
                <TableCell className="text-center">
                  {layout.isActive ? (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      有効
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      無効
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
            前へ
          </Button>
          <span className="px-4 py-2 text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            次へ
          </Button>
        </div>
      )}
    </div>
  )
}

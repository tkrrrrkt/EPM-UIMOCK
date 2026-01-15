"use client"

import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Button,
} from "@/shared/ui"
import type { BffGroupLayoutSummary, BffGroupLayoutListResponse } from "@epm/contracts/bff/group-report-layout"
import { LAYOUT_TYPE_SHORT_LABELS } from "../lib/layout-type-labels"

interface LayoutListTableProps {
  layouts: BffGroupLayoutListResponse
  page: number
  onPageChange: (page: number) => void
}

export function LayoutListTable({ layouts, page, onPageChange }: LayoutListTableProps) {
  const router = useRouter()

  const handleRowClick = (layout: BffGroupLayoutSummary) => {
    router.push(`/master-data/group-report-layout/${layout.id}`)
  }

  if (layouts.items.length === 0) {
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
              <TableHead className="w-24 text-right">行数</TableHead>
              <TableHead className="w-32 text-center">状態</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {layouts.items.map((layout) => (
              <TableRow
                key={layout.id}
                className={`cursor-pointer hover:bg-muted/50 ${!layout.isActive ? "opacity-60" : ""}`}
                onClick={() => handleRowClick(layout)}
              >
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {LAYOUT_TYPE_SHORT_LABELS[layout.layoutType]}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono">{layout.layoutCode}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {layout.layoutName}
                    {layout.isDefault && (
                      <Badge variant="default" className="text-xs">
                        デフォルト
                      </Badge>
                    )}
                  </div>
                </TableCell>
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

      {layouts.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
            前へ
          </Button>
          <span className="px-4 py-2 text-sm text-muted-foreground">
            {page} / {layouts.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === layouts.totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            次へ
          </Button>
        </div>
      )}
    </div>
  )
}

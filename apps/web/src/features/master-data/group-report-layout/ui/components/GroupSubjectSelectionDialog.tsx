"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
} from "@/shared/ui"
import type { BffGroupSubjectSummary, LayoutType } from "@epm/contracts/bff/group-report-layout"
import { bffClient } from "../api/client"

interface GroupSubjectSelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  layoutType: LayoutType
  onSelect: (subject: BffGroupSubjectSummary) => void
}

export function GroupSubjectSelectionDialog({
  open,
  onOpenChange,
  layoutType,
  onSelect,
}: GroupSubjectSelectionDialogProps) {
  const [keyword, setKeyword] = useState("")
  const [subjects, setSubjects] = useState<BffGroupSubjectSummary[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      loadSubjects()
    }
  }, [open, page, layoutType])

  const loadSubjects = async () => {
    setIsLoading(true)
    try {
      const response = await bffClient.searchGroupSubjects({
        layoutType,
        keyword: keyword || undefined,
        page,
        pageSize: 10,
      })
      setSubjects(response.items)
      setTotalPages(response.totalPages)
    } catch (error) {
      console.error("[v0] Failed to load group subjects:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    loadSubjects()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>連結科目選択</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <Input
              placeholder="科目コード・科目名で検索"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch()
                }
              }}
              className="flex-1"
            />
            <Button onClick={handleSearch}>検索</Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">読み込み中...</div>
          ) : subjects.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">連結科目が見つかりません</div>
          ) : (
            <>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>科目コード</TableHead>
                      <TableHead>科目名</TableHead>
                      <TableHead className="w-24">科目クラス</TableHead>
                      <TableHead className="w-24 text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects.map((subject) => (
                      <TableRow key={subject.id}>
                        <TableCell className="font-mono">{subject.groupSubjectCode}</TableCell>
                        <TableCell>{subject.groupSubjectName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {subject.subjectClass === "BASE" ? "基礎" : "集計"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" onClick={() => onSelect(subject)}>
                            選択
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-2">
                  <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                    前へ
                  </Button>
                  <span className="px-4 py-2 text-sm text-muted-foreground">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    次へ
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

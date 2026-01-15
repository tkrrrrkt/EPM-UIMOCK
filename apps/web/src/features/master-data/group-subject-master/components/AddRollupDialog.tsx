"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Badge,
  ScrollArea,
  Label,
} from "@/shared/ui"
import { ChevronRight, ChevronDown, Folder, FileText, Plus, Minus, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import type {
  BffGroupSubjectTreeNode,
  BffAddGroupRollupRequest,
} from "@epm/contracts/bff/group-subject-master"

interface AddRollupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  parentSubject: { id: string; groupSubjectName: string } | null
  availableSubjects: BffGroupSubjectTreeNode[]
  onSubmit: (parentId: string, request: BffAddGroupRollupRequest) => Promise<void>
}

export function AddRollupDialog({
  open,
  onOpenChange,
  parentSubject,
  availableSubjects,
  onSubmit,
}: AddRollupDialogProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)
  const [coefficient, setCoefficient] = useState<1 | -1>(1)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!parentSubject || !selectedSubjectId) return

    setIsSubmitting(true)
    try {
      await onSubmit(parentSubject.id, {
        componentGroupSubjectId: selectedSubjectId,
        coefficient,
      })
      handleClose()
    } catch (error) {
      // エラーは親コンポーネントでハンドリング
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setSelectedSubjectId(null)
    setCoefficient(1)
    setSearchKeyword("")
    onOpenChange(false)
  }

  // 検索フィルタ
  const filterSubjects = (subjects: BffGroupSubjectTreeNode[]): BffGroupSubjectTreeNode[] => {
    if (!searchKeyword.trim()) return subjects
    const keyword = searchKeyword.toLowerCase()
    return subjects.filter(
      (s) =>
        s.groupSubjectCode.toLowerCase().includes(keyword) ||
        s.groupSubjectName.toLowerCase().includes(keyword)
    )
  }

  const filteredSubjects = filterSubjects(availableSubjects)

  const selectedSubject = availableSubjects.find((s) => s.id === selectedSubjectId)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>構成科目を追加</DialogTitle>
          <DialogDescription>
            「{parentSubject?.groupSubjectName}」に追加する構成科目を選択してください
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden">
          {/* 検索ボックス */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="科目コードまたは科目名で検索..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* 科目選択リスト */}
          <div className="border rounded-lg">
            <div className="p-2 border-b bg-muted/50">
              <span className="text-sm font-medium text-muted-foreground">
                選択可能な科目 ({filteredSubjects.length}件)
              </span>
            </div>
            <ScrollArea className="h-[280px]">
              <div className="p-2 space-y-1">
                {filteredSubjects.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    該当する科目がありません
                  </div>
                ) : (
                  filteredSubjects.map((subject) => (
                    <SubjectSelectItem
                      key={subject.id}
                      subject={subject}
                      isSelected={selectedSubjectId === subject.id}
                      onSelect={() => setSelectedSubjectId(subject.id)}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* 選択中の科目表示 */}
          {selectedSubject && (
            <div className="p-3 border rounded-lg bg-accent/50">
              <Label className="text-xs text-muted-foreground">選択中</Label>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-sm">{selectedSubject.groupSubjectCode}</span>
                <span className="text-sm font-medium">{selectedSubject.groupSubjectName}</span>
                <Badge variant="outline" className="text-xs">
                  {selectedSubject.subjectClass === "BASE" ? "通常" : "集計"}
                </Badge>
              </div>
            </div>
          )}

          {/* 係数選択 */}
          <div className="space-y-2">
            <Label>係数</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={coefficient === 1 ? "default" : "outline"}
                className="flex-1"
                onClick={() => setCoefficient(1)}
              >
                <Plus className="h-4 w-4 mr-2" />
                +1（加算）
              </Button>
              <Button
                type="button"
                variant={coefficient === -1 ? "destructive" : "outline"}
                className="flex-1"
                onClick={() => setCoefficient(-1)}
              >
                <Minus className="h-4 w-4 mr-2" />
                -1（減算）
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              +1: 親科目の計算に加算されます / -1: 親科目の計算から減算されます
            </p>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedSubjectId || isSubmitting}>
            {isSubmitting ? "追加中..." : "追加"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// 科目選択アイテム
function SubjectSelectItem({
  subject,
  isSelected,
  onSelect,
}: {
  subject: BffGroupSubjectTreeNode
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors",
        isSelected
          ? "bg-primary/10 border border-primary/30"
          : "hover:bg-accent border border-transparent",
        !subject.isActive && "opacity-60"
      )}
      onClick={onSelect}
    >
      {subject.subjectClass === "AGGREGATE" ? (
        <Folder className="h-4 w-4 text-secondary shrink-0" />
      ) : (
        <FileText className="h-4 w-4 text-primary shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-muted-foreground">
            {subject.groupSubjectCode}
          </span>
          <span className="text-sm truncate">{subject.groupSubjectName}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Badge variant="outline" className="text-xs">
          {subject.subjectClass === "BASE" ? "通常" : "集計"}
        </Badge>
        <Badge variant="secondary" className="text-xs">
          {subject.subjectType}
        </Badge>
        {!subject.isActive && (
          <Badge variant="destructive" className="text-xs">
            無効
          </Badge>
        )}
      </div>
    </div>
  )
}

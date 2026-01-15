"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
} from "@/shared/ui"
import { AlertTriangle } from "lucide-react"
import type { BffGroupSubjectDetailResponse } from "@epm/contracts/bff/group-subject-master"

interface ConfirmDeactivateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subject: BffGroupSubjectDetailResponse | null
  onConfirm: () => void
}

export function ConfirmDeactivateDialog({ open, onOpenChange, subject, onConfirm }: ConfirmDeactivateDialogProps) {
  if (!subject) return null

  const isAggregate = subject.subjectClass === "AGGREGATE"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <DialogTitle>科目を無効化しますか？</DialogTitle>
          </div>
          <DialogDescription className="pt-4">
            <span className="font-semibold text-foreground">{subject.groupSubjectName}</span> を無効化します。
            <br />
            <br />
            {isAggregate ? (
              <>
                この科目を無効化すると、子となっているrollup関係が削除されます。
                <br />
                子科目自体は有効なまま残ります。
              </>
            ) : (
              "無効化した科目は再度有効化することができます。"
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            無効化
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

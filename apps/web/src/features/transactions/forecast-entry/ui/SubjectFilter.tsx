"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/shared/ui/components/badge"
import { Button } from "@/shared/ui/components/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/components/popover"
import { Checkbox } from "@/shared/ui/components/checkbox"
import type { BffSubjectSummary } from "@epm/contracts/bff/forecast-entry"

// ============================================
// Types
// ============================================

interface SubjectFilterProps {
  subjects: BffSubjectSummary[]
  selectedSubjectIds: string[]
  onSelectionChange: (subjectIds: string[]) => void
  disabled?: boolean
}

// ============================================
// Component
// ============================================

export function SubjectFilter({
  subjects,
  selectedSubjectIds,
  onSelectionChange,
  disabled = false,
}: SubjectFilterProps) {
  const [open, setOpen] = React.useState(false)

  const handleToggle = (subjectId: string) => {
    if (selectedSubjectIds.includes(subjectId)) {
      onSelectionChange(selectedSubjectIds.filter((id) => id !== subjectId))
    } else {
      onSelectionChange([...selectedSubjectIds, subjectId])
    }
  }

  const handleClear = () => {
    onSelectionChange([])
  }

  const selectedSubjects = subjects.filter((s) => selectedSubjectIds.includes(s.id))

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            disabled={disabled}
          >
            科目を選択
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="start">
          <div className="space-y-1">
            {subjects.map((subject) => (
              <label
                key={subject.id}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-muted",
                  subject.class === "AGGREGATE" && "text-muted-foreground"
                )}
              >
                <Checkbox
                  checked={selectedSubjectIds.includes(subject.id)}
                  onCheckedChange={() => handleToggle(subject.id)}
                />
                <span className="text-sm">
                  {subject.class === "AGGREGATE" ? `【${subject.name}】` : subject.name}
                </span>
              </label>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* 選択された科目のバッジ */}
      {selectedSubjects.map((subject) => (
        <Badge
          key={subject.id}
          variant="secondary"
          className="gap-1 cursor-pointer"
          onClick={() => handleToggle(subject.id)}
        >
          {subject.name}
          <X className="h-3 w-3" />
        </Badge>
      ))}

      {/* クリアボタン */}
      {selectedSubjectIds.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={handleClear}
        >
          クリア
        </Button>
      )}
    </div>
  )
}

"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Badge,
} from "@/shared/ui"
import type { BffSubjectSummary } from "@epm/contracts/bff/budget-entry"

interface SubjectFilterProps {
  subjects: BffSubjectSummary[]
  selectedSubjectIds: string[]
  onSelectionChange: (subjectIds: string[]) => void
  disabled?: boolean
}

export function SubjectFilter({
  subjects,
  selectedSubjectIds,
  onSelectionChange,
  disabled = false,
}: SubjectFilterProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (subjectId: string) => {
    if (selectedSubjectIds.includes(subjectId)) {
      onSelectionChange(selectedSubjectIds.filter(id => id !== subjectId))
    } else {
      onSelectionChange([...selectedSubjectIds, subjectId])
    }
  }

  const handleClear = () => {
    onSelectionChange([])
  }

  const selectedSubjects = subjects.filter(s => selectedSubjectIds.includes(s.id))

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[240px] justify-between"
            disabled={disabled}
          >
            {selectedSubjectIds.length === 0
              ? "科目でフィルター..."
              : `${selectedSubjectIds.length}件選択`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-0">
          <Command>
            <CommandInput placeholder="科目を検索..." />
            <CommandList>
              <CommandEmpty>科目が見つかりません</CommandEmpty>
              <CommandGroup>
                {subjects.map((subject) => (
                  <CommandItem
                    key={subject.id}
                    value={subject.name}
                    onSelect={() => handleSelect(subject.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedSubjectIds.includes(subject.id)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <span className={cn(
                      subject.class === "AGGREGATE" && "text-muted-foreground"
                    )}>
                      {subject.code} - {subject.name}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* 選択された科目をバッジで表示 */}
      {selectedSubjects.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {selectedSubjects.map((subject) => (
            <Badge
              key={subject.id}
              variant="secondary"
              className="gap-1 pr-1"
            >
              {subject.name}
              <button
                type="button"
                onClick={() => handleSelect(subject.id)}
                className="ml-1 rounded-full hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-6 px-2 text-xs"
          >
            クリア
          </Button>
        </div>
      )}
    </div>
  )
}

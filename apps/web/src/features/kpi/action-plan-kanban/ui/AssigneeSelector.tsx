"use client"

import { Button } from "@/shared/ui/components/button"
import { Avatar, AvatarFallback } from "@/shared/ui/components/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/components/popover"
import { Check } from "lucide-react"
import type { BffAssigneeBrief } from "../types"

const mockAvailableAssignees: BffAssigneeBrief[] = [
  { employeeId: "emp-001", employeeName: "山田太郎" },
  { employeeId: "emp-002", employeeName: "佐藤花子" },
  { employeeId: "emp-003", employeeName: "鈴木一郎" },
  { employeeId: "emp-004", employeeName: "田中美咲" },
  { employeeId: "emp-005", employeeName: "高橋健太" },
]

interface AssigneeSelectorProps {
  selectedAssignees: BffAssigneeBrief[]
  onToggle: (employeeId: string, isSelected: boolean) => void
}

export function AssigneeSelector({ selectedAssignees, onToggle }: AssigneeSelectorProps) {
  const selectedIds = new Set(selectedAssignees.map((a) => a.employeeId))

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 bg-transparent">
          担当者
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm mb-3">担当者を選択</h4>
          <div className="space-y-1">
            {mockAvailableAssignees.map((assignee) => {
              const isSelected = selectedIds.has(assignee.employeeId)
              return (
                <button
                  key={assignee.employeeId}
                  type="button"
                  className="w-full flex items-center gap-3 p-2 rounded hover:bg-muted transition-colors"
                  onClick={() => onToggle(assignee.employeeId, isSelected)}
                >
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs">{assignee.employeeName.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-left text-sm">{assignee.employeeName}</span>
                  {isSelected && <Check className="h-4 w-4 text-primary" />}
                </button>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

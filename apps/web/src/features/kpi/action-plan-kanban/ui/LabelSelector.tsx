"use client"

import { Button } from "@/shared/ui/components/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/components/popover"
import { Check } from "lucide-react"
import type { BffTaskLabel, BffTaskLabelBrief } from "../types"

interface LabelSelectorProps {
  availableLabels: BffTaskLabel[]
  selectedLabels: BffTaskLabelBrief[]
  onToggle: (labelId: string, isSelected: boolean) => void
}

export function LabelSelector({ availableLabels, selectedLabels, onToggle }: LabelSelectorProps) {
  const selectedIds = new Set(selectedLabels.map((l) => l.id))

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 bg-transparent">
          ラベル
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm mb-3">ラベルを選択</h4>
          <div className="space-y-1">
            {availableLabels.map((label) => {
              const isSelected = selectedIds.has(label.id)
              return (
                <button
                  key={label.id}
                  type="button"
                  className="w-full flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors"
                  onClick={() => onToggle(label.id, isSelected)}
                >
                  <div className="w-8 h-5 rounded shrink-0" style={{ backgroundColor: label.colorCode }} />
                  <span className="flex-1 text-left text-sm">{label.labelName}</span>
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

"use client"

import { Button } from "@/shared/ui/components/button"
import type { ViewPeriod } from "../types"

interface PeriodSelectorProps {
  value: ViewPeriod
  onChange: (period: ViewPeriod) => void
}

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="flex gap-1 bg-muted p-1 rounded-lg">
      <Button
        variant={value === "day" ? "default" : "ghost"}
        size="sm"
        onClick={() => onChange("day")}
        className="text-xs"
      >
        日
      </Button>
      <Button
        variant={value === "week" ? "default" : "ghost"}
        size="sm"
        onClick={() => onChange("week")}
        className="text-xs"
      >
        週
      </Button>
      <Button
        variant={value === "month" ? "default" : "ghost"}
        size="sm"
        onClick={() => onChange("month")}
        className="text-xs"
      >
        月
      </Button>
    </div>
  )
}

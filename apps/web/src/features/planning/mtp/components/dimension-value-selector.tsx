"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label } from "@/shared/ui"
import type { BffDimensionValueSummary } from "@epm/contracts/bff/mtp"

interface DimensionValueSelectorProps {
  dimensionValues: BffDimensionValueSummary[]
  value: string
  onChange: (value: string) => void
}

export function DimensionValueSelector({ dimensionValues, value, onChange }: DimensionValueSelectorProps) {
  return (
    <div className="flex items-center gap-4">
      <Label className="text-sm font-medium">組織単位</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="選択してください" />
        </SelectTrigger>
        <SelectContent>
          {dimensionValues.map((dv) => (
            <SelectItem key={dv.id} value={dv.id}>
              {dv.valueName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

"use client"

import { Button } from "@/shared/ui/components/button"
import { Card, CardContent } from "@/shared/ui/components/card"
import { Label } from "@/shared/ui/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/components/select"
import { Checkbox } from "@/shared/ui/components/checkbox"
import type { FilterState } from "../types"

interface FilterPanelProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
  onClose: () => void
}

export function FilterPanel({ filters, onChange, onClose }: FilterPanelProps) {
  return (
    <Card className="w-80">
      <CardContent className="p-4 space-y-4">
        <div>
          <Label className="text-sm font-medium mb-2 block">担当部門</Label>
          <Select
            value={filters.departmentStableId || "all"}
            onValueChange={(value) =>
              onChange({
                ...filters,
                departmentStableId: value === "all" ? null : value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="すべて" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="dept-planning">企画部</SelectItem>
              <SelectItem value="dept-sales">営業部</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="milestonesOnly"
            checked={filters.milestonesOnly}
            onCheckedChange={(checked) =>
              onChange({
                ...filters,
                milestonesOnly: checked === true,
              })
            }
          />
          <Label htmlFor="milestonesOnly" className="text-sm cursor-pointer">
            マイルストーンのみ表示
          </Label>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 bg-transparent"
            onClick={() => onChange({ departmentStableId: null, milestonesOnly: false })}
          >
            クリア
          </Button>
          <Button size="sm" className="flex-1" onClick={onClose}>
            適用
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

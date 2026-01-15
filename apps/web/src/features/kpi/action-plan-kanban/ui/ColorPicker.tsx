"use client"

import { Button } from "@/shared/ui/components/button"
import { cn } from "@/lib/utils"

const colorPresets = [
  { value: "#6B7280", label: "グレー" },
  { value: "#EF4444", label: "レッド" },
  { value: "#F59E0B", label: "アンバー" },
  { value: "#10B981", label: "エメラルド" },
  { value: "#3B82F6", label: "ブルー" },
  { value: "#8B5CF6", label: "バイオレット" },
  { value: "#EC4899", label: "ピンク" },
  { value: "#06B6D4", label: "シアン" },
]

interface ColorPickerProps {
  value: string | null
  onChange: (color: string) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {colorPresets.map((preset) => (
        <Button
          key={preset.value}
          type="button"
          variant="outline"
          className={cn("h-10 w-full p-0 border-2", value === preset.value && "ring-2 ring-primary ring-offset-2")}
          style={{ backgroundColor: preset.value }}
          onClick={() => onChange(preset.value)}
          title={preset.label}
        >
          <span className="sr-only">{preset.label}</span>
        </Button>
      ))}
    </div>
  )
}

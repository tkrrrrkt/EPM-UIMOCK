import { Badge } from "@/shared/ui/components/badge"
import type { ActionPlanPriority } from "../types"

interface PriorityBadgeProps {
  priority: ActionPlanPriority | null
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  if (!priority) {
    return <span className="text-muted-foreground">-</span>
  }

  const variants: Record<ActionPlanPriority, { label: string; className: string }> = {
    HIGH: { label: "高", className: "bg-red-100 text-red-700 border-red-200" },
    MEDIUM: { label: "中", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    LOW: { label: "低", className: "bg-gray-100 text-gray-700 border-gray-200" },
  }

  const variant = variants[priority]

  return (
    <Badge variant="outline" className={variant.className}>
      {variant.label}
    </Badge>
  )
}

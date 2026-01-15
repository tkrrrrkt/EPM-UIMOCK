import { Badge } from "@/shared/ui/components/badge"
import type { ActionPlanStatus } from "../types"

interface StatusBadgeProps {
  status: ActionPlanStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants: Record<ActionPlanStatus, { label: string; className: string }> = {
    NOT_STARTED: { label: "未着手", className: "bg-muted text-muted-foreground" },
    IN_PROGRESS: { label: "進行中", className: "bg-green-600 text-white" },
    COMPLETED: { label: "完了", className: "bg-blue-600 text-white" },
    CANCELLED: { label: "中止", className: "bg-destructive text-destructive-foreground" },
  }

  const variant = variants[status]

  return (
    <Badge variant="secondary" className={variant.className}>
      {variant.label}
    </Badge>
  )
}

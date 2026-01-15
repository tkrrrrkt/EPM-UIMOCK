import { Badge } from "@/shared/ui/components/badge"

interface StatusBadgeProps {
  status: "delayed" | "normal" | "completed"
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants = {
    delayed: { label: "遅延", className: "bg-destructive text-destructive-foreground" },
    normal: { label: "進行中", className: "bg-green-600 text-white" },
    completed: { label: "完了", className: "bg-blue-600 text-white" },
  }

  const variant = variants[status]

  return (
    <Badge variant="secondary" className={variant.className}>
      {variant.label}
    </Badge>
  )
}

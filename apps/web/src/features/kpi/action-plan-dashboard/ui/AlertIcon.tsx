import { AlertTriangle, Clock } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/components/tooltip"

interface AlertIconProps {
  type: "overdue" | "delayed"
}

export function AlertIcon({ type }: AlertIconProps) {
  const config = {
    overdue: {
      icon: Clock,
      label: "期限超過",
      className: "text-destructive",
    },
    delayed: {
      icon: AlertTriangle,
      label: "進捗遅れ",
      className: "text-orange-500",
    },
  }

  const { icon: Icon, label, className } = config[type]

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Icon className={`h-4 w-4 ${className}`} />
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

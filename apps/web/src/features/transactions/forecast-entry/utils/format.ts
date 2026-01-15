import type { ForecastVersionStatus } from "@epm/contracts/bff/forecast-entry"

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function getVersionStatusLabel(status: ForecastVersionStatus): string {
  switch (status) {
    case "DRAFT":
      return "下書き"
    case "SUBMITTED":
      return "提出済"
    case "APPROVED":
      return "承認済"
    case "FIXED":
      return "確定"
    default:
      return status
  }
}

export function getVersionStatusBadgeVariant(
  status: ForecastVersionStatus
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "FIXED":
      return "default"
    case "APPROVED":
      return "secondary"
    case "SUBMITTED":
      return "outline"
    case "DRAFT":
    default:
      return "outline"
  }
}

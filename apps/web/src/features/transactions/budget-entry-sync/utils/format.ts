/**
 * Format date string to localized display format
 */
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

/**
 * Format scenario type to Japanese label
 */
export function getScenarioLabel(scenarioType: string): string {
  switch (scenarioType) {
    case "BUDGET":
      return "予算"
    case "FORECAST":
      return "見込"
    case "ACTUAL":
      return "実績"
    default:
      return scenarioType
  }
}

/**
 * Get scenario badge variant
 */
export function getScenarioBadgeVariant(scenarioType: string): "default" | "secondary" | "outline" {
  switch (scenarioType) {
    case "BUDGET":
      return "default"
    case "FORECAST":
      return "secondary"
    case "ACTUAL":
      return "outline"
    default:
      return "secondary"
  }
}

/**
 * Format version status to Japanese label
 */
export function getVersionStatusLabel(status: string): string {
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

/**
 * Get version status badge variant
 */
export function getVersionStatusBadgeVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "FIXED":
      return "default"
    case "APPROVED":
      return "secondary"
    case "SUBMITTED":
      return "outline"
    case "DRAFT":
      return "secondary"
    default:
      return "secondary"
  }
}

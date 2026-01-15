/**
 * Formatting utilities for labor cost rate display
 */

import type { RateType, ResourceType } from "../types/bff-contracts"

export function formatTotalRate(rate: string, rateType: RateType): string {
  const numRate = Number.parseFloat(rate)
  const formatted = numRate.toLocaleString("ja-JP")

  switch (rateType) {
    case "MONTHLY":
      return `¥${formatted}`
    case "HOURLY":
      return `¥${formatted}/時`
    case "DAILY":
      return `¥${formatted}/日`
  }
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return "無期限"

  const date = new Date(dateString)
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

export function getRateTypeLabel(rateType: RateType): string {
  switch (rateType) {
    case "MONTHLY":
      return "月額"
    case "HOURLY":
      return "時給"
    case "DAILY":
      return "日給"
  }
}

export function getResourceTypeLabel(resourceType: ResourceType): string {
  return resourceType === "EMPLOYEE" ? "社員" : "外注"
}

export function formatAmount(amount: string): string {
  const numAmount = Number.parseFloat(amount)
  return `¥${numAmount.toLocaleString("ja-JP")}`
}

export function formatPercentage(percentage: string): string {
  return `${percentage}%`
}

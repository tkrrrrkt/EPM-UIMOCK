/**
 * Formatting utilities for Headcount Planning
 */

import type { ResourceType, RateType, AllocationStatus, AllocationType } from "@epm/contracts/bff/headcount-planning"

export function formatAmount(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value
  if (isNaN(num)) return "¥0"
  return `¥${num.toLocaleString()}`
}

export function formatHeadcount(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value
  if (isNaN(num)) return "0.00"
  return num.toFixed(2)
}

export function formatPercentage(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value
  if (isNaN(num)) return "0.0%"
  return `${num.toFixed(1)}%`
}

export function formatRate(totalRate: string, rateType: RateType): string {
  const num = parseFloat(totalRate)
  if (isNaN(num)) return "-"

  const suffix = {
    MONTHLY: "/月",
    HOURLY: "/時",
    DAILY: "/日",
  }[rateType]

  return `¥${num.toLocaleString()}${suffix}`
}

export function getResourceTypeLabel(type: ResourceType): string {
  return {
    EMPLOYEE: "社員",
    CONTRACTOR: "外注",
  }[type]
}

export function getRateTypeLabel(type: RateType): string {
  return {
    MONTHLY: "月額",
    HOURLY: "時給",
    DAILY: "日給",
  }[type]
}

export function getAllocationStatusLabel(status: AllocationStatus): string {
  return {
    NOT_SET: "未設定",
    PARTIAL: "一部設定",
    COMPLETE: "設定済",
  }[status]
}

export function getAllocationTypeLabel(type: AllocationType): string {
  return {
    PERCENTAGE: "割合（%）",
    HEADCOUNT: "人月数",
  }[type]
}

export function getMonthLabel(periodMonth: number): string {
  // Convert from 1-12 (Jan-Dec) to Japanese fiscal year (Apr-Mar)
  const fiscalMonth = periodMonth >= 4 ? periodMonth - 3 : periodMonth + 9
  const months = ["4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月", "1月", "2月", "3月"]
  return months[fiscalMonth - 1] ?? `${periodMonth}月`
}

export function getFiscalMonthIndex(periodMonth: number): number {
  // Convert calendar month (1-12) to fiscal month index (0-11, where 0=April)
  return periodMonth >= 4 ? periodMonth - 4 : periodMonth + 8
}

export function getCalendarMonth(fiscalMonthIndex: number): number {
  // Convert fiscal month index (0-11) to calendar month (1-12)
  return fiscalMonthIndex < 9 ? fiscalMonthIndex + 4 : fiscalMonthIndex - 8
}

// Fiscal year months in order (April to March)
export const FISCAL_MONTHS = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3]
export const FISCAL_MONTH_LABELS = ["4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月", "1月", "2月", "3月"]

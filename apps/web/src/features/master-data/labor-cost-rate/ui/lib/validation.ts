/**
 * Client-side validation utilities
 */

import type { ResourceType, BffLaborCostRateItemInput } from "../types/bff-contracts"

export interface ValidationError {
  field: string
  message: string
}

export function validateRateCode(value: string): string | null {
  if (!value) return "単価コードは必須です"
  if (value.length > 50) return "単価コードは50文字以内で入力してください"
  if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
    return "単価コードは半角英数字、ハイフン、アンダースコアのみ使用できます"
  }
  return null
}

export function validateJobCategory(value: string): string | null {
  if (!value) return "職種は必須です"
  if (value.length > 50) return "職種は50文字以内で入力してください"
  return null
}

export function validateGrade(value: string): string | null {
  if (value && value.length > 50) return "等級は50文字以内で入力してください"
  return null
}

export function validateEmploymentType(value: string): string | null {
  if (value && value.length > 50) return "雇用区分は50文字以内で入力してください"
  return null
}

export function validateVendorName(value: string, resourceType: ResourceType): string | null {
  if (resourceType === "CONTRACTOR") {
    if (!value) return "外注先名は外注の場合必須です"
    if (value.length > 100) return "外注先名は100文字以内で入力してください"
  }
  return null
}

export function validateDateRange(effectiveDate: string, expiryDate: string | null): string | null {
  if (!effectiveDate) return "有効開始日は必須です"

  if (expiryDate) {
    const effective = new Date(effectiveDate)
    const expiry = new Date(expiryDate)
    if (expiry <= effective) {
      return "有効終了日は有効開始日より後である必要があります"
    }
  }

  return null
}

export function validateItemAmount(value: string): string | null {
  if (!value) return "金額は必須です"
  const num = Number.parseFloat(value)
  if (isNaN(num)) return "金額は数値で入力してください"
  if (num <= 0) return "金額は正の数値で入力してください"
  // Check decimal places
  const decimalPlaces = (value.split(".")[1] || "").length
  if (decimalPlaces > 2) return "金額は小数点以下2桁までです"
  return null
}

export function validateItems(items: BffLaborCostRateItemInput[]): string | null {
  if (!items || items.length === 0) {
    return "科目別内訳は1件以上必要です"
  }

  // Check for duplicate subjects
  const subjectIds = items.map((item) => item.subjectId)
  const uniqueSubjectIds = new Set(subjectIds)
  if (subjectIds.length !== uniqueSubjectIds.size) {
    return "同一科目を複数指定することはできません"
  }

  // Validate each item
  for (const item of items) {
    if (!item.subjectId) {
      return "科目は必須です"
    }
    const amountError = validateItemAmount(item.amount)
    if (amountError) {
      return amountError
    }
  }

  return null
}

/**
 * Company Master UI Constants
 *
 * 選択肢・ラベル・エラーメッセージの定義
 */

import type { ConsolidationType } from '@epm/contracts/bff/company-master'

export const CONSOLIDATION_TYPE_LABELS: Record<ConsolidationType, string> = {
  full: '完全連結',
  equity: '持分法',
  none: '非連結',
}

export const CURRENCY_OPTIONS = [
  { value: 'JPY', label: '日本円 (JPY)' },
  { value: 'USD', label: '米ドル (USD)' },
  { value: 'EUR', label: 'ユーロ (EUR)' },
  { value: 'CNY', label: '人民元 (CNY)' },
  { value: 'GBP', label: '英ポンド (GBP)' },
  { value: 'KRW', label: '韓国ウォン (KRW)' },
  { value: 'TWD', label: '台湾ドル (TWD)' },
  { value: 'SGD', label: 'シンガポールドル (SGD)' },
  { value: 'THB', label: 'タイバーツ (THB)' },
  { value: 'VND', label: 'ベトナムドン (VND)' },
] as const

export const TIMEZONE_OPTIONS = [
  { value: 'Asia/Tokyo', label: '日本標準時 (JST)' },
  { value: 'Asia/Shanghai', label: '中国標準時 (CST)' },
  { value: 'Asia/Singapore', label: 'シンガポール標準時 (SGT)' },
  { value: 'Asia/Bangkok', label: 'タイ標準時 (ICT)' },
  { value: 'Asia/Ho_Chi_Minh', label: 'ベトナム標準時 (ICT)' },
  { value: 'America/New_York', label: '米国東部時間 (EST/EDT)' },
  { value: 'America/Los_Angeles', label: '米国太平洋時間 (PST/PDT)' },
  { value: 'Europe/London', label: '英国標準時 (GMT/BST)' },
  { value: 'Europe/Paris', label: '中央ヨーロッパ時間 (CET/CEST)' },
] as const

export const FISCAL_MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: (i + 1).toString(),
  label: `${i + 1}月決算`,
}))

export const ERROR_MESSAGES: Record<string, string> = {
  COMPANY_NOT_FOUND: '法人が見つかりません',
  COMPANY_CODE_DUPLICATE: '法人コードが重複しています',
  COMPANY_ALREADY_INACTIVE: 'この法人は既に無効化されています',
  COMPANY_ALREADY_ACTIVE: 'この法人は既に有効です',
  PARENT_COMPANY_NOT_FOUND: '親法人が見つかりません',
  SELF_REFERENCE_NOT_ALLOWED: '自身を親法人に設定することはできません',
  VALIDATION_ERROR: '入力内容に誤りがあります',
}

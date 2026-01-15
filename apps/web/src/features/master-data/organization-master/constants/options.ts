import type { OrgUnitType, ResponsibilityType, OrganizationMasterErrorCode } from '@epm/contracts/bff/organization-master'

export const ORG_UNIT_TYPE_OPTIONS: { value: OrgUnitType; label: string }[] = [
  { value: 'company', label: '会社' },
  { value: 'headquarters', label: '本部' },
  { value: 'division', label: '事業部' },
  { value: 'department', label: '部' },
  { value: 'section', label: '課' },
  { value: 'team', label: 'チーム' },
]

export const RESPONSIBILITY_TYPE_OPTIONS: { value: ResponsibilityType; label: string }[] = [
  { value: 'profit_center', label: 'プロフィットセンター' },
  { value: 'cost_center', label: 'コストセンター' },
  { value: 'investment_center', label: '投資センター' },
  { value: 'revenue_center', label: 'レベニューセンター' },
]

export const ERROR_MESSAGES: Record<OrganizationMasterErrorCode, string> = {
  VERSION_NOT_FOUND: '指定されたバージョンが見つかりません',
  VERSION_CODE_DUPLICATE: 'このバージョンコードは既に使用されています',
  VERSION_DATE_OVERLAP: '有効期間が他のバージョンと重複しています',
  DEPARTMENT_NOT_FOUND: '指定された部門が見つかりません',
  DEPARTMENT_CODE_DUPLICATE: 'この部門コードは既に使用されています',
  DEPARTMENT_HAS_CHILDREN: '子部門が存在するため削除できません',
  PARENT_DEPARTMENT_NOT_FOUND: '親部門が見つかりません',
  CIRCULAR_HIERARCHY_DETECTED: '循環参照が検出されました',
  DEPARTMENT_ALREADY_INACTIVE: '部門は既に無効化されています',
  DEPARTMENT_ALREADY_ACTIVE: '部門は既に有効です',
  VALIDATION_ERROR: '入力値が不正です',
}

export function getOrgUnitTypeLabel(type: OrgUnitType | null): string {
  if (!type) return '-'
  const option = ORG_UNIT_TYPE_OPTIONS.find((o) => o.value === type)
  return option?.label ?? type
}

export function getResponsibilityTypeLabel(type: ResponsibilityType | null): string {
  if (!type) return '-'
  const option = RESPONSIBILITY_TYPE_OPTIONS.find((o) => o.value === type)
  return option?.label ?? type
}

export function getErrorMessage(code: string): string {
  return ERROR_MESSAGES[code as OrganizationMasterErrorCode] ?? 'エラーが発生しました'
}

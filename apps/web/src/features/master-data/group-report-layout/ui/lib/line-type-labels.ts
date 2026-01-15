import type { LineType, SignDisplayPolicy } from "@epm/contracts/bff/group-report-layout"

export const LINE_TYPE_LABELS: Record<LineType, string> = {
  header: "見出し",
  account: "科目",
  note: "注記",
  blank: "空白",
}

export const LINE_TYPE_ICONS: Record<LineType, string> = {
  header: "H",
  account: "A",
  note: "N",
  blank: "-",
}

export const SIGN_DISPLAY_POLICY_LABELS: Record<SignDisplayPolicy, string> = {
  auto: "自動",
  force_plus: "常に+",
  force_minus: "常に-",
  force_paren: "括弧表示",
}

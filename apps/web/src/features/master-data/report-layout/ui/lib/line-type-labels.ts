import type { LineType } from "@epm/contracts/bff/report-layout"

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

import type { LayoutType } from "@epm/contracts/bff/group-report-layout"

export const LAYOUT_TYPE_LABELS: Record<LayoutType, string> = {
  PL: "連結損益計算書",
  BS: "連結貸借対照表",
  KPI: "連結KPI指標",
}

export const LAYOUT_TYPE_SHORT_LABELS: Record<LayoutType, string> = {
  PL: "PL",
  BS: "BS",
  KPI: "KPI",
}

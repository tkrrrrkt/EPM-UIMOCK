import { KpiGroupItem } from "./KpiGroupItem"
import type { BffKpiGroup } from "../types"
import type { BffClient } from "../api/BffClient"

interface KpiGroupListProps {
  kpiGroups: BffKpiGroup[]
  bffClient: BffClient
}

export function KpiGroupList({ kpiGroups, bffClient }: KpiGroupListProps) {
  if (kpiGroups.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-muted-foreground">
        該当するKPIが見つかりません
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {kpiGroups.map((group) => (
        <KpiGroupItem key={group.kpiId} group={group} bffClient={bffClient} />
      ))}
    </div>
  )
}

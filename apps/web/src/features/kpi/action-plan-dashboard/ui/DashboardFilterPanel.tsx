"use client"

import { useState } from "react"
import { Card, CardContent } from "@/shared/ui/components/card"
import { Button } from "@/shared/ui/components/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/components/select"
import { Input } from "@/shared/ui/components/input"
import { Label } from "@/shared/ui/components/label"
import type { BffDashboardQuery } from "../types"

interface DashboardFilterPanelProps {
  query: BffDashboardQuery
  onChange: (query: BffDashboardQuery) => void
  loading: boolean
}

export function DashboardFilterPanel({ query, onChange, loading }: DashboardFilterPanelProps) {
  const [organizationId, setOrganizationId] = useState(query.organizationId || "all")
  const [periodFrom, setPeriodFrom] = useState(query.periodFrom || "")
  const [periodTo, setPeriodTo] = useState(query.periodTo || "")
  const [progressStatus, setProgressStatus] = useState<string>(query.progressStatus || "all")

  const handleApply = () => {
    onChange({
      organizationId: organizationId === "all" ? undefined : organizationId,
      periodFrom: periodFrom || undefined,
      periodTo: periodTo || undefined,
      progressStatus: progressStatus === "all" ? undefined : (progressStatus as "delayed" | "normal" | "completed"),
    })
  }

  const handleClear = () => {
    setOrganizationId("all")
    setPeriodFrom("")
    setPeriodTo("")
    setProgressStatus("all")
    onChange({})
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="organization">組織</Label>
            <Select value={organizationId} onValueChange={setOrganizationId}>
              <SelectTrigger id="organization">
                <SelectValue placeholder="全ての組織" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全ての組織</SelectItem>
                <SelectItem value="org-001">営業本部</SelectItem>
                <SelectItem value="org-002">管理本部</SelectItem>
                <SelectItem value="org-003">人事本部</SelectItem>
                <SelectItem value="org-004">製造本部</SelectItem>
                <SelectItem value="org-005">CS本部</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="periodFrom">期間（開始）</Label>
            <Input id="periodFrom" type="date" value={periodFrom} onChange={(e) => setPeriodFrom(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="periodTo">期間（終了）</Label>
            <Input id="periodTo" type="date" value={periodTo} onChange={(e) => setPeriodTo(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="progressStatus">進捗状況</Label>
            <Select value={progressStatus} onValueChange={setProgressStatus}>
              <SelectTrigger id="progressStatus">
                <SelectValue placeholder="全て" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全て</SelectItem>
                <SelectItem value="delayed">遅延</SelectItem>
                <SelectItem value="normal">進行中</SelectItem>
                <SelectItem value="completed">完了</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={handleApply} disabled={loading}>
            フィルタ適用
          </Button>
          <Button onClick={handleClear} variant="outline" disabled={loading}>
            クリア
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

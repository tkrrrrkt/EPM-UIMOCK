"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@/shared/ui"
import { useBffClient } from "../lib/bff-client-provider"
import type { BffScenarioReportFilters, BffScenarioDetailRow } from "@epm/contracts/bff/scenario-report"

interface ScenarioDetailTableProps {
  filters: BffScenarioReportFilters
  selectedOrgId: string
}

export function ScenarioDetailTable({ filters, selectedOrgId }: ScenarioDetailTableProps) {
  const client = useBffClient()
  const [rows, setRows] = useState<BffScenarioDetailRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const response = await client.getDetail(filters, selectedOrgId)
        setRows(response.rows)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [client, filters, selectedOrgId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>月次シナリオ詳細</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left font-semibold">月</th>
                <th className="px-4 py-3 text-right font-semibold text-scenario-worst">ワースト</th>
                <th className="px-4 py-3 text-right font-semibold">ノーマル</th>
                <th className="px-4 py-3 text-right font-semibold text-scenario-best">ベスト</th>
                <th className="px-4 py-3 text-right font-semibold">予算</th>
                <th className="px-4 py-3 text-right font-semibold text-scenario-worst">W vs N</th>
                <th className="px-4 py-3 text-right font-semibold text-scenario-best">B vs N</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.periodNo} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium">{row.periodLabel}</td>
                  <td className="px-4 py-3 text-right text-scenario-worst">
                    {row.worst !== null ? `¥${row.worst.toLocaleString()}M` : "-"}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    ¥{row.normal.toLocaleString()}M
                  </td>
                  <td className="px-4 py-3 text-right text-scenario-best">
                    {row.best !== null ? `¥${row.best.toLocaleString()}M` : "-"}
                  </td>
                  <td className="px-4 py-3 text-right">¥{row.budget.toLocaleString()}M</td>
                  <td className="px-4 py-3 text-right text-scenario-worst">
                    {row.worstVsNormal !== null ? `${row.worstVsNormal >= 0 ? "+" : ""}¥${row.worstVsNormal.toLocaleString()}M` : "-"}
                  </td>
                  <td className="px-4 py-3 text-right text-scenario-best">
                    {row.bestVsNormal !== null ? `${row.bestVsNormal >= 0 ? "+" : ""}¥${row.bestVsNormal.toLocaleString()}M` : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

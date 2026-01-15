"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import {
  Card,
  CardContent,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui"
import { useBffClient } from "../lib/bff-client-provider"
import type { BffHeadcountContextResponse, ResourceType } from "@epm/contracts/bff/headcount-planning"

export interface SearchParams {
  companyId: string
  fiscalYear: number
  planEventId: string
  planVersionId: string
  sourceDepartmentStableId: string
  resourceType?: ResourceType
}

interface SearchPanelProps {
  companyId: string
  onSearchChange: (params: SearchParams) => void
  onDepartmentsLoaded?: (departments: BffHeadcountContextResponse["departments"]) => void
}

export function SearchPanel({ companyId, onSearchChange, onDepartmentsLoaded }: SearchPanelProps) {
  const client = useBffClient()
  const [loading, setLoading] = useState(true)
  const [context, setContext] = useState<BffHeadcountContextResponse | null>(null)

  const [fiscalYear, setFiscalYear] = useState<number | null>(null)
  const [planEventId, setPlanEventId] = useState<string | null>(null)
  const [planVersionId, setPlanVersionId] = useState<string | null>(null)
  const [departmentStableId, setDepartmentStableId] = useState<string | null>(null)
  const [resourceType, setResourceType] = useState<string>("all")

  // Load context on mount
  useEffect(() => {
    async function loadContext() {
      try {
        setLoading(true)
        const data = await client.getContext({ companyId })
        setContext(data)

        // Set initial defaults
        if (data.fiscalYears.length > 0) {
          setFiscalYear(data.fiscalYears[0].value)
        }
        // Filter for BUDGET events only
        const budgetEvents = data.planEvents.filter((e) => e.scenarioType === "BUDGET")
        if (budgetEvents.length > 0) {
          setPlanEventId(budgetEvents[0].id)
        }
        if (data.planVersions.length > 0) {
          setPlanVersionId(data.planVersions[0].id)
        }
        if (data.departments.length > 0) {
          setDepartmentStableId(data.departments[0].stableId)
        }
        // Notify parent of loaded departments
        onDepartmentsLoaded?.(data.departments)
      } catch (err) {
        console.error("Failed to load context:", err)
      } finally {
        setLoading(false)
      }
    }

    loadContext()
  }, [client, companyId])

  // Notify parent when search params change
  useEffect(() => {
    if (fiscalYear && planEventId && planVersionId && departmentStableId) {
      onSearchChange({
        companyId,
        fiscalYear,
        planEventId,
        planVersionId,
        sourceDepartmentStableId: departmentStableId,
        resourceType: resourceType !== "all" ? (resourceType as ResourceType) : undefined,
      })
    }
  }, [companyId, fiscalYear, planEventId, planVersionId, departmentStableId, resourceType, onSearchChange])

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!context) {
    return null
  }

  // Filter for BUDGET scenario events
  const budgetEvents = context.planEvents.filter((e) => e.scenarioType === "BUDGET")

  return (
    <Card>
      <CardContent className="py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 年度 */}
          <div className="space-y-1.5">
            <Label htmlFor="fiscal-year" className="text-xs text-muted-foreground">
              年度
            </Label>
            <Select
              value={fiscalYear?.toString() ?? ""}
              onValueChange={(val) => setFiscalYear(parseInt(val, 10))}
            >
              <SelectTrigger id="fiscal-year">
                <SelectValue placeholder="年度を選択" />
              </SelectTrigger>
              <SelectContent>
                {context.fiscalYears.map((fy) => (
                  <SelectItem key={fy.value} value={fy.value.toString()}>
                    {fy.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 予算イベント */}
          <div className="space-y-1.5">
            <Label htmlFor="plan-event" className="text-xs text-muted-foreground">
              予算イベント
            </Label>
            <Select value={planEventId ?? ""} onValueChange={setPlanEventId}>
              <SelectTrigger id="plan-event">
                <SelectValue placeholder="イベントを選択" />
              </SelectTrigger>
              <SelectContent>
                {budgetEvents.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* バージョン */}
          <div className="space-y-1.5">
            <Label htmlFor="plan-version" className="text-xs text-muted-foreground">
              バージョン
            </Label>
            <Select value={planVersionId ?? ""} onValueChange={setPlanVersionId}>
              <SelectTrigger id="plan-version">
                <SelectValue placeholder="バージョンを選択" />
              </SelectTrigger>
              <SelectContent>
                {context.planVersions.map((version) => (
                  <SelectItem key={version.id} value={version.id}>
                    {version.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 部門 */}
          <div className="space-y-1.5">
            <Label htmlFor="department" className="text-xs text-muted-foreground">
              部門
            </Label>
            <Select value={departmentStableId ?? ""} onValueChange={setDepartmentStableId}>
              <SelectTrigger id="department">
                <SelectValue placeholder="部門を選択" />
              </SelectTrigger>
              <SelectContent>
                {context.departments.map((dept) => (
                  <SelectItem key={dept.stableId} value={dept.stableId}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* リソース区分 */}
          <div className="space-y-1.5">
            <Label htmlFor="resource-type" className="text-xs text-muted-foreground">
              区分
            </Label>
            <Select value={resourceType} onValueChange={setResourceType}>
              <SelectTrigger id="resource-type">
                <SelectValue placeholder="すべて" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="EMPLOYEE">社員</SelectItem>
                <SelectItem value="CONTRACTOR">外注</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

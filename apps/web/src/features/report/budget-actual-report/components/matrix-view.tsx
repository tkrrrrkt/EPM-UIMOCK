"use client"

import { useState } from "react"
import { ChevronRight, Home, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface OrgColumn {
  id: string
  name: string
  parentId?: string
}

const orgColumns: OrgColumn[] = [
  { id: "corp", name: "全社" },
  { id: "sales", name: "営業本部", parentId: "corp" },
  { id: "sales-1", name: "第1営業部", parentId: "sales" },
  { id: "sales-2", name: "第2営業部", parentId: "sales" },
  { id: "sales-3", name: "第3営業部", parentId: "sales" },
  { id: "dev", name: "開発本部", parentId: "corp" },
  { id: "dev-1", name: "プロダクト開発部", parentId: "dev" },
  { id: "dev-2", name: "インフラ部", parentId: "dev" },
  { id: "admin", name: "管理本部", parentId: "corp" },
  { id: "finance", name: "財務経理部", parentId: "admin" },
  { id: "hr", name: "人事部", parentId: "admin" },
]

interface AccountRow {
  id: string
  name: string
  isParent?: boolean
  children?: AccountRow[]
}

const accounts: AccountRow[] = [
  {
    id: "revenue",
    name: "売上高",
    isParent: true,
    children: [
      { id: "product-sales", name: "製品売上" },
      { id: "service-sales", name: "サービス売上" },
    ],
  },
  {
    id: "cogs",
    name: "売上原価",
    isParent: true,
  },
  {
    id: "gross-profit",
    name: "売上総利益",
    isParent: true,
  },
  {
    id: "sga",
    name: "販管費",
    isParent: true,
    children: [
      { id: "personnel", name: "人件費" },
      { id: "rent", name: "地代家賃" },
      { id: "depreciation", name: "減価償却費" },
    ],
  },
  {
    id: "operating-profit",
    name: "営業利益",
    isParent: true,
  },
]

function generateMockData(_orgId: string, _accountId: string) {
  const base = Math.floor(Math.random() * 50000) + 10000
  return {
    budget: base,
    actual: Math.floor(base * (0.9 + Math.random() * 0.2)),
    variance: 0,
    varianceRate: 0,
  }
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat("ja-JP").format(num)
}

function formatVariance(num: number): string {
  const formatted = formatNumber(Math.abs(num))
  return num >= 0 ? `+${formatted}` : `-${formatted}`
}

interface MatrixRowProps {
  account: AccountRow
  level: number
  summaryColumn: OrgColumn | null | undefined
  visibleColumns: OrgColumn[]
}

function MatrixRow({ account, level, summaryColumn, visibleColumns }: MatrixRowProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const hasChildren = account.children && account.children.length > 0

  return (
    <>
      <tr className={cn("group hover:bg-muted/50", account.isParent && "bg-muted/30")}>
        {/* Account Name - Sticky */}
        <td
          className="sticky left-0 z-10 border-r border-b border-border bg-card px-3 py-2 group-hover:bg-muted/50"
          style={{ paddingLeft: `${level * 1.5 + 0.75}rem`, minWidth: "200px", maxWidth: "200px" }}
        >
          <div className="flex items-center gap-2">
            {hasChildren && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="shrink-0 hover:text-foreground text-muted-foreground"
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            )}
            <span className={cn("text-sm truncate", account.isParent && "font-medium")}>{account.name}</span>
          </div>
        </td>

        {/* Summary Column Data */}
        {(() => {
          const data = generateMockData(summaryColumn?.id || "corp", account.id)
          data.variance = data.actual - data.budget
          data.varianceRate = (data.variance / data.budget) * 100

          return (
            <>
              <td className="border-r border-b border-border px-2 py-2 text-right text-sm tabular-nums whitespace-nowrap bg-muted/40">
                {formatNumber(data.budget)}
              </td>
              <td className="border-r border-b border-border px-2 py-2 text-right text-sm tabular-nums whitespace-nowrap bg-muted/40">
                {formatNumber(data.actual)}
              </td>
              <td
                className={cn(
                  "border-r border-b border-border px-2 py-2 text-right text-sm font-medium tabular-nums whitespace-nowrap bg-muted/40",
                  data.variance >= 0 ? "text-emerald-600" : "text-destructive"
                )}
              >
                {formatVariance(data.variance)}
              </td>
              <td
                className={cn(
                  "border-r border-b border-border px-2 py-2 text-right text-sm font-medium tabular-nums whitespace-nowrap bg-muted/40",
                  data.varianceRate >= 0 ? "text-emerald-600" : "text-destructive"
                )}
              >
                {data.varianceRate.toFixed(1)}%
              </td>
            </>
          )
        })()}

        {/* Organization Data Columns */}
        {visibleColumns.map((org) => {
          const data = generateMockData(org.id, account.id)
          data.variance = data.actual - data.budget
          data.varianceRate = (data.variance / data.budget) * 100

          return (
            <td
              key={org.id}
              colSpan={4}
              className="p-0 border-r border-b border-border"
            >
              <div className="flex">
                <div className="flex-1 px-2 py-2 text-right text-sm tabular-nums whitespace-nowrap border-r border-border">
                  {formatNumber(data.budget)}
                </div>
                <div className="flex-1 px-2 py-2 text-right text-sm tabular-nums whitespace-nowrap border-r border-border">
                  {formatNumber(data.actual)}
                </div>
                <div
                  className={cn(
                    "flex-1 px-2 py-2 text-right text-sm font-medium tabular-nums whitespace-nowrap border-r border-border",
                    data.variance >= 0 ? "text-emerald-600" : "text-destructive"
                  )}
                >
                  {formatVariance(data.variance)}
                </div>
                <div
                  className={cn(
                    "flex-1 px-2 py-2 text-right text-sm font-medium tabular-nums whitespace-nowrap",
                    data.varianceRate >= 0 ? "text-emerald-600" : "text-destructive"
                  )}
                >
                  {data.varianceRate.toFixed(1)}%
                </div>
              </div>
            </td>
          )
        })}
      </tr>

      {hasChildren &&
        isExpanded &&
        account.children!.map((child) => (
          <MatrixRow
            key={child.id}
            account={child}
            level={level + 1}
            summaryColumn={summaryColumn}
            visibleColumns={visibleColumns}
          />
        ))}
    </>
  )
}

interface MatrixViewProps {
  comparisonMode: string
}

export function MatrixView({ comparisonMode: _comparisonMode }: MatrixViewProps) {
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id: string | null; name: string }>>([
    { id: null, name: "全社" },
  ])

  const getCurrentChildren = () => {
    if (currentOrgId === null) {
      return orgColumns.filter((org) => org.parentId === "corp")
    }
    return orgColumns.filter((org) => org.parentId === currentOrgId)
  }

  const handleDrillDown = (org: OrgColumn) => {
    const hasChildren = orgColumns.some((o) => o.parentId === org.id)
    if (hasChildren) {
      setCurrentOrgId(org.id)
      setBreadcrumbs([...breadcrumbs, { id: org.id, name: org.name }])
    }
  }

  const handleBreadcrumbClick = (index: number) => {
    const target = breadcrumbs[index]
    setCurrentOrgId(target.id)
    setBreadcrumbs(breadcrumbs.slice(0, index + 1))
  }

  const visibleColumns = getCurrentChildren()
  const summaryColumn = currentOrgId ? orgColumns.find((org) => org.id === currentOrgId) : null

  return (
    <div className="h-full flex flex-col">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-border bg-card px-6 py-3">
        <div className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.id || "root"} className="flex items-center gap-2">
              {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className={cn(
                  "hover:text-foreground transition-colors",
                  index === breadcrumbs.length - 1 ? "text-foreground font-medium" : "text-muted-foreground"
                )}
              >
                {index === 0 && <Home className="h-4 w-4 inline mr-1" />}
                {crumb.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto relative">
        <table className="border-collapse min-w-max">
          <thead>
            <tr className="sticky top-0 z-20 bg-card">
              <th className="sticky left-0 z-30 border-r border-b border-border bg-card px-3 py-2 text-left font-medium text-xs text-muted-foreground">
                科目
              </th>

              <th
                colSpan={4}
                className="border-r border-b border-border bg-muted px-2 py-2 text-center font-medium text-xs"
              >
                {summaryColumn?.name || "全社"} 合計
              </th>

              {/* Child Organization Columns */}
              {visibleColumns.map((org) => (
                <th
                  key={org.id}
                  colSpan={4}
                  className="border-r border-b border-border bg-muted/70 px-2 py-2 text-center font-medium text-xs cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => handleDrillDown(org)}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span className="truncate">{org.name}</span>
                    {orgColumns.some((o) => o.parentId === org.id) && (
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                </th>
              ))}
            </tr>

            <tr className="sticky top-[41px] z-20 bg-card">
              <th className="sticky left-0 z-30 border-r border-b border-border bg-card" />

              {/* Summary metrics */}
              <th className="border-r border-b border-border bg-card px-2 py-1 text-center font-medium text-xs text-muted-foreground whitespace-nowrap">
                予算
              </th>
              <th className="border-r border-b border-border bg-card px-2 py-1 text-center font-medium text-xs text-muted-foreground whitespace-nowrap">
                実績
              </th>
              <th className="border-r border-b border-border bg-card px-2 py-1 text-center font-medium text-xs text-muted-foreground whitespace-nowrap">
                差異
              </th>
              <th className="border-r border-b border-border bg-card px-2 py-1 text-center font-medium text-xs text-muted-foreground whitespace-nowrap">
                %
              </th>

              {visibleColumns.map((org) => (
                <th
                  key={`${org.id}-sub`}
                  colSpan={4}
                  className="p-0 border-r border-b border-border"
                >
                  <div className="flex">
                    <div className="flex-1 px-2 py-1 text-center font-medium text-xs text-muted-foreground whitespace-nowrap border-r border-border">
                      予算
                    </div>
                    <div className="flex-1 px-2 py-1 text-center font-medium text-xs text-muted-foreground whitespace-nowrap border-r border-border">
                      実績
                    </div>
                    <div className="flex-1 px-2 py-1 text-center font-medium text-xs text-muted-foreground whitespace-nowrap border-r border-border">
                      差異
                    </div>
                    <div className="flex-1 px-2 py-1 text-center font-medium text-xs text-muted-foreground whitespace-nowrap">
                      %
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {accounts.map((account) => (
              <MatrixRow
                key={account.id}
                account={account}
                level={0}
                summaryColumn={summaryColumn}
                visibleColumns={visibleColumns}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

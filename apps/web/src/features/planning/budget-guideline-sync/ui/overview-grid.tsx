"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  ToggleGroup,
  ToggleGroupItem,
} from "@/shared/ui"
import { Calendar, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { BffOverviewResponse } from "@epm/contracts/bff/budget-guideline"

interface OverviewGridProps {
  data: BffOverviewResponse
}

type ViewMode = "year-first" | "org-first"

export function OverviewGrid({ data }: OverviewGridProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("year-first")

  const formatAmount = (amount: string): string => {
    if (!amount || amount === "0") return "-"
    const num = Number(amount)
    return num.toLocaleString("ja-JP")
  }

  function getAmount(subjectId: string, fiscalYear: number, dimensionValueId: string | null): string {
    const cell = data.amounts.find(
      (a) => a.subjectId === subjectId && a.fiscalYear === fiscalYear && a.dimensionValueId === dimensionValueId,
    )
    return cell?.amount || "0"
  }

  // 全年度（実績 + ガイドライン）
  const allYears = [...data.actualYears, data.guidelineYear]

  // 組織リスト（全社合計 + 各セグメント）
  const orgs = [
    { id: null, name: "全社合計" },
    ...data.dimensionValues.filter((dv) => !dv.isTotal).map((dv) => ({ id: dv.id, name: dv.valueName })),
  ]

  const yearColSpan = orgs.length
  const orgColSpan = allYears.length

  const isActualYear = (year: number) => data.actualYears.includes(year)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>全社俯瞰</CardTitle>
            <p className="text-sm text-muted-foreground">全事業部のガイドライン数値を横並びで比較</p>
          </div>
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value) => value && setViewMode(value as ViewMode)}
          >
            <ToggleGroupItem value="year-first" aria-label="年度優先表示">
              <Calendar className="h-4 w-4 mr-2" />
              年度優先
            </ToggleGroupItem>
            <ToggleGroupItem value="org-first" aria-label="組織優先表示">
              <Building2 className="h-4 w-4 mr-2" />
              組織優先
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            {viewMode === "year-first" ? (
              <TableHeader>
                <TableRow>
                  <TableHead rowSpan={2} className="sticky left-0 z-20 bg-card font-semibold align-bottom">
                    科目
                  </TableHead>
                  {allYears.map((year) => (
                    <TableHead
                      key={year}
                      colSpan={yearColSpan}
                      className={cn(
                        "text-center font-semibold border-l border-border",
                        isActualYear(year) && "bg-muted/30",
                      )}
                    >
                      FY{year}
                      {isActualYear(year) && <span className="ml-1 text-xs text-muted-foreground">(実績)</span>}
                    </TableHead>
                  ))}
                </TableRow>
                <TableRow>
                  {allYears.map((year) =>
                    orgs.map((org, index) => (
                      <TableHead
                        key={`${year}-${org.id}`}
                        className={cn(
                          "text-right font-semibold",
                          index === 0 && "border-l border-border",
                          isActualYear(year) && "bg-muted/30",
                        )}
                      >
                        {org.name}
                      </TableHead>
                    )),
                  )}
                </TableRow>
              </TableHeader>
            ) : (
              <TableHeader>
                <TableRow>
                  <TableHead rowSpan={2} className="sticky left-0 z-20 bg-card font-semibold align-bottom">
                    科目
                  </TableHead>
                  {orgs.map((org) => (
                    <TableHead
                      key={org.id}
                      colSpan={orgColSpan}
                      className="text-center font-semibold border-l border-border"
                    >
                      {org.name}
                    </TableHead>
                  ))}
                </TableRow>
                <TableRow>
                  {orgs.map((org, orgIndex) =>
                    allYears.map((year, yearIndex) => (
                      <TableHead
                        key={`${org.id}-${year}`}
                        className={cn(
                          "text-right font-semibold",
                          yearIndex === 0 && "border-l border-border",
                          isActualYear(year) && "bg-muted/30",
                        )}
                      >
                        FY{year}
                        {isActualYear(year) && <span className="ml-1 text-xs text-muted-foreground">(実)</span>}
                      </TableHead>
                    )),
                  )}
                </TableRow>
              </TableHeader>
            )}
            <TableBody>
              {viewMode === "year-first"
                ? data.subjects.map((subject) => (
                    <TableRow key={subject.id} className={cn(subject.isAggregate && "bg-muted/50")}>
                      <TableCell
                        className={cn(
                          "sticky left-0 z-10 bg-card whitespace-nowrap",
                          subject.isAggregate && "font-semibold",
                        )}
                      >
                        {subject.subjectName}
                      </TableCell>
                      {allYears.map((year) =>
                        orgs.map((org, index) => (
                          <TableCell
                            key={`${subject.id}-${year}-${org.id}`}
                            className={cn(
                              "text-right tabular-nums",
                              subject.isAggregate && "font-semibold",
                              index === 0 && "border-l border-border",
                              isActualYear(year) && "bg-muted/10 text-muted-foreground",
                            )}
                          >
                            {formatAmount(getAmount(subject.id, year, org.id))}
                          </TableCell>
                        )),
                      )}
                    </TableRow>
                  ))
                : data.subjects.map((subject) => (
                    <TableRow key={subject.id} className={cn(subject.isAggregate && "bg-muted/50")}>
                      <TableCell
                        className={cn(
                          "sticky left-0 z-10 bg-card whitespace-nowrap",
                          subject.isAggregate && "font-semibold",
                        )}
                      >
                        {subject.subjectName}
                      </TableCell>
                      {orgs.map((org, orgIndex) =>
                        allYears.map((year, yearIndex) => (
                          <TableCell
                            key={`${subject.id}-${org.id}-${year}`}
                            className={cn(
                              "text-right tabular-nums",
                              subject.isAggregate && "font-semibold",
                              yearIndex === 0 && "border-l border-border",
                              isActualYear(year) && "bg-muted/10 text-muted-foreground",
                            )}
                          >
                            {formatAmount(getAmount(subject.id, year, org.id))}
                          </TableCell>
                        )),
                      )}
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

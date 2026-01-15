"use client"

import { useMemo } from "react"
import { GanttBar } from "./GanttBar"
import { GanttMilestone } from "./GanttMilestone"
import { GanttDependencyLine } from "./GanttDependencyLine"
import type { BffGanttLink, WbsTreeNode, ViewPeriod } from "../types"

interface GanttTimelineProps {
  flatNodes: WbsTreeNode[]
  links: BffGanttLink[]
  selectedId: string | null
  onSelectWbs: (wbs: WbsTreeNode) => void
  period: ViewPeriod
}

export function GanttTimeline({ flatNodes, links, selectedId, onSelectWbs, period }: GanttTimelineProps) {
  const { startDate, endDate, dateHeaders, pixelsPerDay } = useMemo(() => {
    const dates = flatNodes
      .filter((n) => n.startDate || n.dueDate)
      .flatMap((n) => [n.startDate, n.dueDate].filter(Boolean) as string[])

    if (dates.length === 0) {
      const today = new Date()
      const start = new Date(today.getFullYear(), today.getMonth(), 1)
      const end = new Date(today.getFullYear(), today.getMonth() + 3, 0)
      return {
        startDate: start,
        endDate: end,
        dateHeaders: generateDateHeaders(start, end, period),
        pixelsPerDay: getPixelsPerDay(period),
      }
    }

    const start = new Date(Math.min(...dates.map((d) => new Date(d).getTime())))
    const end = new Date(Math.max(...dates.map((d) => new Date(d).getTime())))

    start.setDate(1)
    start.setHours(0, 0, 0, 0)

    end.setMonth(end.getMonth() + 1, 0)
    end.setHours(23, 59, 59, 999)

    return {
      startDate: start,
      endDate: end,
      dateHeaders: generateDateHeaders(start, end, period),
      pixelsPerDay: getPixelsPerDay(period),
    }
  }, [flatNodes, period])

  const rowHeight = 40
  const headerHeight = 60

  const today = new Date()
  const todayLeft = ((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) * pixelsPerDay

  const totalWidth = dateHeaders.reduce((sum, h) => sum + h.width, 0)

  return (
    <div className="flex-1 overflow-x-auto">
      <div
        className="sticky top-[73px] bg-background border-b z-10"
        style={{ height: `${headerHeight}px`, minWidth: `${totalWidth}px` }}
      >
        <div className="flex h-full">
          {dateHeaders.map((header, i) => (
            <div
              key={`header-${i}-${header.primary}`}
              className="border-r border-border flex flex-col items-center justify-center shrink-0 px-2"
              style={{ width: `${header.width}px` }}
            >
              <div className="text-sm font-semibold text-foreground">{header.primary}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{header.secondary}</div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="relative bg-background"
        style={{ height: `${flatNodes.length * rowHeight}px`, minWidth: `${totalWidth}px` }}
      >
        {dateHeaders.map((header, i) => {
          const left = dateHeaders.slice(0, i).reduce((sum, h) => sum + h.width, 0)
          return (
            <div
              key={`grid-${i}`}
              className="absolute top-0 bottom-0 border-r border-border/30"
              style={{ left: `${left}px` }}
            />
          )
        })}

        {todayLeft >= 0 && todayLeft <= totalWidth && (
          <>
            <div
              className="absolute top-0 bottom-0 bg-primary/8 pointer-events-none"
              style={{ left: `${todayLeft}px`, width: `${pixelsPerDay}px` }}
            />
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-primary pointer-events-none z-20"
              style={{ left: `${todayLeft}px` }}
            />
          </>
        )}

        {flatNodes.map((_, index) => (
          <div
            key={`row-bg-${index}`}
            className={`absolute left-0 pointer-events-none ${index % 2 === 1 ? "bg-muted/20" : "bg-background"}`}
            style={{
              top: `${index * rowHeight}px`,
              height: `${rowHeight}px`,
              width: `${totalWidth}px`,
            }}
          />
        ))}

        {/* Dependency lines */}
        {links.map((link) => {
          const source = flatNodes.find((n) => n.id === link.sourceWbsId)
          const target = flatNodes.find((n) => n.id === link.targetWbsId)
          if (!source || !target || !source.dueDate || !target.startDate) return null

          const sourceIndex = flatNodes.indexOf(source)
          const targetIndex = flatNodes.indexOf(target)

          const sourceDate = new Date(source.dueDate)
          const targetDate = new Date(target.startDate)

          const sourceLeft = ((sourceDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) * pixelsPerDay
          const targetLeft = ((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) * pixelsPerDay

          return (
            <GanttDependencyLine
              key={link.id}
              sourceLeft={sourceLeft}
              sourceTop={sourceIndex * rowHeight + rowHeight / 2}
              targetLeft={targetLeft}
              targetTop={targetIndex * rowHeight + rowHeight / 2}
            />
          )
        })}

        {/* Gantt bars and milestones */}
        {flatNodes.map((node, index) => {
          const top = index * rowHeight + (rowHeight - 24) / 2

          if (node.isMilestone) {
            return (
              <GanttMilestone
                key={node.id}
                wbs={node}
                startDate={startDate}
                pixelsPerDay={pixelsPerDay}
                top={top}
                onClick={() => onSelectWbs(node)}
                selected={selectedId === node.id}
              />
            )
          }

          return (
            <GanttBar
              key={node.id}
              wbs={node}
              startDate={startDate}
              endDate={endDate}
              pixelsPerDay={pixelsPerDay}
              top={top}
              onClick={() => onSelectWbs(node)}
              selected={selectedId === node.id}
            />
          )
        })}
      </div>
    </div>
  )
}

function generateDateHeaders(
  start: Date,
  end: Date,
  period: ViewPeriod,
): Array<{ primary: string; secondary: string; width: number }> {
  const headers: Array<{ primary: string; secondary: string; width: number }> = []
  const pixelsPerDay = getPixelsPerDay(period)

  if (period === "day") {
    // 日表示: 上段に年月、下段に日数を表示
    const current = new Date(start)

    while (current <= end) {
      const year = current.getFullYear()
      const month = current.getMonth()
      const daysInMonth = new Date(year, month + 1, 0).getDate()

      headers.push({
        primary: `${year}年 ${month + 1}月`,
        secondary: `${daysInMonth}日`,
        width: daysInMonth * pixelsPerDay,
      })

      current.setMonth(month + 1)
      current.setDate(1)
    }
  } else if (period === "week") {
    // 週表示: 上段に月と日付範囲、下段に「週」を表示
    const current = new Date(start)

    while (current <= end) {
      const weekStart = new Date(current)
      const weekEnd = new Date(current)
      weekEnd.setDate(weekEnd.getDate() + 6)

      const month = weekStart.getMonth() + 1
      const startDay = weekStart.getDate()
      const endDay = weekEnd.getDate()

      headers.push({
        primary: `${month}月 ${startDay}-${endDay}日`,
        secondary: `週`,
        width: 7 * pixelsPerDay,
      })

      current.setDate(current.getDate() + 7)
    }
  } else {
    // 月表示: 上段に年/月を表示
    const current = new Date(start)

    while (current <= end) {
      const year = current.getFullYear()
      const month = current.getMonth()
      const daysInMonth = new Date(year, month + 1, 0).getDate()

      headers.push({
        primary: `${year}/${month + 1}`,
        secondary: "",
        width: daysInMonth * pixelsPerDay,
      })

      current.setMonth(month + 1)
      current.setDate(1)
    }
  }

  return headers
}

function getPixelsPerDay(period: ViewPeriod): number {
  switch (period) {
    case "day":
      return 30
    case "week":
      return 10
    case "month":
      return 5
    default:
      return 20
  }
}

"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { DhtmlxTask, DhtmlxLink, ViewPeriod } from "../types"

interface DhtmlxGanttWrapperProps {
  tasks: DhtmlxTask[]
  links: DhtmlxLink[]
  viewPeriod: ViewPeriod
  selectedTaskId: string | null
  onTaskUpdate?: (task: DhtmlxTask) => void
  onLinkCreate?: (link: DhtmlxLink) => void
  onLinkDelete?: (linkId: string) => void
  onTaskSelect?: (taskId: string) => void
  onTaskDblClick?: (taskId: string, position: { x: number; y: number }) => void
  onDeleteRequest?: (taskId: string, taskName: string, onConfirm: () => void, onCancel: () => void) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DhtmlxGanttComponent = React.ComponentType<any>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GanttInstance = any

// viewPeriodが変わるたびにkeyを変更してコンポーネントを再マウントする
export function DhtmlxGanttWrapper(props: DhtmlxGanttWrapperProps) {
  // viewPeriodをkeyに含めることで、変更時にコンポーネントが再マウントされる
  return <DhtmlxGanttWrapperInner key={props.viewPeriod} {...props} />
}

function DhtmlxGanttWrapperInner({
  tasks,
  links,
  viewPeriod,
  selectedTaskId,
  onTaskUpdate,
  onLinkCreate,
  onLinkDelete,
  onTaskSelect,
  onTaskDblClick,
  onDeleteRequest,
}: DhtmlxGanttWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const ganttRef = useRef<{ instance: GanttInstance } | null>(null)
  const eventIdsRef = useRef<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGanttReady, setIsGanttReady] = useState(false)
  const [GanttComponent, setGanttComponent] = useState<DhtmlxGanttComponent | null>(null)

  // Store callbacks in refs to avoid stale closures in event handlers
  const onTaskDblClickRef = useRef(onTaskDblClick)
  const onTaskSelectRef = useRef(onTaskSelect)

  useEffect(() => {
    onTaskDblClickRef.current = onTaskDblClick
  }, [onTaskDblClick])

  useEffect(() => {
    onTaskSelectRef.current = onTaskSelect
  }, [onTaskSelect])

  // Load DHTMLX CSS and EPM theme overrides via DOM
  useEffect(() => {
    // Load DHTMLX base CSS
    const cssId = "dhtmlx-gantt-css"
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link")
      link.id = cssId
      link.rel = "stylesheet"
      link.href = "https://cdn.dhtmlx.com/gantt/edge/dhtmlxgantt.css"
      document.head.appendChild(link)
    }

    // Add EPM theme overrides
    const epmCssId = "dhtmlx-gantt-epm-theme"
    if (!document.getElementById(epmCssId)) {
      const style = document.createElement("style")
      style.id = epmCssId
      style.textContent = `
        /* EPM Design System - DHTMLX Gantt Theme Override */

        /* ガントバー（タスク） - Primary Color (Deep Teal) */
        .gantt_task_line {
          background-color: #14b8a6 !important;
          border: 1px solid #0d9488 !important;
          border-radius: 4px !important;
        }

        .gantt_task_line.gantt_selected {
          box-shadow: 0 0 0 2px rgba(20, 184, 166, 0.3) !important;
        }

        /* 進捗バー */
        .gantt_task_progress {
          background-color: #0f766e !important;
          border-radius: 4px 0 0 4px !important;
        }

        /* マイルストーン - Secondary Color (Royal Indigo) */
        .gantt_task_line.gantt_milestone {
          background-color: #6366f1 !important;
          border-color: #4f46e5 !important;
        }

        /* グリッドヘッダー */
        .gantt_grid_head_cell {
          background-color: #fafafa !important;
          color: #262626 !important;
          font-weight: 500 !important;
          border-bottom: 1px solid #e5e5e5 !important;
          font-size: 13px !important;
        }

        /* スケールヘッダー */
        .gantt_scale_cell {
          background-color: #fafafa !important;
          color: #525252 !important;
          border-bottom: 1px solid #e5e5e5 !important;
          font-size: 12px !important;
        }

        /* グリッド行 */
        .gantt_row {
          border-bottom: 1px solid #e5e5e5 !important;
        }

        .gantt_row:hover,
        .gantt_row.odd:hover {
          background-color: rgba(20, 184, 166, 0.05) !important;
        }

        .gantt_row.gantt_selected,
        .gantt_row.odd.gantt_selected {
          background-color: rgba(20, 184, 166, 0.1) !important;
        }

        /* グリッドセル */
        .gantt_cell {
          color: #404040 !important;
          font-size: 13px !important;
        }

        .gantt_tree_content {
          font-weight: 500 !important;
        }

        /* リンク（依存線） */
        .gantt_task_link .gantt_line_wrapper div {
          background-color: #a3a3a3 !important;
        }

        .gantt_link_arrow {
          border-color: #a3a3a3 !important;
        }

        /* ツールチップ */
        .gantt_tooltip {
          background-color: #262626 !important;
          color: #fafafa !important;
          border-radius: 6px !important;
          padding: 8px 12px !important;
          font-size: 12px !important;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12) !important;
        }

        /* 今日のマーカー */
        .gantt_marker {
          background-color: #ef4444 !important;
        }

        .gantt_marker_content {
          color: #ef4444 !important;
          font-size: 11px !important;
        }

        /* リサイズハンドル */
        .gantt_task_drag {
          background-color: transparent !important;
        }

        /* コンテナ */
        .gantt_container {
          font-family: 'Geist', system-ui, -apple-system, sans-serif !important;
          border: 1px solid #e5e5e5 !important;
          border-radius: 8px !important;
          overflow: hidden !important;
        }

        /* 奇数行の背景 */
        .gantt_row.odd {
          background-color: #fafafa !important;
        }

        /* タイムラインセル */
        .gantt_task_cell {
          border-right: 1px solid #f5f5f5 !important;
        }

        /* 週末のハイライト */
        .gantt_task_cell.week_end {
          background-color: rgba(0, 0, 0, 0.02) !important;
        }
      `
      document.head.appendChild(style)
    }
  }, [])

  // Dynamically load DHTMLX Gantt (client-side only)
  useEffect(() => {
    let isMounted = true

    const loadGantt = async () => {
      if (typeof window === "undefined") return

      try {
        // Import the DHTMLX React Gantt
        const module = await import("@dhtmlx/trial-react-gantt")

        if (isMounted) {
          setGanttComponent(() => module.default)
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Failed to load DHTMLX Gantt:", error)
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadGantt()

    return () => {
      isMounted = false
    }
  }, [])

  // 日本語の月名
  const japaneseMonths = [
    "1月", "2月", "3月", "4月", "5月", "6月",
    "7月", "8月", "9月", "10月", "11月", "12月"
  ]

  // 日本語の曜日
  const japaneseDays = ["日", "月", "火", "水", "木", "金", "土"]

  // 日付を日本語フォーマットに変換
  const formatJapaneseDate = useCallback((date: Date, format: string) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const day = date.getDate()
    const dayOfWeek = date.getDay()

    // カスタムフォーマット処理
    return format
      .replace("%Y", String(year))
      .replace("%m", String(month + 1).padStart(2, "0"))
      .replace("%M", japaneseMonths[month])
      .replace("%d", String(day).padStart(2, "0"))
      .replace("%D", japaneseDays[dayOfWeek])
      .replace("%W", String(Math.ceil(day / 7)))
  }, [])

  // Convert viewPeriod to scales config with Japanese format functions
  const getScales = useCallback((period: ViewPeriod) => {
    switch (period) {
      case "day": // 日表示（上段: 年月、下段: 日）
        return [
          {
            unit: "month",
            step: 1,
            format: (date: Date) => `${date.getFullYear()}年${japaneseMonths[date.getMonth()]}`
          },
          {
            unit: "day",
            step: 1,
            format: (date: Date) => `${date.getDate()}`
          },
        ]
      case "week": // 週表示（上段: 年月、下段: 週）
        return [
          {
            unit: "month",
            step: 1,
            format: (date: Date) => `${date.getFullYear()}年${japaneseMonths[date.getMonth()]}`
          },
          {
            unit: "week",
            step: 1,
            format: (date: Date) => {
              const weekNum = Math.ceil(date.getDate() / 7)
              return `第${weekNum}週`
            }
          },
        ]
      case "month": // 月表示（上段: 年、下段: 月）
        return [
          {
            unit: "year",
            step: 1,
            format: (date: Date) => `${date.getFullYear()}年`
          },
          {
            unit: "month",
            step: 1,
            format: (date: Date) => japaneseMonths[date.getMonth()]
          },
        ]
      default:
        return [
          {
            unit: "month",
            step: 1,
            format: (date: Date) => `${date.getFullYear()}年${japaneseMonths[date.getMonth()]}`
          },
          {
            unit: "day",
            step: 1,
            format: (date: Date) => `${date.getDate()}`
          },
        ]
    }
  }, [])

  // Inline editor configurations
  const textEditor = { type: "text", map_to: "text" }
  const dateEditor = { type: "date", map_to: "start_date" }
  const endDateEditor = { type: "date", map_to: "end_date" }

  // Column configuration (日本語ラベル) with inline editors
  const columns = [
    { name: "wbsCode", label: "WBS", width: 80, resize: true },
    { name: "text", label: "タスク名", width: 200, tree: true, editor: textEditor, resize: true },
    { name: "assigneeName", label: "担当者", width: 100, resize: true },
    { name: "start_date", label: "開始日", width: 100, editor: dateEditor, resize: true },
    { name: "end_date", label: "終了日", width: 100, editor: endDateEditor, resize: true },
    { name: "progress", label: "進捗率", width: 80, template: (task: DhtmlxTask) => `${Math.round(task.progress * 100)}%`, resize: true },
  ]

  // DHTMLX config (日本語化、Lightbox無効化)
  const ganttConfig = {
    // Lightbox（デフォルト編集ダイアログ）を無効化し、独自Sheetを使用
    details_on_dblclick: false,
    details_on_create: false,

    // ドラッグ操作
    drag_links: true,
    drag_progress: true,
    drag_resize: true,
    drag_move: true,

    // 日本の週開始（月曜日）
    start_on_monday: true,

    // グリッド設定
    grid_width: 500,
    min_column_width: 50,

    // スケール
    fit_tasks: true,

    // 日付フォーマット
    date_format: "%Y-%m-%d",

    // ツールチップ
    tooltip_timeout: 300,
  }

  // 日本語テンプレート
  const ganttTemplates = {
    // バー内のテキスト
    task_text: (start: Date, end: Date, task: DhtmlxTask) => task.text,
    // 進捗テキスト
    progress_text: (start: Date, end: Date, task: DhtmlxTask) => `${Math.round(task.progress * 100)}%`,
    // ツールチップ
    tooltip_text: (start: Date, end: Date, task: DhtmlxTask) => {
      const startStr = start ? `${start.getFullYear()}/${start.getMonth() + 1}/${start.getDate()}` : "未設定"
      const endStr = end ? `${end.getFullYear()}/${end.getMonth() + 1}/${end.getDate()}` : "未設定"
      return `<b>${task.text}</b><br/>開始: ${startStr}<br/>終了: ${endStr}<br/>進捗: ${Math.round(task.progress * 100)}%`
    },
  }

  // Handle task updates
  const handleDataSave = useCallback(
    (action: { type: string; id: string; data?: DhtmlxTask | DhtmlxLink }) => {
      if (action.type === "update-task" && action.data && onTaskUpdate) {
        onTaskUpdate(action.data as DhtmlxTask)
      }
      if (action.type === "create-link" && action.data && onLinkCreate) {
        onLinkCreate(action.data as DhtmlxLink)
      }
      if (action.type === "delete-link" && onLinkDelete) {
        onLinkDelete(action.id)
      }
    },
    [onTaskUpdate, onLinkCreate, onLinkDelete]
  )

  // Handle delete with EPM dialog
  const handleDeleteRequest = useCallback(
    (args: { id: string; task: DhtmlxTask; onConfirm: () => void; onCancel: () => void }) => {
      if (onDeleteRequest) {
        onDeleteRequest(args.id, args.task.text, args.onConfirm, args.onCancel)
      } else {
        // Fallback: confirm directly
        args.onConfirm()
      }
    },
    [onDeleteRequest]
  )

  // Attach event handlers and configure Gantt instance
  // Poll for gantt instance availability since onGanttRender may not fire reliably
  useEffect(() => {
    if (!GanttComponent) return

    let attempts = 0
    const maxAttempts = 50 // 5 seconds max

    const tryAttachEvents = () => {
      const gantt = ganttRef.current?.instance
      if (!gantt) {
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(tryAttachEvents, 100)
        }
        return
      }

      console.log("[gantt] Instance found, configuring Japanese locale and scales")

      // === 日本語ロケール設定 ===
      gantt.locale = {
        date: {
          month_full: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
          month_short: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
          day_full: ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"],
          day_short: ["日", "月", "火", "水", "木", "金", "土"],
        },
        labels: {
          new_task: "新規タスク",
          icon_save: "保存",
          icon_cancel: "キャンセル",
          icon_details: "詳細",
          icon_edit: "編集",
          icon_delete: "削除",
          confirm_closing: "",
          confirm_deleting: "タスクを削除しますか？",
          section_description: "説明",
          section_time: "期間",
          section_type: "タイプ",
          column_text: "タスク名",
          column_start_date: "開始日",
          column_duration: "期間",
          column_add: "",
          link: "リンク",
          confirm_link_deleting: "削除されます",
          link_start: "(開始)",
          link_end: "(終了)",
          type_task: "タスク",
          type_project: "プロジェクト",
          type_milestone: "マイルストーン",
          minutes: "分",
          hours: "時間",
          days: "日",
          weeks: "週",
          months: "月",
          years: "年",
        },
      }

      // === スケール設定を直接適用 ===
      const scales = getScales(viewPeriod)
      gantt.config.scales = scales

      // セル幅の設定
      if (viewPeriod === "month") {
        gantt.config.min_column_width = 40
      } else if (viewPeriod === "week") {
        gantt.config.min_column_width = 60
      } else {
        gantt.config.min_column_width = 30
      }

      // 日付フォーマットを日本語に
      gantt.config.date_format = "%Y-%m-%d"
      gantt.templates.date_scale = null // カスタムformatを使用

      // ガントチャートを再描画
      gantt.render()

      console.log("[gantt] Japanese locale and scales applied, viewPeriod:", viewPeriod)

      // Clean up previous event handlers
      eventIdsRef.current.forEach((id) => {
        try {
          gantt.detachEvent(id)
        } catch {
          // Ignore errors during cleanup
        }
      })
      eventIdsRef.current = []

      // Handle double click on task bar - open floating panel at click position
      const dblClickId = gantt.attachEvent("onTaskDblClick", (id: string, e: MouseEvent) => {
        console.log("[gantt] onTaskDblClick:", id)
        if (onTaskDblClickRef.current) {
          const position = { x: e.clientX, y: e.clientY }
          onTaskDblClickRef.current(id, position)
        }
        return false // Prevent default lightbox
      })
      eventIdsRef.current.push(dblClickId)

      // Handle single click on task - select task
      const clickId = gantt.attachEvent("onTaskClick", (id: string) => {
        console.log("[gantt] onTaskClick:", id)
        if (onTaskSelectRef.current) {
          onTaskSelectRef.current(id)
        }
        return true // Allow default behavior
      })
      eventIdsRef.current.push(clickId)

      // Handle double click on grid row (left side) - also open floating panel
      const gridDblClickId = gantt.attachEvent("onRowDblClick", (id: string, e: MouseEvent) => {
        console.log("[gantt] onRowDblClick:", id)
        if (onTaskDblClickRef.current) {
          const position = { x: e.clientX, y: e.clientY }
          onTaskDblClickRef.current(id, position)
        }
        return false // Prevent default
      })
      eventIdsRef.current.push(gridDblClickId)

      setIsGanttReady(true)
    }

    // Start polling after a short delay to let the component mount
    const timer = setTimeout(tryAttachEvents, 200)

    return () => {
      clearTimeout(timer)
      // Cleanup on unmount
      const gantt = ganttRef.current?.instance
      if (gantt) {
        eventIdsRef.current.forEach((eventId) => {
          try {
            gantt.detachEvent(eventId)
          } catch {
            // Ignore errors during cleanup
          }
        })
      }
      eventIdsRef.current = []
    }
  }, [GanttComponent, viewPeriod, getScales])

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20 min-h-[500px]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">ガントチャートを読み込み中...</p>
          <p className="text-xs text-muted-foreground mt-2">DHTMLX Gantt (Trial Version)</p>
        </div>
      </div>
    )
  }

  if (!GanttComponent) {
    return (
      <div className="flex-1 flex items-center justify-center bg-destructive/10 min-h-[500px]">
        <p className="text-destructive">ガントチャートの読み込みに失敗しました</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="flex-1 h-full min-h-[500px]">
      <GanttComponent
        ref={ganttRef}
        tasks={tasks}
        links={links}
        scales={getScales(viewPeriod)}
        columns={columns}
        cellWidth={viewPeriod === "month" ? 40 : viewPeriod === "week" ? 60 : 30}
        cellHeight={40}
        readonly={false}
        locale="ja"
        config={ganttConfig}
        templates={ganttTemplates}
        modals={{
          onBeforeTaskDelete: handleDeleteRequest,
        }}
        data={{
          save: handleDataSave,
        }}
      />
    </div>
  )
}

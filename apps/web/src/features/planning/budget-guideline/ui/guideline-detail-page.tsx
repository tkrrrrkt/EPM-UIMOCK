"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import {
  Button,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Skeleton,
  useToast,
} from "@/shared/ui"
import { MockBffClient } from "../api/mock-bff-client"
import { ConfirmStatusDialog } from "../dialogs/confirm-status-dialog"
import { InputTab } from "../tabs/input-tab"
import { OverviewTab } from "../tabs/overview-tab"
import { TrendTab } from "../tabs/trend-tab"
import type { BffGuidelineEventDetailResponse, GuidelineEventStatus } from "@epm/contracts/bff/budget-guideline"

const bffClient = new MockBffClient()

interface GuidelineDetailPageProps {
  eventId: string
}

export function GuidelineDetailPage({ eventId }: GuidelineDetailPageProps) {
  const [event, setEvent] = useState<BffGuidelineEventDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [targetStatus, setTargetStatus] = useState<GuidelineEventStatus | null>(null)
  const [activeTab, setActiveTab] = useState("input")
  const { toast } = useToast()

  useEffect(() => {
    loadEvent()
  }, [eventId])

  async function loadEvent() {
    try {
      setLoading(true)
      const data = await bffClient.getEventDetail(eventId)
      setEvent(data)
    } catch (error) {
      toast({
        title: "エラー",
        description: "イベントの読み込みに失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  function handleStatusChange(status: GuidelineEventStatus) {
    setTargetStatus(status)
    setConfirmDialogOpen(true)
  }

  async function handleConfirmStatus() {
    if (!targetStatus) return

    try {
      await bffClient.updateEvent(eventId, { status: targetStatus })
      toast({
        title: "ステータス変更完了",
        description: targetStatus === "CONFIRMED" ? "イベントを確定しました" : "イベントを下書きに戻しました",
      })
      loadEvent()
    } catch (error) {
      toast({
        title: "エラー",
        description: "ステータスの変更に失敗しました",
        variant: "destructive",
      })
    } finally {
      setConfirmDialogOpen(false)
      setTargetStatus(null)
    }
  }

  function getStatusBadgeVariant(status: string) {
    return status === "CONFIRMED" ? "default" : "secondary"
  }

  function getStatusLabel(status: string) {
    return status === "CONFIRMED" ? "確定" : "下書き"
  }

  function getPeriodLabel(periodType: string, periodNo: number) {
    switch (periodType) {
      case "ANNUAL":
        return "年度"
      case "HALF":
        return periodNo === 1 ? "上期" : "下期"
      case "QUARTER":
        return `Q${periodNo}`
      default:
        return periodType
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <Skeleton className="h-12 w-96" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center text-muted-foreground">イベントが見つかりません</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6 lg:px-8">
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Button variant="ghost" className="gap-2 -ml-2" onClick={() => (window.location.href = "/planning/guideline")}>
              <ArrowLeft className="h-4 w-4" />
              戻る
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground lg:text-4xl">{event.eventName}</h1>
              <Badge variant={getStatusBadgeVariant(event.status)} className="text-sm">{getStatusLabel(event.status)}</Badge>
            </div>
            <p className="text-pretty text-muted-foreground text-base">
              {event.eventCode} | FY{event.fiscalYear} {getPeriodLabel(event.periodType, event.periodNo)}
            </p>
          </div>

          {event.status === "DRAFT" ? (
            <Button size="lg" onClick={() => handleStatusChange("CONFIRMED")}>ステータスを確定</Button>
          ) : (
            <Button variant="outline" size="lg" onClick={() => handleStatusChange("DRAFT")}>
              下書きに戻す
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-3 h-12">
            <TabsTrigger value="input" className="text-base">入力</TabsTrigger>
            <TabsTrigger value="overview" className="text-base">全社集計</TabsTrigger>
            <TabsTrigger value="trend" className="text-base">推移分析</TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="space-y-4">
            <InputTab event={event} />
          </TabsContent>

          <TabsContent value="overview" className="space-y-4">
            <OverviewTab eventId={eventId} event={event} />
          </TabsContent>

          <TabsContent value="trend" className="space-y-4">
            <TrendTab eventId={eventId} event={event} />
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmStatusDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        currentStatus={event.status}
        targetStatus={targetStatus}
        onConfirm={handleConfirmStatus}
      />
    </div>
  )
}

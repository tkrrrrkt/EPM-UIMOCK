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
import { ConfirmStatusDialog } from "./dialogs/confirm-status-dialog"
import { MtpInputTab } from "./tabs/mtp-input-tab"
import { MtpOverviewTab } from "./tabs/mtp-overview-tab"
import { MtpTrendTab } from "./tabs/mtp-trend-tab"
import { MtpStrategyTab } from "./tabs/mtp-strategy-tab"
import type { BffMtpEventDetailResponse } from "@epm/contracts/bff/mtp"

const bffClient = new MockBffClient()

interface MtpEventDetailPageProps {
  eventId: string
}

export function MtpEventDetailPage({ eventId }: MtpEventDetailPageProps) {
  const [event, setEvent] = useState<BffMtpEventDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
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

  async function handleConfirmStatus() {
    try {
      await bffClient.updateEvent(eventId, { status: "CONFIRMED" })
      toast({
        title: "ステータス変更完了",
        description: "イベントを確定しました",
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
    }
  }

  function getStatusBadgeVariant(status: string) {
    return status === "CONFIRMED" ? "default" : "secondary"
  }

  function getStatusLabel(status: string) {
    return status === "CONFIRMED" ? "確定" : "下書き"
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
            <Button variant="ghost" className="gap-2 -ml-2" onClick={() => (window.location.href = "/planning/mtp-sync")}>
              <ArrowLeft className="h-4 w-4" />
              戻る
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground lg:text-4xl">{event.eventName}</h1>
              <Badge variant="outline" className="text-sm">SyV</Badge>
              <Badge variant={getStatusBadgeVariant(event.status)} className="text-sm">{getStatusLabel(event.status)}</Badge>
            </div>
            <p className="text-pretty text-muted-foreground text-base">
              {event.eventCode} | FY{event.startFiscalYear} 〜 FY{event.endFiscalYear} ({event.planYears}年計画)
            </p>
          </div>

          {event.status === "DRAFT" && <Button size="lg" onClick={() => setConfirmDialogOpen(true)}>ステータスを確定</Button>}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-xl grid-cols-4 h-12">
            <TabsTrigger value="input" className="text-base">入力</TabsTrigger>
            <TabsTrigger value="overview" className="text-base">全社集計</TabsTrigger>
            <TabsTrigger value="trend" className="text-base">推移分析</TabsTrigger>
            <TabsTrigger value="strategy" className="text-base">戦略テーマ</TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="space-y-4">
            <MtpInputTab eventId={eventId} event={event} />
          </TabsContent>

          <TabsContent value="overview" className="space-y-4">
            <MtpOverviewTab eventId={eventId} event={event} />
          </TabsContent>

          <TabsContent value="trend" className="space-y-4">
            <MtpTrendTab eventId={eventId} event={event} />
          </TabsContent>

          <TabsContent value="strategy" className="space-y-4">
            <MtpStrategyTab eventId={eventId} event={event} />
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmStatusDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={handleConfirmStatus}
      />
    </div>
  )
}

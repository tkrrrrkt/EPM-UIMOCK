"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, Skeleton, useToast } from "@/shared/ui"
import { MockBffClient } from "../../api/mock-bff-client"
import { OverviewGrid } from "../overview-grid"
import type { BffMtpEventDetailResponse, BffMtpOverviewResponse } from "@epm/contracts/bff/mtp"

const bffClient = new MockBffClient()

interface MtpOverviewTabProps {
  eventId: string
  event: BffMtpEventDetailResponse
}

export function MtpOverviewTab({ eventId, event }: MtpOverviewTabProps) {
  const [overviewData, setOverviewData] = useState<BffMtpOverviewResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadOverview()
  }, [eventId])

  async function loadOverview() {
    try {
      setLoading(true)
      const data = await bffClient.getOverview(eventId)
      setOverviewData(data)
    } catch (error) {
      toast({
        title: "エラー",
        description: "全社俯瞰データの読み込みに失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!overviewData) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">データがありません</CardContent>
      </Card>
    )
  }

  return <OverviewGrid data={overviewData} />
}

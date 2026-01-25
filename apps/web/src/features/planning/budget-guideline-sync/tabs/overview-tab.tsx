"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, Skeleton, useToast } from "@/shared/ui"
import { MockBffClient } from "../api/mock-bff-client"
import { OverviewGrid } from "../ui/overview-grid"
import type { BffGuidelineEventDetailResponse, BffOverviewResponse } from "@epm/contracts/bff/budget-guideline"

const bffClient = new MockBffClient()

interface OverviewTabProps {
  eventId: string
  event: BffGuidelineEventDetailResponse
}

export function OverviewTab({ eventId, event }: OverviewTabProps) {
  const [overviewData, setOverviewData] = useState<BffOverviewResponse | null>(null)
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

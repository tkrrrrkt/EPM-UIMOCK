"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  ToggleGroup,
  ToggleGroupItem,
  useToast,
} from "@/shared/ui"
import { List, LayoutGrid } from "lucide-react"
import { MockBffClient } from "../../api/mock-bff-client"
import { DimensionValueSelector } from "../dimension-value-selector"
import { MtpBulkAmountGrid } from "../mtp-bulk-amount-grid"
import type {
  BffMtpEventDetailResponse,
  BffMtpAmountsResponse,
  BffSubjectRow,
  BffAmountColumn,
  BffMtpAmountCell,
} from "@epm/contracts/bff/mtp"

// Dynamic import for Syncfusion TreeGrid (SSR disabled)
const TreeGridMtpAmountGrid = dynamic(
  () => import("../treegrid-mtp-amount-grid").then((mod) => ({ default: mod.TreeGridMtpAmountGrid })),
  {
    ssr: false,
    loading: () => (
      <Card>
        <CardContent className="py-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    ),
  }
)

const bffClient = new MockBffClient()

type InputMode = "single" | "bulk"

interface BulkMtpAmountData {
  dimensionValueId: string
  subjects: BffSubjectRow[]
  columns: BffAmountColumn[]
  amounts: BffMtpAmountCell[]
  isReadOnly: boolean
}

interface MtpInputTabProps {
  eventId: string
  event: BffMtpEventDetailResponse
}

export function MtpInputTab({ eventId, event }: MtpInputTabProps) {
  const [inputMode, setInputMode] = useState<InputMode>("single")
  const [selectedDimensionValueId, setSelectedDimensionValueId] = useState<string>("")
  const [amountsData, setAmountsData] = useState<BffMtpAmountsResponse | null>(null)
  const [bulkData, setBulkData] = useState<BulkMtpAmountData[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // 単一モード: 選択したディメンション値のデータを読み込む
  useEffect(() => {
    if (inputMode === "single" && selectedDimensionValueId) {
      loadAmounts()
    }
  }, [selectedDimensionValueId, eventId, inputMode])

  // 一括モード: 全ディメンション値のデータを読み込む
  useEffect(() => {
    if (inputMode === "bulk") {
      loadBulkData()
    }
  }, [eventId, inputMode])

  async function loadAmounts() {
    try {
      setLoading(true)
      const data = await bffClient.getAmounts(eventId, {
        dimensionValueId: selectedDimensionValueId === "dv-all" ? undefined : selectedDimensionValueId,
      })
      setAmountsData(data)
    } catch (error) {
      toast({
        title: "エラー",
        description: "数値データの読み込みに失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function loadBulkData() {
    try {
      setLoading(true)
      const data = await bffClient.getBulkAmounts(eventId)
      setBulkData(data)
    } catch (error) {
      toast({
        title: "エラー",
        description: "一括データの読み込みに失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAmountChange = async (subjectId: string, fiscalYear: number, amount: string) => {
    if (!amountsData || amountsData.isReadOnly) return

    try {
      await bffClient.saveAmounts(eventId, {
        dimensionValueId: selectedDimensionValueId === "dv-all" ? "" : selectedDimensionValueId,
        amounts: [{ subjectId, fiscalYear, amount, isActual: false }],
      })
    } catch (error) {
      toast({
        title: "エラー",
        description: "数値の保存に失敗しました",
        variant: "destructive",
      })
    }
  }

  const handleBulkAmountChange = async (
    dimensionValueId: string,
    subjectId: string,
    fiscalYear: number,
    amount: string,
  ) => {
    try {
      await bffClient.saveAmounts(eventId, {
        dimensionValueId,
        amounts: [{ subjectId, fiscalYear, amount, isActual: false }],
      })
    } catch (error) {
      toast({
        title: "エラー",
        description: "数値の保存に失敗しました",
        variant: "destructive",
      })
    }
  }

  const handleModeChange = (value: string) => {
    if (value) {
      setInputMode(value as InputMode)
    }
  }

  return (
    <div className="space-y-4">
      {/* モード切替 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>入力モード</CardTitle>
            <ToggleGroup type="single" value={inputMode} onValueChange={handleModeChange}>
              <ToggleGroupItem value="single" aria-label="単一選択モード">
                <List className="h-4 w-4 mr-2" />
                単一選択
              </ToggleGroupItem>
              <ToggleGroupItem value="bulk" aria-label="一括入力モード">
                <LayoutGrid className="h-4 w-4 mr-2" />
                一括入力
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardHeader>
        {inputMode === "single" && (
          <CardContent>
            <DimensionValueSelector
              dimensionValues={event.dimensionValues}
              value={selectedDimensionValueId}
              onChange={setSelectedDimensionValueId}
            />
          </CardContent>
        )}
        {inputMode === "bulk" && (
          <CardContent>
            <p className="text-sm text-muted-foreground">
              全てのセグメントを一括で入力できます。全社合計は自動集計されます。
            </p>
          </CardContent>
        )}
      </Card>

      {/* ローディング */}
      {loading && (
        <Card>
          <CardContent className="py-8">
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* 単一選択モード */}
      {inputMode === "single" && !loading && selectedDimensionValueId && amountsData && (
        <TreeGridMtpAmountGrid
          eventId={eventId}
          dimensionValueId={selectedDimensionValueId}
          data={amountsData}
          onAmountChange={handleAmountChange}
        />
      )}

      {inputMode === "single" && !loading && selectedDimensionValueId && !amountsData && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">データがありません</CardContent>
        </Card>
      )}

      {inputMode === "single" && !loading && !selectedDimensionValueId && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            セグメントを選択してください
          </CardContent>
        </Card>
      )}

      {/* 一括入力モード */}
      {inputMode === "bulk" && !loading && bulkData.length > 0 && (
        <MtpBulkAmountGrid
          dimensionValues={event.dimensionValues}
          bulkData={bulkData}
          onAmountChange={handleBulkAmountChange}
        />
      )}

      {inputMode === "bulk" && !loading && bulkData.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">データがありません</CardContent>
        </Card>
      )}
    </div>
  )
}

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
import { MockBffClient } from "../api/mock-bff-client"
import { DimensionValueSelector } from "../ui/dimension-value-selector"
import { BulkAmountGrid } from "../ui/bulk-amount-grid"
import type {
  BffGuidelineEventDetailResponse,
  BffGuidelineAmountsResponse,
  BffActualsResponse,
  BffSubjectRow,
  BffPeriodColumn,
  BffGuidelineAmountCell,
  BffActualCell,
} from "@epm/contracts/bff/budget-guideline"

// Dynamic import for Syncfusion TreeGrid (SSR disabled)
const TreeGridAmountGrid = dynamic(
  () => import("../ui/treegrid-amount-grid").then((mod) => ({ default: mod.TreeGridAmountGrid })),
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

interface BulkAmountData {
  dimensionValueId: string
  subjects: BffSubjectRow[]
  guidelinePeriods: BffPeriodColumn[]
  guidelineAmounts: BffGuidelineAmountCell[]
  actualsYears: number[]
  actualsAmounts: BffActualCell[]
  isReadOnly: boolean
}

interface InputTabProps {
  event: BffGuidelineEventDetailResponse
}

export function InputTab({ event }: InputTabProps) {
  const [inputMode, setInputMode] = useState<InputMode>("single")
  const [selectedDimensionValueId, setSelectedDimensionValueId] = useState<string>("")
  const [guidelineData, setGuidelineData] = useState<BffGuidelineAmountsResponse | null>(null)
  const [actualsData, setActualsData] = useState<BffActualsResponse | null>(null)
  const [bulkData, setBulkData] = useState<BulkAmountData[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // 単一モード: 選択したディメンション値のデータを読み込む
  useEffect(() => {
    if (inputMode === "single" && selectedDimensionValueId) {
      loadSingleData()
    }
  }, [selectedDimensionValueId, event.id, inputMode])

  // 一括モード: 全ディメンション値のデータを読み込む
  useEffect(() => {
    if (inputMode === "bulk") {
      loadBulkData()
    }
  }, [event.id, inputMode])

  async function loadSingleData() {
    try {
      setLoading(true)
      const [guideline, actuals] = await Promise.all([
        bffClient.getGuidelineAmounts(event.id, {
          dimensionValueId: selectedDimensionValueId === "dv-all" ? undefined : selectedDimensionValueId,
        }),
        bffClient.getActuals(event.id, {
          dimensionValueId: selectedDimensionValueId === "dv-all" ? undefined : selectedDimensionValueId,
          yearsBack: 5,
        }),
      ])
      setGuidelineData(guideline)
      setActualsData(actuals)
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
      const data = await bffClient.getBulkGuidelineAmounts(event.id)
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

  const handleAmountChange = async (subjectId: string, periodKey: string, amount: string) => {
    if (!guidelineData || guidelineData.isReadOnly) return

    try {
      await bffClient.saveGuidelineAmounts(event.id, {
        dimensionValueId: selectedDimensionValueId,
        amounts: [{ subjectId, periodKey, amount }],
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
    periodKey: string,
    amount: string,
  ) => {
    try {
      await bffClient.saveGuidelineAmounts(event.id, {
        dimensionValueId,
        amounts: [{ subjectId, periodKey, amount }],
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
            {guidelineData?.isReadOnly && (
              <p className="mt-2 text-sm text-muted-foreground">(読み取り専用)</p>
            )}
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
      {inputMode === "single" && !loading && selectedDimensionValueId && guidelineData && actualsData && (
        <TreeGridAmountGrid
          subjects={guidelineData.subjects}
          guidelinePeriods={guidelineData.guidelinePeriods}
          guidelineAmounts={guidelineData.amounts}
          actualsYears={actualsData.fiscalYears}
          actualsAmounts={actualsData.amounts}
          isReadOnly={guidelineData.isReadOnly}
          onAmountChange={handleAmountChange}
        />
      )}

      {inputMode === "single" && !loading && selectedDimensionValueId && !guidelineData && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">データがありません</CardContent>
        </Card>
      )}

      {inputMode === "single" && !loading && !selectedDimensionValueId && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            組織単位を選択してください
          </CardContent>
        </Card>
      )}

      {/* 一括入力モード */}
      {inputMode === "bulk" && !loading && bulkData.length > 0 && (
        <BulkAmountGrid
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

"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useToast,
} from "@/shared/ui"
import { MockForecastBffClient } from "../api/MockBffClient"

const bffClient = new MockForecastBffClient()

interface CreateForecastEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateForecastEventDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateForecastEventDialogProps) {
  const [eventCode, setEventCode] = useState("")
  const [eventName, setEventName] = useState("")
  const [fiscalYear, setFiscalYear] = useState<string>("")
  const [wnbEnabled, setWnbEnabled] = useState(false)
  const [wnbStartPeriodNo, setWnbStartPeriodNo] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // W/N/B開始月の選択肢（4月〜3月）
  const wnbMonths = [
    { value: "4", label: "4月" },
    { value: "5", label: "5月" },
    { value: "6", label: "6月" },
    { value: "7", label: "7月" },
    { value: "8", label: "8月" },
    { value: "9", label: "9月" },
    { value: "10", label: "10月" },
    { value: "11", label: "11月" },
    { value: "12", label: "12月" },
    { value: "1", label: "1月" },
    { value: "2", label: "2月" },
    { value: "3", label: "3月" },
  ]

  const currentYear = new Date().getFullYear()
  const fiscalYears = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).reverse()

  async function handleSubmit() {
    if (!eventCode || !eventName || !fiscalYear) {
      toast({
        title: "エラー",
        description: "すべての項目を入力してください",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      await bffClient.createEvent({
        eventCode,
        eventName,
        fiscalYear: Number(fiscalYear),
        layoutId: "layout-1",
        wnbStartPeriodNo: wnbEnabled && wnbStartPeriodNo ? Number(wnbStartPeriodNo) : undefined,
      })
      toast({
        title: "作成完了",
        description: "見込イベントを作成しました",
      })
      onSuccess()
      onOpenChange(false)
      resetForm()
    } catch (error) {
      const errorMessage =
        error instanceof Error && error.message === "FORECAST_EVENT_CODE_DUPLICATE"
          ? "イベントコードが重複しています"
          : "イベントの作成に失敗しました"
      toast({
        title: "エラー",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setEventCode("")
    setEventName("")
    setFiscalYear("")
    setWnbEnabled(false)
    setWnbStartPeriodNo("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>見込イベントを作成</DialogTitle>
          <DialogDescription>
            新しい見込イベントを作成します。年度を選択し、イベント情報を入力してください。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="event-code">イベントコード</Label>
            <Input
              id="event-code"
              value={eventCode}
              onChange={(e) => setEventCode(e.target.value)}
              placeholder="例: FC2026"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="event-name">イベント名</Label>
            <Input
              id="event-name"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="例: 2026年度見込"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="fiscal-year">年度</Label>
            <Select value={fiscalYear} onValueChange={setFiscalYear}>
              <SelectTrigger id="fiscal-year">
                <SelectValue placeholder="年度を選択" />
              </SelectTrigger>
              <SelectContent>
                {fiscalYears.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    FY{year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* W/N/B設定 */}
          <div className="border rounded-lg p-4 bg-muted/30">
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="wnb-enabled"
                checked={wnbEnabled}
                onChange={(e) => {
                  setWnbEnabled(e.target.checked)
                  if (!e.target.checked) {
                    setWnbStartPeriodNo("")
                  }
                }}
                className="rounded border-input"
              />
              <Label htmlFor="wnb-enabled" className="cursor-pointer">
                W/N/B入力を有効にする
              </Label>
            </div>
            {wnbEnabled && (
              <div className="grid gap-2 ml-6">
                <Label htmlFor="wnb-start">W/N/B開始月</Label>
                <Select value={wnbStartPeriodNo} onValueChange={setWnbStartPeriodNo}>
                  <SelectTrigger id="wnb-start">
                    <SelectValue placeholder="開始月を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {wnbMonths.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  指定月以降の見込値に対してワースト/ノーマル/ベストの3シナリオ入力が可能になります
                </p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "作成中..." : "作成"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

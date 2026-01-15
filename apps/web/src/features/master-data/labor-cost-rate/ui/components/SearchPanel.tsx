"use client"

import { useState } from "react"
import type { BffListLaborCostRatesRequest, ResourceType, RateType } from "../types/bff-contracts"
import {
  Card,
  CardContent,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Button,
} from "@/shared/ui"

interface SearchPanelProps {
  onSearch: (params: BffListLaborCostRatesRequest) => void
}

export function SearchPanel({ onSearch }: SearchPanelProps) {
  const [keyword, setKeyword] = useState("")
  const [resourceType, setResourceType] = useState<string>("all")
  const [grade, setGrade] = useState<string>("all")
  const [employmentType, setEmploymentType] = useState<string>("all")
  const [rateType, setRateType] = useState<string>("all")
  const [isActive, setIsActive] = useState<string>("true")
  const [asOfDate, setAsOfDate] = useState<string>(new Date().toISOString().split("T")[0])

  function handleSearch() {
    const params: BffListLaborCostRatesRequest = {
      keyword: keyword || undefined,
      resourceType: resourceType !== "all" ? (resourceType as ResourceType) : undefined,
      grade: grade !== "all" ? grade : undefined,
      employmentType: employmentType !== "all" ? employmentType : undefined,
      rateType: rateType !== "all" ? (rateType as RateType) : undefined,
      isActive: isActive === "all" ? undefined : isActive === "true",
      asOfDate: asOfDate || undefined,
    }
    onSearch(params)
  }

  function handleReset() {
    setKeyword("")
    setResourceType("all")
    setGrade("all")
    setEmploymentType("all")
    setRateType("all")
    setIsActive("true")
    setAsOfDate(new Date().toISOString().split("T")[0])
    onSearch({
      isActive: true,
      asOfDate: new Date().toISOString().split("T")[0],
    })
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">キーワード検索</label>
            <Input
              placeholder="単価コード・職種・外注先で検索"
              value={keyword}
              onChange={(e: any) => setKeyword(e.target.value)}
              onKeyDown={(e: any) => {
                if (e.key === "Enter") handleSearch()
              }}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">リソース区分</label>
            <Select value={resourceType} onValueChange={setResourceType}>
              <SelectTrigger>
                <SelectValue placeholder="すべて" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="EMPLOYEE">社員</SelectItem>
                <SelectItem value="CONTRACTOR">外注</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">等級</label>
            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger>
                <SelectValue placeholder="すべて" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="G1">G1</SelectItem>
                <SelectItem value="G2">G2</SelectItem>
                <SelectItem value="G3">G3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">雇用区分</label>
            <Select value={employmentType} onValueChange={setEmploymentType}>
              <SelectTrigger>
                <SelectValue placeholder="すべて" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="REGULAR">正社員</SelectItem>
                <SelectItem value="CONTRACT">契約社員</SelectItem>
                <SelectItem value="PART_TIME">パートタイム</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">単価種別</label>
            <Select value={rateType} onValueChange={setRateType}>
              <SelectTrigger>
                <SelectValue placeholder="すべて" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="MONTHLY">月額</SelectItem>
                <SelectItem value="HOURLY">時給</SelectItem>
                <SelectItem value="DAILY">日給</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">有効状態</label>
            <Select value={isActive} onValueChange={setIsActive}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="true">有効</SelectItem>
                <SelectItem value="false">無効</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">基準日</label>
            <Input type="date" value={asOfDate} onChange={(e: any) => setAsOfDate(e.target.value)} />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={handleSearch}>検索</Button>
          <Button variant="outline" onClick={handleReset}>
            リセット
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

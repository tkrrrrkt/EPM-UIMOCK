"use client"

import { useState, useEffect } from "react"
import { Button, Input, Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Alert, AlertDescription } from "@/shared/ui"
import { createBffClient } from "../api"
import type { BffEmployeeSummary, BffListEmployeesRequest } from "@epm/contracts/bff/employee-master"
import { EmployeeDetailDialog } from "./EmployeeDetailDialog"

export function EmployeeListPage() {
  const [employees, setEmployees] = useState<BffEmployeeSummary[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Search/Filter state
  const [keyword, setKeyword] = useState("")
  const [isActiveFilter, setIsActiveFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"employeeCode" | "employeeName" | "hireDate">("employeeCode")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)

  const bffClient = createBffClient()

  const loadEmployees = async () => {
    setLoading(true)
    setError(null)

    try {
      const request: BffListEmployeesRequest = {
        page,
        pageSize,
        sortBy,
        sortOrder,
        keyword: keyword || undefined,
        isActive: isActiveFilter === "all" ? undefined : isActiveFilter === "active",
      }

      const response = await bffClient.listEmployees(request)
      setEmployees(response.items)
      setTotalCount(response.totalCount)
    } catch (err) {
      setError(err instanceof Error ? err.message : "社員一覧の取得に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEmployees()
  }, [page, sortBy, sortOrder])

  const handleSearch = () => {
    setPage(1)
    loadEmployees()
  }

  const handleOpenNewEmployee = () => {
    setSelectedEmployeeId(null)
    setDialogOpen(true)
  }

  const handleOpenEditEmployee = (employeeId: string) => {
    setSelectedEmployeeId(employeeId)
    setDialogOpen(true)
  }

  const handleDialogClose = (shouldRefresh?: boolean) => {
    setDialogOpen(false)
    setSelectedEmployeeId(null)
    if (shouldRefresh) {
      loadEmployees()
    }
  }

  const handleSortChange = (column: "employeeCode" | "employeeName" | "hireDate") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">社員マスタ</CardTitle>
          <CardDescription>社員の基本情報と所属情報を管理します</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Search and Filter Section */}
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1 space-y-2">
              <label htmlFor="keyword" className="text-sm font-medium">
                検索
              </label>
              <Input
                id="keyword"
                placeholder="社員コード、氏名で検索"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="w-full md:w-48 space-y-2">
              <label htmlFor="isActive" className="text-sm font-medium">
                有効状態
              </label>
              <Select value={isActiveFilter} onValueChange={setIsActiveFilter}>
                <SelectTrigger id="isActive">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全件</SelectItem>
                  <SelectItem value="active">有効のみ</SelectItem>
                  <SelectItem value="inactive">無効のみ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              検索
            </Button>
            <Button onClick={handleOpenNewEmployee} variant="default">
              新規登録
            </Button>
          </div>

          {/* Employee Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <button
                      type="button"
                      onClick={() => handleSortChange("employeeCode")}
                      className="flex items-center gap-1 font-medium hover:text-primary"
                    >
                      社員コード
                      {sortBy === "employeeCode" && <span className="text-xs">{sortOrder === "asc" ? "▲" : "▼"}</span>}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      type="button"
                      onClick={() => handleSortChange("employeeName")}
                      className="flex items-center gap-1 font-medium hover:text-primary"
                    >
                      氏名
                      {sortBy === "employeeName" && <span className="text-xs">{sortOrder === "asc" ? "▲" : "▼"}</span>}
                    </button>
                  </TableHead>
                  <TableHead>メールアドレス</TableHead>
                  <TableHead>
                    <button
                      type="button"
                      onClick={() => handleSortChange("hireDate")}
                      className="flex items-center gap-1 font-medium hover:text-primary"
                    >
                      入社日
                      {sortBy === "hireDate" && <span className="text-xs">{sortOrder === "asc" ? "▲" : "▼"}</span>}
                    </button>
                  </TableHead>
                  <TableHead>有効状態</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      読込中...
                    </TableCell>
                  </TableRow>
                ) : employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      社員が見つかりません
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((employee) => (
                    <TableRow
                      key={employee.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleOpenEditEmployee(employee.id)}
                    >
                      <TableCell className="font-medium">{employee.employeeCode}</TableCell>
                      <TableCell>{employee.employeeName}</TableCell>
                      <TableCell>{employee.email || "-"}</TableCell>
                      <TableCell>{employee.hireDate || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={employee.isActive ? "default" : "secondary"}>
                          {employee.isActive ? "有効" : "無効"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {totalCount} 件中 {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, totalCount)} 件を表示
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                >
                  前へ
                </Button>
                <div className="text-sm">
                  {page} / {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                >
                  次へ
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employee Detail Dialog */}
      <EmployeeDetailDialog open={dialogOpen} employeeId={selectedEmployeeId} onClose={handleDialogClose} />
    </div>
  )
}

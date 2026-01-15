"use client"

import { useState, useEffect } from "react"
import { Button, Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Alert, AlertDescription } from "@/shared/ui"
import { createBffClient } from "../api"
import type { BffEmployeeAssignmentSummary } from "@epm/contracts/bff/employee-master"
import { EmployeeAssignmentForm } from "./EmployeeAssignmentForm"

interface EmployeeAssignmentSectionProps {
  employeeId: string
  employeeHireDate: string | null
  onError: (error: string) => void
}

export function EmployeeAssignmentSection({ employeeId, employeeHireDate, onError }: EmployeeAssignmentSectionProps) {
  const [assignments, setAssignments] = useState<BffEmployeeAssignmentSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<BffEmployeeAssignmentSummary | null>(null)

  const bffClient = createBffClient()

  const loadAssignments = async () => {
    setLoading(true)
    try {
      const response = await bffClient.listEmployeeAssignments(employeeId)
      setAssignments(response.items)
    } catch (err) {
      onError("所属履歴の取得に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAssignments()
  }, [employeeId])

  const handleAddNew = () => {
    setSelectedAssignment(null)
    setFormOpen(true)
  }

  const handleEdit = (assignment: BffEmployeeAssignmentSummary) => {
    setSelectedAssignment(assignment)
    setFormOpen(true)
  }

  const handleDelete = async (assignmentId: string) => {
    if (!confirm("この所属履歴を削除しますか?")) return

    try {
      await bffClient.deleteEmployeeAssignment(employeeId, assignmentId)
      await loadAssignments()
    } catch (err) {
      onError("所属履歴の削除に失敗しました")
    }
  }

  const handleFormClose = (shouldRefresh?: boolean) => {
    setFormOpen(false)
    setSelectedAssignment(null)
    if (shouldRefresh) {
      loadAssignments()
    }
  }

  const sortedAssignments = [...assignments].sort((a, b) => {
    // Primary first, then by effective date desc
    if (a.assignmentType !== b.assignmentType) {
      return a.assignmentType === "primary" ? -1 : 1
    }
    return new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime()
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">所属履歴</h3>
        <Button onClick={handleAddNew} size="sm">
          所属追加
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">読込中...</div>
      ) : sortedAssignments.length === 0 ? (
        <Alert>
          <AlertDescription>所属履歴が登録されていません</AlertDescription>
        </Alert>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">部署</TableHead>
                <TableHead className="w-[100px]">種別</TableHead>
                <TableHead className="w-[100px]">按分率</TableHead>
                <TableHead className="w-[120px]">役職</TableHead>
                <TableHead className="w-[140px]">開始日</TableHead>
                <TableHead className="w-[140px]">終了日</TableHead>
                <TableHead className="w-[100px]">状態</TableHead>
                <TableHead className="w-[160px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAssignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium">{assignment.departmentName}</TableCell>
                  <TableCell>
                    <Badge variant={assignment.assignmentType === "primary" ? "default" : "secondary"}>
                      {assignment.assignmentType === "primary" ? "主務" : "兼務"}
                    </Badge>
                  </TableCell>
                  <TableCell>{assignment.allocationRatio != null ? `${assignment.allocationRatio}%` : "-"}</TableCell>
                  <TableCell>{assignment.title || "-"}</TableCell>
                  <TableCell>{assignment.effectiveDate}</TableCell>
                  <TableCell>{assignment.expiryDate || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={assignment.isActive ? "default" : "outline"}>
                      {assignment.isActive ? "有効" : "無効"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(assignment)}>
                        編集
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(assignment.id)}>
                        削除
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {formOpen && (
        <EmployeeAssignmentForm
          employeeId={employeeId}
          assignment={selectedAssignment}
          existingAssignments={assignments}
          employeeHireDate={employeeHireDate}
          onClose={handleFormClose}
          onError={onError}
        />
      )}
    </div>
  )
}

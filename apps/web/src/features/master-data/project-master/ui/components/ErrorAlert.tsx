"use client"

import { Alert, AlertDescription, AlertTitle } from "@/shared/ui"
import { AlertCircle } from "lucide-react"
import { ProjectMasterErrorCode } from "@epm/contracts/bff/project-master"

interface ProjectMasterError {
  code: string
  message: string
  details?: Record<string, unknown>
}

interface ErrorAlertProps {
  error: ProjectMasterError | Error | null
}

export function ErrorAlert({ error }: ErrorAlertProps) {
  if (!error) return null

  const getErrorMessage = (error: ProjectMasterError | Error): string => {
    if ("code" in error) {
      switch (error.code) {
        case ProjectMasterErrorCode.PROJECT_NOT_FOUND:
          return "プロジェクトが見つかりません"
        case ProjectMasterErrorCode.PROJECT_CODE_DUPLICATE:
          return "プロジェクトコードが重複しています"
        case ProjectMasterErrorCode.PROJECT_ALREADY_INACTIVE:
          return "このプロジェクトは既に無効化されています"
        case ProjectMasterErrorCode.PROJECT_ALREADY_ACTIVE:
          return "このプロジェクトは既に有効です"
        case ProjectMasterErrorCode.PARENT_PROJECT_NOT_FOUND:
          return "親プロジェクトが見つかりません"
        case ProjectMasterErrorCode.INVALID_PARENT_PROJECT:
          return "無効な親プロジェクトです"
        case ProjectMasterErrorCode.VALIDATION_ERROR:
          return "入力内容を確認してください"
        default:
          return error.message || "エラーが発生しました"
      }
    }
    return error.message || "エラーが発生しました"
  }

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>エラー</AlertTitle>
      <AlertDescription>{getErrorMessage(error)}</AlertDescription>
    </Alert>
  )
}

'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Label,
  Textarea,
} from '@/shared/ui'
import type { BffCreateRoleRequest, BffUpdateRoleRequest, BffRoleDetailResponse } from '@epm/contracts/bff/permission-settings'

interface RoleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: BffRoleDetailResponse | null  // null = create mode, object = edit mode
  onSubmit: (data: BffCreateRoleRequest | BffUpdateRoleRequest) => Promise<void>
  loading?: boolean
}

export function RoleFormDialog({
  open,
  onOpenChange,
  role,
  onSubmit,
  loading = false,
}: RoleFormDialogProps) {
  const [roleCode, setRoleCode] = useState('')
  const [roleName, setRoleName] = useState('')
  const [roleDescription, setRoleDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  const isEditMode = role !== null && role !== undefined

  useEffect(() => {
    if (open) {
      if (role) {
        setRoleCode(role.roleCode)
        setRoleName(role.roleName)
        setRoleDescription(role.roleDescription || '')
      } else {
        setRoleCode('')
        setRoleName('')
        setRoleDescription('')
      }
      setError(null)
    }
  }, [open, role])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!roleCode.trim()) {
      setError('ロールコードを入力してください')
      return
    }
    if (!roleName.trim()) {
      setError('ロール名を入力してください')
      return
    }

    try {
      if (isEditMode) {
        await onSubmit({
          roleCode: roleCode.trim(),
          roleName: roleName.trim(),
          roleDescription: roleDescription.trim() || undefined,
        } as BffUpdateRoleRequest)
      } else {
        await onSubmit({
          roleCode: roleCode.trim(),
          roleName: roleName.trim(),
          roleDescription: roleDescription.trim() || undefined,
        } as BffCreateRoleRequest)
      }
      onOpenChange(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'エラーが発生しました'
      if (message === 'ROLE_CODE_DUPLICATE') {
        setError('このロールコードは既に使用されています')
      } else {
        setError(message)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'ロール編集' : '新規ロール作成'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="roleCode">
                ロールコード <span className="text-destructive">*</span>
              </Label>
              <Input
                id="roleCode"
                value={roleCode}
                onChange={(e) => setRoleCode(e.target.value.toUpperCase())}
                placeholder="ADMIN"
                maxLength={20}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="roleName">
                ロール名 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="roleName"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="管理者"
                maxLength={100}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="roleDescription">説明</Label>
              <Textarea
                id="roleDescription"
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
                placeholder="ロールの説明を入力..."
                rows={3}
                maxLength={500}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              キャンセル
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '処理中...' : isEditMode ? '更新' : '作成'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

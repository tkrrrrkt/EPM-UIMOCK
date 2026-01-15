'use client'

import { useState, useEffect } from 'react'
import { Pencil, Settings, Users, Calendar } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Badge,
  Separator,
} from '@/shared/ui'
import type { BffRoleDetailResponse } from '@epm/contracts/bff/permission-settings'
import { bffClient } from '../../api'

interface RoleDetailDialogProps {
  roleId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (role: BffRoleDetailResponse) => void
  onEditPermissions: (roleId: string) => void
}

export function RoleDetailDialog({
  roleId,
  open,
  onOpenChange,
  onEdit,
  onEditPermissions,
}: RoleDetailDialogProps) {
  const [role, setRole] = useState<BffRoleDetailResponse | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && roleId) {
      loadRole()
    }
  }, [open, roleId])

  const loadRole = async () => {
    if (!roleId) return
    setLoading(true)
    try {
      const data = await bffClient.getRoleDetail(roleId)
      setRole(data)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>ロール詳細</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">読み込み中...</div>
        ) : role ? (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ロールコード</p>
                <p className="font-mono text-lg">{role.roleCode}</p>
              </div>
              <Badge variant={role.isActive ? 'default' : 'secondary'} className="mt-1">
                {role.isActive ? '有効' : '無効'}
              </Badge>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">ロール名</p>
              <p className="font-medium text-lg">{role.roleName}</p>
            </div>

            {role.roleDescription && (
              <div>
                <p className="text-sm text-muted-foreground">説明</p>
                <p className="text-sm">{role.roleDescription}</p>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>割り当て人数: </span>
              <span className="font-medium">{role.assignedEmployeeCount}人</span>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">作成日時</p>
                  <p>{formatDate(role.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">更新日時</p>
                  <p>{formatDate(role.updatedAt)}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => onEdit(role)}>
                <Pencil className="mr-2 h-4 w-4" />
                編集
              </Button>
              <Button className="flex-1" onClick={() => onEditPermissions(role.id)}>
                <Settings className="mr-2 h-4 w-4" />
                権限設定
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">ロールが見つかりません</div>
        )}
      </DialogContent>
    </Dialog>
  )
}

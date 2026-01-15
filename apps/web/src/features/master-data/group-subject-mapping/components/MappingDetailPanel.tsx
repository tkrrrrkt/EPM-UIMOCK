'use client'

import { useState, useEffect } from 'react'
import { Card, Button, Badge, Label, Separator } from '@/shared/ui'
import { X, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { CreateMappingForm } from './CreateMappingForm'
import type {
  BffMappingListItem,
  BffMappingDetailResponse,
  BffCreateMappingRequest,
} from '@epm/contracts/bff/group-subject-mapping'
import type { BffClient } from '../api/BffClient'

interface MappingDetailPanelProps {
  item: BffMappingListItem
  bffClient: BffClient
  onClose: () => void
  onRefresh: () => void
}

export function MappingDetailPanel({
  item,
  bffClient,
  onClose,
  onRefresh,
}: MappingDetailPanelProps) {
  const [detail, setDetail] = useState<BffMappingDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const loadDetail = async () => {
    if (!item.id) return
    setIsLoading(true)
    try {
      const data = await bffClient.getMappingDetail(item.id)
      setDetail(data)
    } catch (error) {
      console.error('Failed to load detail:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (item.isMapped && item.id) {
      loadDetail()
    }
  }, [item.id, item.isMapped])

  const handleDelete = async () => {
    if (!item.id) return
    try {
      await bffClient.deleteMapping(item.id)
      onRefresh()
      onClose()
    } catch (error) {
      console.error('Failed to delete mapping:', error)
    }
  }

  const handleToggleActive = async () => {
    if (!item.id) return
    try {
      if (item.isActive) {
        await bffClient.deactivateMapping(item.id)
      } else {
        await bffClient.reactivateMapping(item.id)
      }
      onRefresh()
      loadDetail()
    } catch (error) {
      console.error('Failed to toggle active:', error)
    }
  }

  const handleCreateMapping = async (data: BffCreateMappingRequest) => {
    try {
      await bffClient.createMapping(data)
      onRefresh()
      setShowEditForm(false)
      loadDetail()
    } catch (error) {
      console.error('Failed to create mapping:', error)
    }
  }

  return (
    <Card className="w-96 h-full flex flex-col border-l">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-lg">マッピング詳細</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Company Subject Info */}
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">会社科目</Label>
          <div className="space-y-2">
            <div>
              <div className="text-xs text-muted-foreground">コード</div>
              <code className="text-sm font-mono">{item.companySubjectCode}</code>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">名称</div>
              <div className="text-sm font-medium">{item.companySubjectName}</div>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">{item.companySubjectClass}</Badge>
              <Badge variant="outline">{item.companySubjectType}</Badge>
              {item.companySubjectIsContra && (
                <Badge variant="destructive" className="text-xs">
                  控除科目
                </Badge>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Mapping Info */}
        {!item.isMapped ? (
          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="text-sm text-muted-foreground mb-4">マッピング未設定</div>
              {!showEditForm ? (
                <Button onClick={() => setShowEditForm(true)}>マッピングを設定</Button>
              ) : null}
            </div>

            {showEditForm && (
              <CreateMappingForm
                companySubjectId={item.companySubjectId}
                companySubjectCode={item.companySubjectCode}
                companySubjectName={item.companySubjectName}
                companySubjectType={item.companySubjectType}
                isContra={item.companySubjectIsContra}
                bffClient={bffClient}
                onSubmit={handleCreateMapping}
                onCancel={() => setShowEditForm(false)}
              />
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                マッピング先連結科目
              </Label>
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-muted-foreground">コード</div>
                  <code className="text-sm font-mono">{item.groupSubjectCode}</code>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">名称</div>
                  <div className="text-sm font-medium">{item.groupSubjectName}</div>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">係数</Label>
              <div className="text-sm">
                {item.coefficient === 1 ? '+1（通常）' : '-1（控除・マイナス）'}
              </div>
            </div>

            {item.mappingNote && (
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">メモ</Label>
                <div className="text-sm">{item.mappingNote}</div>
              </div>
            )}

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">状態</Label>
              <Badge variant={item.isActive ? 'default' : 'secondary'}>
                {item.isActive ? '有効' : '無効'}
              </Badge>
            </div>

            {detail && (
              <div className="text-xs text-muted-foreground space-y-1">
                <div>作成日時: {new Date(detail.createdAt).toLocaleString('ja-JP')}</div>
                <div>更新日時: {new Date(detail.updatedAt).toLocaleString('ja-JP')}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {item.isMapped && (
        <div className="p-4 border-t space-y-2">
          <Button variant="outline" className="w-full bg-transparent" onClick={handleToggleActive}>
            {item.isActive ? (
              <>
                <ToggleLeft className="h-4 w-4 mr-2" />
                無効化
              </>
            ) : (
              <>
                <ToggleRight className="h-4 w-4 mr-2" />
                再有効化
              </>
            )}
          </Button>

          {!showDeleteConfirm ? (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              マッピング解除
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="text-sm text-center text-destructive">
                このマッピングを解除しますか？
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  キャンセル
                </Button>
                <Button variant="destructive" className="flex-1" onClick={handleDelete}>
                  解除実行
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

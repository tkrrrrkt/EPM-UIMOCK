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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ScrollArea,
} from '@/shared/ui'
import { Search } from 'lucide-react'
import { GroupSubjectSelectTree } from './GroupSubjectSelectTree'
import type {
  BffGroupSubjectSelectTreeNode,
  BffGroupSubjectSelectTreeResponse,
} from '@epm/contracts/bff/group-subject-mapping'
import type { BffClient } from '../api/BffClient'

interface GroupSubjectSelectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (node: BffGroupSubjectSelectTreeNode) => void
  bffClient: BffClient
  recommendedType?: 'FIN' | 'KPI'
}

export function GroupSubjectSelectDialog({
  open,
  onOpenChange,
  onSelect,
  bffClient,
  recommendedType,
}: GroupSubjectSelectDialogProps) {
  const [keyword, setKeyword] = useState('')
  const [subjectType, setSubjectType] = useState<string>('all')
  const [treeData, setTreeData] = useState<BffGroupSubjectSelectTreeResponse | null>(null)
  const [selectedNode, setSelectedNode] = useState<BffGroupSubjectSelectTreeNode | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      loadTreeData()
    }
  }, [open, keyword, subjectType])

  const loadTreeData = async () => {
    setIsLoading(true)
    try {
      const data = await bffClient.getGroupSubjectTree({
        keyword: keyword || undefined,
        subjectType: subjectType !== 'all' ? (subjectType as 'FIN' | 'KPI') : undefined,
      })
      setTreeData(data)
    } catch (error) {
      console.error('Failed to load tree data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirm = () => {
    if (selectedNode) {
      onSelect(selectedNode)
      onOpenChange(false)
      setSelectedNode(null)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
    setSelectedNode(null)
    setKeyword('')
    setSubjectType('all')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>連結科目を選択</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search" className="text-sm font-medium mb-2 block">
                キーワード検索
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="コード・名称で検索"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="type-filter" className="text-sm font-medium mb-2 block">
                科目タイプ
              </Label>
              <Select value={subjectType} onValueChange={setSubjectType}>
                <SelectTrigger id="type-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全て</SelectItem>
                  <SelectItem value="FIN">FIN</SelectItem>
                  <SelectItem value="KPI">KPI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {recommendedType && (
            <div className="text-sm text-muted-foreground bg-accent/50 p-2 rounded-md">
              <span className="font-medium">推奨:</span> {recommendedType}科目（★マーク付き）
            </div>
          )}

          <ScrollArea className="h-[400px] border rounded-md p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                読み込み中...
              </div>
            ) : treeData ? (
              <div className="space-y-6">
                {treeData.nodes.length > 0 && (
                  <div>
                    <div className="text-sm font-semibold mb-2 text-muted-foreground">
                      階層構造
                    </div>
                    <GroupSubjectSelectTree
                      nodes={treeData.nodes}
                      selectedId={selectedNode?.id || null}
                      onSelect={setSelectedNode}
                    />
                  </div>
                )}

                {treeData.unassigned.length > 0 && (
                  <div>
                    <div className="text-sm font-semibold mb-2 text-muted-foreground">
                      未割当科目
                    </div>
                    <GroupSubjectSelectTree
                      nodes={treeData.unassigned}
                      selectedId={selectedNode?.id || null}
                      onSelect={setSelectedNode}
                    />
                  </div>
                )}

                {treeData.nodes.length === 0 && treeData.unassigned.length === 0 && (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    該当する連結科目が見つかりません
                  </div>
                )}
              </div>
            ) : null}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            キャンセル
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedNode}>
            選択
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

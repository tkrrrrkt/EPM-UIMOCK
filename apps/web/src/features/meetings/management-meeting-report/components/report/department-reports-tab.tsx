'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronRight,
  ChevronDown,
  CheckCircle,
  Clock,
  FileText,
  FileEdit,
  Eye,
  Building2,
  Users,
  Mail,
} from 'lucide-react'
import { Button } from '@/shared/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/components/card'
import { Badge } from '@/shared/ui/components/badge'
import { Skeleton } from '@/shared/ui/components/skeleton'
import { ScrollArea } from '@/shared/ui/components/scroll-area'
import { cn } from '@/lib/utils'
import type { BffClient, OrgNodeWithSubmission } from '../../api/bff-client'
import type {
  MeetingSubmissionDto,
  SubmissionStatus,
} from '@epm/contracts/bff/meetings'
import { SubmissionStatusLabel } from '@epm/contracts/bff/meetings'

interface DepartmentReportsTabProps {
  client: BffClient
  eventId: string
}

// ツリーノードコンポーネント
interface TreeNodeProps {
  node: OrgNodeWithSubmission
  level: number
  onSelect: (node: OrgNodeWithSubmission) => void
  selectedId: string | null
}

function TreeNode({ node, level, onSelect, selectedId }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2) // 最初の2階層は展開
  const hasChildren = node.children && node.children.length > 0
  const isSelected = selectedId === node.id
  const isReportingTarget = node.isReportingTarget

  const getStatusIcon = (status?: SubmissionStatus) => {
    if (!status) return null
    switch (status) {
      case 'SUBMITTED':
        return <CheckCircle className="h-3.5 w-3.5 text-success" />
      case 'DRAFT':
        return <Clock className="h-3.5 w-3.5 text-warning" />
      case 'NOT_STARTED':
        return <FileText className="h-3.5 w-3.5 text-muted-foreground" />
      default:
        return null
    }
  }

  return (
    <div>
      <Button
        variant="ghost"
        className={cn(
          'w-full justify-start gap-2 h-10 px-2 hover:bg-muted/50 font-normal',
          isSelected && 'bg-primary/10 border border-primary/20',
          !isReportingTarget && 'opacity-50'
        )}
        style={{ paddingLeft: `${level * 1.25 + 0.5}rem` }}
        onClick={() => {
          if (hasChildren) {
            setIsExpanded(!isExpanded)
          }
          if (isReportingTarget) {
            onSelect(node)
          }
        }}
        disabled={!isReportingTarget && !hasChildren}
      >
        {/* 展開/折りたたみアイコン */}
        {hasChildren ? (
          isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          )
        ) : (
          <div className="w-4" />
        )}

        {/* 組織アイコン */}
        <Building2 className={cn(
          'h-4 w-4 shrink-0',
          isReportingTarget ? 'text-primary' : 'text-muted-foreground'
        )} />

        {/* 組織名 */}
        <span className={cn(
          'truncate text-sm flex-1 text-left',
          !isReportingTarget && 'text-muted-foreground'
        )}>
          {node.name}
        </span>

        {/* 報告対象バッジ */}
        {isReportingTarget && (
          <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 shrink-0">
            {node.submissionLevel === 'BU' ? '事業部' : '部門'}
          </Badge>
        )}

        {/* 提出ステータスアイコン */}
        {isReportingTarget && node.submissionStatus && (
          <span className="shrink-0">{getStatusIcon(node.submissionStatus)}</span>
        )}
      </Button>

      {/* 子ノード */}
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function DepartmentReportsTab({ client, eventId }: DepartmentReportsTabProps) {
  const router = useRouter()
  const [orgTree, setOrgTree] = useState<OrgNodeWithSubmission[]>([])
  const [selectedNode, setSelectedNode] = useState<OrgNodeWithSubmission | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<MeetingSubmissionDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingSubmission, setLoadingSubmission] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const treeData = await client.getOrgTreeWithSubmission(eventId)
      setOrgTree(treeData)

      // 最初の報告対象部門を自動選択
      const firstTarget = findFirstReportingTarget(treeData)
      if (firstTarget) {
        setSelectedNode(firstTarget)
      }
    } catch (error) {
      console.error('Failed to fetch org tree:', error)
    } finally {
      setLoading(false)
    }
  }, [client, eventId])

  // 最初の報告対象を探す
  const findFirstReportingTarget = (nodes: OrgNodeWithSubmission[]): OrgNodeWithSubmission | null => {
    for (const node of nodes) {
      if (node.isReportingTarget) {
        return node
      }
      if (node.children) {
        const found = findFirstReportingTarget(node.children)
        if (found) return found
      }
    }
    return null
  }

  // 報告対象の統計を計算
  const calculateStats = (nodes: OrgNodeWithSubmission[]): { total: number; submitted: number; draft: number; notStarted: number } => {
    let stats = { total: 0, submitted: 0, draft: 0, notStarted: 0 }

    for (const node of nodes) {
      if (node.isReportingTarget) {
        stats.total++
        if (node.submissionStatus === 'SUBMITTED') stats.submitted++
        else if (node.submissionStatus === 'DRAFT') stats.draft++
        else stats.notStarted++
      }
      if (node.children) {
        const childStats = calculateStats(node.children)
        stats.total += childStats.total
        stats.submitted += childStats.submitted
        stats.draft += childStats.draft
        stats.notStarted += childStats.notStarted
      }
    }
    return stats
  }

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // 選択ノードが変わったら報告内容を取得
  useEffect(() => {
    if (selectedNode && selectedNode.isReportingTarget) {
      loadSubmission(selectedNode.id)
    }
  }, [selectedNode])

  const loadSubmission = async (departmentStableId: string) => {
    setLoadingSubmission(true)
    try {
      const submission = await client.getSubmission(eventId, departmentStableId)
      setSelectedSubmission(submission)
    } catch (error) {
      console.error('Failed to fetch submission:', error)
      setSelectedSubmission(null)
    } finally {
      setLoadingSubmission(false)
    }
  }

  const handleEditSubmission = () => {
    if (selectedNode) {
      router.push(`/meetings/management-meeting-report/${eventId}/submit/${selectedNode.id}`)
    }
  }

  const handleSelectNode = (node: OrgNodeWithSubmission) => {
    setSelectedNode(node)
  }

  const getStatusBadge = (status?: SubmissionStatus) => {
    if (!status) return null
    switch (status) {
      case 'SUBMITTED':
        return (
          <Badge className="bg-success/10 text-success border-success/20">
            {SubmissionStatusLabel.SUBMITTED}
          </Badge>
        )
      case 'DRAFT':
        return (
          <Badge className="bg-warning/10 text-warning border-warning/20">
            {SubmissionStatusLabel.DRAFT}
          </Badge>
        )
      case 'NOT_STARTED':
        return (
          <Badge variant="secondary">
            {SubmissionStatusLabel.NOT_STARTED}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // 報告内容をセクション別にグループ化
  const groupedValues = selectedSubmission?.values.reduce((acc, value) => {
    const section = value.sectionName || '未分類'
    if (!acc[section]) {
      acc[section] = []
    }
    acc[section].push(value)
    return acc
  }, {} as Record<string, typeof selectedSubmission.values>) || {}

  const stats = calculateStats(orgTree)

  if (loading) {
    return (
      <div className="flex h-full">
        <div className="w-80 border-r p-4">
          <Skeleton className="h-8 w-full mb-4" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* 左パネル: 組織ツリー */}
      <div className="w-80 border-r flex flex-col">
        {/* サマリー */}
        <div className="p-4 border-b bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">提出状況</span>
            <span className="text-lg font-bold">
              {stats.submitted} / {stats.total}
            </span>
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-success" />
              {stats.submitted}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-warning" />
              {stats.draft}
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3 text-muted-foreground" />
              {stats.notStarted}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            ※ グレーアウトは報告対象外の部門
          </p>
        </div>

        {/* 組織ツリー */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {orgTree.map((node) => (
              <TreeNode
                key={node.id}
                node={node}
                level={0}
                onSelect={handleSelectNode}
                selectedId={selectedNode?.id ?? null}
              />
            ))}

            {orgTree.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>組織データがありません</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* 右パネル: 報告内容 */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedNode ? (
          <>
            {/* ヘッダー */}
            <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {selectedNode.name}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  {getStatusBadge(selectedNode.submissionStatus)}
                  {selectedNode.submittedByName && (
                    <span className="text-sm text-muted-foreground">
                      提出: {selectedNode.submittedByName}
                    </span>
                  )}
                  {selectedNode.submittedAt && (
                    <span className="text-sm text-muted-foreground">
                      {formatDate(selectedNode.submittedAt)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedNode.submissionStatus !== 'SUBMITTED' && (
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    催促
                  </Button>
                )}
                <Button size="sm" onClick={handleEditSubmission}>
                  {selectedNode.submissionStatus === 'SUBMITTED' ? (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      詳細
                    </>
                  ) : (
                    <>
                      <FileEdit className="h-4 w-4 mr-2" />
                      編集
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* 報告内容 */}
            <ScrollArea className="flex-1">
              <div className="p-6">
                {loadingSubmission ? (
                  <div className="space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : selectedNode.submissionStatus === 'NOT_STARTED' ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">
                      報告が登録されていません
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      この部門はまだ報告を開始していません
                    </p>
                    <Button className="mt-4" onClick={handleEditSubmission}>
                      <FileEdit className="h-4 w-4 mr-2" />
                      報告を作成
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedValues).map(([sectionName, values]) => (
                      <Card key={sectionName}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">{sectionName}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {values.map((value) => (
                            <div key={value.id || value.fieldId}>
                              <div className="text-sm font-medium text-muted-foreground mb-1">
                                {value.fieldName}
                                {value.isRequired && <span className="text-destructive ml-1">*</span>}
                              </div>
                              <div className="text-sm">
                                {value.valueText || value.valueNumber || value.valueDate || (
                                  <span className="text-muted-foreground italic">未入力</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ))}

                    {Object.keys(groupedValues).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>入力データがありません</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Building2 className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p>左側から報告対象の部門を選択してください</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Save, Plus, Trash2, FileText, Users, CheckSquare, Paperclip, File } from 'lucide-react'
import { Button } from '@/shared/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/components/card'
import { Input } from '@/shared/ui/components/input'
import { Textarea } from '@/shared/ui/components/textarea'
import { Label } from '@/shared/ui/components/label'
import { Badge } from '@/shared/ui/components/badge'
import { useToast } from '@/hooks/use-toast'
import type { BffClient } from '../../api/bff-client'
import type { MeetingEventDto, MeetingMinutesDto, AttachmentDto } from '@epm/contracts/bff/meetings'

interface MinutesFormPageProps {
  bffClient: BffClient
  eventId: string
  onBack: () => void
  onSaveComplete?: (minutes: MeetingMinutesDto) => void
}

export function MinutesFormPage({
  bffClient,
  eventId,
  onBack,
  onSaveComplete,
}: MinutesFormPageProps) {
  const { toast } = useToast()
  const [event, setEvent] = useState<MeetingEventDto | null>(null)
  const [minutes, setMinutes] = useState<MeetingMinutesDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [content, setContent] = useState('')
  const [decisions, setDecisions] = useState<string[]>([''])
  const [attendees, setAttendees] = useState<string[]>([''])

  useEffect(() => {
    loadData()
  }, [eventId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [eventData, minutesData] = await Promise.all([
        bffClient.getEventById(eventId),
        bffClient.getMinutes(eventId),
      ])
      setEvent(eventData)
      setMinutes(minutesData)

      // Initialize form with existing data
      if (minutesData) {
        setContent(minutesData.content || '')
        setDecisions(minutesData.decisions.length > 0 ? minutesData.decisions : [''])
        setAttendees(minutesData.attendees.length > 0 ? minutesData.attendees : [''])
      }
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'データの取得に失敗しました',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddDecision = () => {
    setDecisions([...decisions, ''])
  }

  const handleRemoveDecision = (index: number) => {
    if (decisions.length === 1) return
    setDecisions(decisions.filter((_, i) => i !== index))
  }

  const handleDecisionChange = (index: number, value: string) => {
    const newDecisions = [...decisions]
    newDecisions[index] = value
    setDecisions(newDecisions)
  }

  const handleAddAttendee = () => {
    setAttendees([...attendees, ''])
  }

  const handleRemoveAttendee = (index: number) => {
    if (attendees.length === 1) return
    setAttendees(attendees.filter((_, i) => i !== index))
  }

  const handleAttendeeChange = (index: number, value: string) => {
    const newAttendees = [...attendees]
    newAttendees[index] = value
    setAttendees(newAttendees)
  }

  const handleSave = async () => {
    // Filter out empty entries
    const filteredDecisions = decisions.filter((d) => d.trim() !== '')
    const filteredAttendees = attendees.filter((a) => a.trim() !== '')

    if (!content.trim()) {
      toast({
        title: '入力エラー',
        description: '議事録本文を入力してください',
        variant: 'destructive',
      })
      return
    }

    if (filteredDecisions.length === 0) {
      toast({
        title: '入力エラー',
        description: '決定事項を1つ以上入力してください',
        variant: 'destructive',
      })
      return
    }

    if (filteredAttendees.length === 0) {
      toast({
        title: '入力エラー',
        description: '出席者を1名以上入力してください',
        variant: 'destructive',
      })
      return
    }

    try {
      setSaving(true)
      const result = await bffClient.saveMinutes(eventId, {
        content,
        decisions: filteredDecisions,
        attendees: filteredAttendees,
      })

      toast({
        title: '保存しました',
        description: '議事録が正常に保存されました',
      })

      setMinutes(result)
      onSaveComplete?.(result)
    } catch (error) {
      toast({
        title: 'エラー',
        description: '議事録の保存に失敗しました',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">議事録登録</h1>
          <p className="text-muted-foreground">
            {event?.eventName}の議事録を作成します
          </p>
        </div>
      </div>

      {/* Event Info */}
      {event && (
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">会議日: </span>
                <span className="font-medium">{formatDate(event.meetingDate)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">種別: </span>
                <span className="font-medium">{event.meetingTypeName}</span>
              </div>
              {minutes?.updatedAt && (
                <div>
                  <span className="text-muted-foreground">最終更新: </span>
                  <span className="font-medium">
                    {formatDate(minutes.updatedAt)} by {minutes.updatedBy || '-'}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            議事録本文
            <Badge variant="secondary" className="ml-1">必須</Badge>
          </CardTitle>
          <CardDescription>
            会議の議事内容を記録します
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="本日の経営会議では以下の事項について議論しました...&#10;&#10;1. 業績報告&#10;2. 新規事業の進捗&#10;3. 来期予算について"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="resize-y min-h-[200px]"
          />
          <p className="text-xs text-muted-foreground mt-2">
            ※ 将来的にリッチテキストエディタに置き換え予定
          </p>
        </CardContent>
      </Card>

      {/* Decisions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            決定事項
            <Badge variant="secondary" className="ml-1">必須</Badge>
          </CardTitle>
          <CardDescription>
            会議で決定した事項を記録します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {decisions.map((decision, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-muted-foreground font-mono w-6">{index + 1}.</span>
              <Input
                placeholder="決定事項を入力..."
                value={decision}
                onChange={(e) => handleDecisionChange(index, e.target.value)}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveDecision(index)}
                disabled={decisions.length === 1}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddDecision}
            className="w-full mt-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            決定事項を追加
          </Button>
        </CardContent>
      </Card>

      {/* Attendees Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            出席者
            <Badge variant="secondary" className="ml-1">必須</Badge>
          </CardTitle>
          <CardDescription>
            会議に参加した出席者を記録します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {attendees.map((attendee, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                placeholder="出席者名を入力..."
                value={attendee}
                onChange={(e) => handleAttendeeChange(index, e.target.value)}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveAttendee(index)}
                disabled={attendees.length === 1}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddAttendee}
            className="w-full mt-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            出席者を追加
          </Button>
        </CardContent>
      </Card>

      {/* Attachments Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paperclip className="h-5 w-5" />
            添付ファイル
          </CardTitle>
          <CardDescription>
            会議資料や関連ドキュメントを添付します
          </CardDescription>
        </CardHeader>
        <CardContent>
          {minutes?.attachments && minutes.attachments.length > 0 ? (
            <div className="space-y-2">
              {minutes.attachments.map((attachment: AttachmentDto) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <File className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{attachment.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(attachment.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Paperclip className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                添付ファイルはまだありません
              </p>
              <Button variant="outline" size="sm" className="mt-3" disabled>
                ファイルを選択
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                ※ ファイルアップロードは将来実装予定
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer Actions */}
      <div className="flex justify-between items-center pt-4 border-t sticky bottom-0 bg-background pb-4">
        <Button variant="outline" onClick={onBack}>
          キャンセル
        </Button>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? '保存中...' : '保存'}
        </Button>
      </div>
    </div>
  )
}

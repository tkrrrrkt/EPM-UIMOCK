"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button, Card, CardContent, CardHeader, CardTitle, Skeleton, useToast } from "@/shared/ui"
import { MockBffClient } from "../../api/mock-bff-client"
import { StrategyThemeTree } from "../strategy-theme-tree"
import { CreateThemeDialog } from "../dialogs/create-theme-dialog"
import { EditThemeDialog } from "../dialogs/edit-theme-dialog"
import type { BffMtpEventDetailResponse, BffStrategyThemeSummary } from "@epm/contracts/bff/mtp"

const bffClient = new MockBffClient()

interface MtpStrategyTabProps {
  eventId: string
  event: BffMtpEventDetailResponse
}

export function MtpStrategyTab({ eventId, event }: MtpStrategyTabProps) {
  const [themes, setThemes] = useState<BffStrategyThemeSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState<BffStrategyThemeSummary | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadThemes()
  }, [eventId])

  async function loadThemes() {
    try {
      setLoading(true)
      const data = await bffClient.listThemes(eventId)
      setThemes(data.themes)
    } catch (error) {
      toast({
        title: "エラー",
        description: "戦略テーマの読み込みに失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  function handleEditTheme(theme: BffStrategyThemeSummary) {
    setSelectedTheme(theme)
    setEditDialogOpen(true)
  }

  async function handleDeleteTheme(themeId: string) {
    try {
      await bffClient.deleteTheme(eventId, themeId)
      toast({
        title: "削除完了",
        description: "戦略テーマを削除しました",
      })
      loadThemes()
    } catch (error) {
      const errorMessage =
        error instanceof Error && error.message === "MTP_THEME_HAS_CHILDREN"
          ? "子テーマが存在するため削除できません"
          : "戦略テーマの削除に失敗しました"
      toast({
        title: "エラー",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>戦略テーマ</CardTitle>
            <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              新規作成
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">全社戦略テーマと事業部別テーマを管理</p>
        </CardHeader>
        <CardContent>
          {themes.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">戦略テーマが登録されていません</div>
          ) : (
            <StrategyThemeTree
              themes={themes}
              eventStatus={event.status}
              onEdit={handleEditTheme}
              onDelete={handleDeleteTheme}
            />
          )}
        </CardContent>
      </Card>

      <CreateThemeDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        eventId={eventId}
        dimensionValues={event.dimensionValues}
        themes={themes}
        onSuccess={loadThemes}
      />

      {selectedTheme && (
        <EditThemeDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          eventId={eventId}
          theme={selectedTheme}
          dimensionValues={event.dimensionValues}
          onSuccess={loadThemes}
        />
      )}
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Alert,
  AlertDescription,
  Badge,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui"
import { bffClient } from "../../api/client"
import { getErrorMessage } from "../../lib/error-messages"
import { LAYOUT_TYPE_LABELS } from "../../lib/layout-type-labels"
import { LineListTable } from "../../components/LineListTable"
import { LayoutPreview } from "../../components/LayoutPreview"
import { LineDialog } from "../../components/LineDialog"
import { CopyLayoutDialog } from "../../components/CopyLayoutDialog"
import type {
  BffLayoutDetailResponse,
  BffLineSummary,
  LayoutType,
} from "@epm/contracts/bff/report-layout"

export default function LayoutDetailPage() {
  const router = useRouter()
  const params = useParams()
  const layoutId = params.id as string

  const [layout, setLayout] = useState<BffLayoutDetailResponse | null>(null)
  const [lines, setLines] = useState<BffLineSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Edit form state
  const [editLayoutCode, setEditLayoutCode] = useState("")
  const [editLayoutName, setEditLayoutName] = useState("")
  const [editLayoutType, setEditLayoutType] = useState<LayoutType>("PL")

  // Dialogs
  const [lineDialogOpen, setLineDialogOpen] = useState(false)
  const [editingLineId, setEditingLineId] = useState<string | null>(null)
  const [showDeleteLineDialog, setShowDeleteLineDialog] = useState(false)
  const [deletingLine, setDeletingLine] = useState<BffLineSummary | null>(null)
  const [showCopyDialog, setShowCopyDialog] = useState(false)
  const [showTypeChangeWarning, setShowTypeChangeWarning] = useState(false)
  const [pendingLayoutType, setPendingLayoutType] = useState<LayoutType | null>(null)

  useEffect(() => {
    loadLayout()
    loadLines()
  }, [layoutId])

  const loadLayout = async () => {
    setLoading(true)
    setError(null)
    try {
      const layoutData = await bffClient.getLayoutDetail(layoutId)
      setLayout(layoutData)
      setEditLayoutCode(layoutData.layoutCode)
      setEditLayoutName(layoutData.layoutName)
      setEditLayoutType(layoutData.layoutType)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const loadLines = async () => {
    try {
      const linesData = await bffClient.getLines(layoutId)
      setLines(linesData.items)
    } catch (err) {
      console.error("[v0] Failed to load lines:", err)
    }
  }

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const handleSaveLayout = async () => {
    if (!layout) return
    setError(null)
    setIsSaving(true)

    try {
      // Check if layout type changed
      if (editLayoutType !== layout.layoutType && lines.length > 0) {
        setPendingLayoutType(editLayoutType)
        setShowTypeChangeWarning(true)
        setIsSaving(false)
        return
      }

      await saveLayoutChanges(editLayoutType)
    } catch (err) {
      setError(getErrorMessage(err))
      setIsSaving(false)
    }
  }

  const saveLayoutChanges = async (layoutType: LayoutType) => {
    try {
      await bffClient.updateLayout(layoutId, {
        layoutCode: editLayoutCode,
        layoutName: editLayoutName,
        layoutType,
      })
      await loadLayout()
      await loadLines()
      setEditMode(false)
      showSuccess("レイアウトを保存しました")
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  const handleTypeChangeConfirm = async () => {
    if (!pendingLayoutType) return
    setShowTypeChangeWarning(false)
    setIsSaving(true)
    await saveLayoutChanges(pendingLayoutType)
    setPendingLayoutType(null)
  }

  const handleDeactivate = async () => {
    setError(null)
    try {
      await bffClient.deactivateLayout(layoutId)
      await loadLayout()
      showSuccess("レイアウトを無効化しました")
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const handleReactivate = async () => {
    setError(null)
    try {
      await bffClient.reactivateLayout(layoutId)
      await loadLayout()
      showSuccess("レイアウトを有効化しました")
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const handleAddLine = () => {
    setEditingLineId(null)
    setLineDialogOpen(true)
  }

  const handleEditLine = (lineId: string) => {
    setEditingLineId(lineId)
    setLineDialogOpen(true)
  }

  const handleDeleteLineClick = (lineId: string) => {
    const line = lines.find((l) => l.id === lineId)
    if (line) {
      setDeletingLine(line)
      setShowDeleteLineDialog(true)
    }
  }

  const handleDeleteLineConfirm = async () => {
    if (!deletingLine) return
    setError(null)
    try {
      await bffClient.deleteLine(deletingLine.id)
      await loadLines()
      setShowDeleteLineDialog(false)
      setDeletingLine(null)
      showSuccess("行を削除しました")
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const handleLineDialogSuccess = () => {
    setLineDialogOpen(false)
    setEditingLineId(null)
    loadLines()
    showSuccess(editingLineId ? "行を更新しました" : "行を追加しました")
  }

  const handleLineMove = async (lineId: string, targetLineNo: number) => {
    setError(null)
    try {
      const result = await bffClient.moveLine(lineId, { targetLineNo })
      setLines(result.items)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const handleCopySuccess = (newLayoutId: string) => {
    setShowCopyDialog(false)
    router.push(`/master-data/report-layout/${newLayoutId}`)
  }

  const cancelEdit = () => {
    if (layout) {
      setEditLayoutCode(layout.layoutCode)
      setEditLayoutName(layout.layoutName)
      setEditLayoutType(layout.layoutType)
    }
    setEditMode(false)
    setError(null)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12 text-muted-foreground">読み込み中...</div>
      </div>
    )
  }

  if (!layout) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertDescription>{error || "レイアウトが見つかりません"}</AlertDescription>
        </Alert>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/master-data/report-layout")}>
          一覧に戻る
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="sm" onClick={() => router.push("/master-data/report-layout")}>
                ← 一覧に戻る
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{layout.layoutName}</h1>
              <Badge variant="outline">{LAYOUT_TYPE_LABELS[layout.layoutType]}</Badge>
              {!layout.isActive && <Badge variant="secondary">無効</Badge>}
            </div>
            <p className="text-muted-foreground font-mono">{layout.layoutCode}</p>
            {layout.companyName && (
              <p className="text-sm text-muted-foreground">{layout.companyName}</p>
            )}
          </div>
          <div className="flex gap-2">
            {!editMode ? (
              <>
                <Button variant="outline" onClick={() => setShowCopyDialog(true)}>
                  複製
                </Button>
                {layout.isActive ? (
                  <Button variant="outline" onClick={handleDeactivate}>
                    無効化
                  </Button>
                ) : (
                  <Button variant="outline" onClick={handleReactivate}>
                    有効化
                  </Button>
                )}
                <Button onClick={() => setEditMode(true)}>編集</Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={cancelEdit}>
                  キャンセル
                </Button>
                <Button onClick={handleSaveLayout} disabled={isSaving}>
                  {isSaving ? "保存中..." : "保存"}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {successMessage && (
          <Alert>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Layout Info */}
        <Card>
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
          </CardHeader>
          <CardContent>
            {editMode ? (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">レイアウトコード</label>
                  <Input
                    value={editLayoutCode}
                    onChange={(e) => setEditLayoutCode(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">レイアウト名</label>
                  <Input
                    value={editLayoutName}
                    onChange={(e) => setEditLayoutName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">レイアウト種別</label>
                  <Select value={editLayoutType} onValueChange={(v) => setEditLayoutType(v as LayoutType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PL">{LAYOUT_TYPE_LABELS.PL}</SelectItem>
                      <SelectItem value="BS">{LAYOUT_TYPE_LABELS.BS}</SelectItem>
                      <SelectItem value="KPI">{LAYOUT_TYPE_LABELS.KPI}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">レイアウトコード</span>
                  <p className="font-mono">{layout.layoutCode}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">レイアウト名</span>
                  <p>{layout.layoutName}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">レイアウト種別</span>
                  <p>{LAYOUT_TYPE_LABELS[layout.layoutType]}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">会社名</span>
                  <p>{layout.companyName || "全社共通"}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs: Lines & Preview */}
        <Tabs defaultValue="lines">
          <TabsList>
            <TabsTrigger value="lines">行一覧</TabsTrigger>
            <TabsTrigger value="preview">プレビュー</TabsTrigger>
          </TabsList>

          <TabsContent value="lines">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>行一覧（{lines.length}行）</CardTitle>
                <Button onClick={handleAddLine}>行追加</Button>
              </CardHeader>
              <CardContent>
                <LineListTable
                  lines={lines}
                  onEdit={handleEditLine}
                  onDelete={handleDeleteLineClick}
                  onMove={handleLineMove}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>レイアウトプレビュー</CardTitle>
              </CardHeader>
              <CardContent>
                <LayoutPreview lines={lines} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Line Dialog */}
      <LineDialog
        open={lineDialogOpen}
        onOpenChange={setLineDialogOpen}
        layoutId={layoutId}
        layoutType={layout.layoutType}
        lineId={editingLineId}
        onSuccess={handleLineDialogSuccess}
      />

      {/* Delete Line Confirmation */}
      <AlertDialog open={showDeleteLineDialog} onOpenChange={setShowDeleteLineDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>行の削除</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingLine?.lineType === "account" && deletingLine?.subjectName
                ? `科目「${deletingLine.subjectName}」を削除してもよろしいですか？`
                : "この行を削除してもよろしいですか？"}
              この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLineConfirm}>削除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Copy Layout Dialog */}
      <CopyLayoutDialog
        open={showCopyDialog}
        onOpenChange={setShowCopyDialog}
        layoutId={layoutId}
        originalLayoutCode={layout.layoutCode}
        originalLayoutName={layout.layoutName}
        onSuccess={handleCopySuccess}
      />

      {/* Layout Type Change Warning */}
      <AlertDialog open={showTypeChangeWarning} onOpenChange={setShowTypeChangeWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>レイアウト種別の変更</AlertDialogTitle>
            <AlertDialogDescription>
              レイアウト種別を変更すると、既存の{lines.length}行はすべて削除されます。
              この操作は取り消せません。続行しますか？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingLayoutType(null)}>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleTypeChangeConfirm}>変更する</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

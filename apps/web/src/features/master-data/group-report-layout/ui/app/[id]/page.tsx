"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Alert,
  AlertDescription,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Input,
  Textarea,
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
import type {
  BffGroupLayoutDetailResponse,
  BffGroupLineSummary,
  LayoutType,
} from "@epm/contracts/bff/group-report-layout"
import { bffClient } from "../../api/client"
import { getErrorMessage } from "../../lib/error-messages"
import { LAYOUT_TYPE_LABELS, LAYOUT_TYPE_SHORT_LABELS } from "../../lib/layout-type-labels"
import { LineListTable } from "../../components/LineListTable"
import { LineDialog } from "../../components/LineDialog"
import { LayoutPreview } from "../../components/LayoutPreview"
import { CopyLayoutDialog } from "../../components/CopyLayoutDialog"

export default function GroupLayoutDetailPage() {
  const router = useRouter()
  const params = useParams()
  const layoutId = params.id as string

  const [layout, setLayout] = useState<BffGroupLayoutDetailResponse | null>(null)
  const [lines, setLines] = useState<BffGroupLineSummary[]>([])
  const [canEdit, setCanEdit] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Edit form state
  const [editLayoutCode, setEditLayoutCode] = useState("")
  const [editLayoutName, setEditLayoutName] = useState("")
  const [editLayoutNameShort, setEditLayoutNameShort] = useState("")
  const [editLayoutType, setEditLayoutType] = useState<LayoutType>("PL")
  const [editDescription, setEditDescription] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Dialogs
  const [showLineDialog, setShowLineDialog] = useState(false)
  const [editingLineId, setEditingLineId] = useState<string | null>(null)
  const [showDeleteLineDialog, setShowDeleteLineDialog] = useState(false)
  const [deletingLine, setDeletingLine] = useState<BffGroupLineSummary | null>(null)
  const [showCopyDialog, setShowCopyDialog] = useState(false)
  const [showTypeChangeWarning, setShowTypeChangeWarning] = useState(false)
  const [pendingLayoutType, setPendingLayoutType] = useState<LayoutType | null>(null)

  useEffect(() => {
    loadContext()
    loadLayout()
    loadLines()
  }, [layoutId])

  const loadContext = async () => {
    try {
      const context = await bffClient.getContext()
      setCanEdit(context.canEdit)
    } catch (err) {
      console.error("[v0] Failed to load context:", err)
    }
  }

  const loadLayout = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await bffClient.getLayoutDetail(layoutId)
      setLayout(response)
      setEditLayoutCode(response.layoutCode)
      setEditLayoutName(response.layoutName)
      setEditLayoutNameShort(response.layoutNameShort || "")
      setEditLayoutType(response.layoutType)
      setEditDescription(response.description || "")
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  const loadLines = async () => {
    try {
      const response = await bffClient.getLines(layoutId)
      setLines(response.items)
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
        layoutNameShort: editLayoutNameShort || undefined,
        description: editDescription || undefined,
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
    try {
      await bffClient.deactivateLayout(layoutId)
      await loadLayout()
      showSuccess("レイアウトを無効化しました")
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const handleReactivate = async () => {
    try {
      await bffClient.reactivateLayout(layoutId)
      await loadLayout()
      showSuccess("レイアウトを有効化しました")
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const handleSetDefault = async () => {
    try {
      await bffClient.setDefaultLayout(layoutId)
      await loadLayout()
      showSuccess("デフォルトに設定しました")
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const handleAddLine = () => {
    setEditingLineId(null)
    setShowLineDialog(true)
  }

  const handleEditLine = (line: BffGroupLineSummary) => {
    setEditingLineId(line.id)
    setShowLineDialog(true)
  }

  const handleDeleteLineClick = (line: BffGroupLineSummary) => {
    setDeletingLine(line)
    setShowDeleteLineDialog(true)
  }

  const handleDeleteLineConfirm = async () => {
    if (!deletingLine) return
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
    setShowLineDialog(false)
    loadLines()
    showSuccess(editingLineId ? "行を更新しました" : "行を追加しました")
  }

  const handleCopySuccess = (newLayoutId: string) => {
    setShowCopyDialog(false)
    router.push(`/master-data/group-report-layout/${newLayoutId}`)
  }

  const cancelEdit = () => {
    if (layout) {
      setEditLayoutCode(layout.layoutCode)
      setEditLayoutName(layout.layoutName)
      setEditLayoutNameShort(layout.layoutNameShort || "")
      setEditLayoutType(layout.layoutType)
      setEditDescription(layout.description || "")
    }
    setEditMode(false)
    setError(null)
  }

  if (isLoading) {
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
        <Button variant="outline" className="mt-4" onClick={() => router.push("/master-data/group-report-layout")}>
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
              <Button variant="ghost" size="sm" onClick={() => router.push("/master-data/group-report-layout")}>
                ← 一覧に戻る
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{layout.layoutName}</h1>
              <Badge variant="outline">{LAYOUT_TYPE_SHORT_LABELS[layout.layoutType]}</Badge>
              {layout.isDefault && <Badge variant="default">デフォルト</Badge>}
              {!layout.isActive && <Badge variant="secondary">無効</Badge>}
            </div>
            <p className="text-muted-foreground font-mono">{layout.layoutCode}</p>
          </div>
          {canEdit && (
            <div className="flex gap-2">
              {!editMode ? (
                <>
                  <Button variant="outline" onClick={() => setShowCopyDialog(true)}>
                    複製
                  </Button>
                  {layout.isActive && !layout.isDefault && (
                    <Button variant="outline" onClick={handleSetDefault}>
                      デフォルトに設定
                    </Button>
                  )}
                  {layout.isActive && !layout.isDefault ? (
                    <Button variant="outline" onClick={handleDeactivate}>
                      無効化
                    </Button>
                  ) : !layout.isActive ? (
                    <Button variant="outline" onClick={handleReactivate}>
                      有効化
                    </Button>
                  ) : null}
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
          )}
          {!canEdit && (
            <div className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
              参照モード
            </div>
          )}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">レイアウトコード</label>
                  <Input
                    value={editLayoutCode}
                    onChange={(e) => setEditLayoutCode(e.target.value)}
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
                <div>
                  <label className="text-sm font-medium mb-2 block">レイアウト名</label>
                  <Input
                    value={editLayoutName}
                    onChange={(e) => setEditLayoutName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">レイアウト名（短縮）</label>
                  <Input
                    value={editLayoutNameShort}
                    onChange={(e) => setEditLayoutNameShort(e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-2 block">説明</label>
                  <Textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">レイアウトコード</span>
                  <p className="font-mono">{layout.layoutCode}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">レイアウト種別</span>
                  <p>{LAYOUT_TYPE_LABELS[layout.layoutType]}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">レイアウト名</span>
                  <p>{layout.layoutName}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">レイアウト名（短縮）</span>
                  <p>{layout.layoutNameShort || "-"}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-muted-foreground">説明</span>
                  <p>{layout.description || "-"}</p>
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
                {canEdit && (
                  <Button onClick={handleAddLine}>行追加</Button>
                )}
              </CardHeader>
              <CardContent>
                <LineListTable
                  lines={lines}
                  canEdit={canEdit}
                  onEditLine={handleEditLine}
                  onDeleteLine={handleDeleteLineClick}
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
        open={showLineDialog}
        onOpenChange={setShowLineDialog}
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
              この行を削除してもよろしいですか？この操作は取り消せません。
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

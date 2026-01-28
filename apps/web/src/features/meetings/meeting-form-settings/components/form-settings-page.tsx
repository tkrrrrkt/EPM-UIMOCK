'use client'

import { useState, useEffect, useCallback } from 'react'
import type {
  FormSectionDto,
  FormFieldDto,
  CreateFormSectionDto,
  CreateFormFieldDto,
} from '../api/bff-client'
import { mockBffClient } from '../api/mock-bff-client'
import { Button, Skeleton } from '@/shared/ui'
import { ChevronLeft, Eye, Layers } from 'lucide-react'
import { toast } from 'sonner'
import { SectionTree } from './section-tree'
import { SectionDetailPanel } from './section-detail-panel'
import { FieldDetailPanel } from './field-detail-panel'
import { CreateSectionDialog } from './dialogs/create-section-dialog'
import { CreateFieldDialog } from './dialogs/create-field-dialog'
import { DeleteConfirmDialog } from './dialogs/delete-confirm-dialog'
import { FormPreviewSheet } from './preview/form-preview-sheet'

interface FormSettingsPageProps {
  meetingTypeId?: string
}

type Selection =
  | { type: 'none' }
  | { type: 'section'; section: FormSectionDto }
  | { type: 'field'; field: FormFieldDto; section: FormSectionDto }

export function FormSettingsPage({ meetingTypeId = 'mt-1' }: FormSettingsPageProps) {
  const [meetingTypeName, setMeetingTypeName] = useState<string>('')
  const [sections, setSections] = useState<FormSectionDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selection, setSelection] = useState<Selection>({ type: 'none' })

  // Dialog states
  const [isCreateSectionOpen, setIsCreateSectionOpen] = useState(false)
  const [isCreateFieldOpen, setIsCreateFieldOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [createFieldSectionId, setCreateFieldSectionId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'section' | 'field'
    id: string
    name: string
    fieldCount?: number
  } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [name, sectionsResult] = await Promise.all([
          mockBffClient.getMeetingTypeName(meetingTypeId),
          mockBffClient.getFormSections(meetingTypeId),
        ])
        setMeetingTypeName(name)
        setSections(sectionsResult.items)
      } catch {
        toast.error('データの読み込みに失敗しました')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [meetingTypeId])

  // Handlers
  const handleSelectSection = useCallback((section: FormSectionDto) => {
    setSelection({ type: 'section', section })
  }, [])

  const handleSelectField = useCallback((field: FormFieldDto, section: FormSectionDto) => {
    setSelection({ type: 'field', field, section })
  }, [])

  const handleAddSection = useCallback(() => {
    setIsCreateSectionOpen(true)
  }, [])

  const handleAddField = useCallback((sectionId: string) => {
    setCreateFieldSectionId(sectionId)
    setIsCreateFieldOpen(true)
  }, [])

  const handleCreateSection = async (data: Omit<CreateFormSectionDto, 'meetingTypeId'>) => {
    try {
      const newSection = await mockBffClient.createFormSection({
        ...data,
        meetingTypeId,
      })
      setSections((prev) => [...prev, newSection])
      toast.success('セクションを作成しました')
    } catch {
      toast.error('セクションの作成に失敗しました')
      throw new Error('Failed to create section')
    }
  }

  const handleCreateField = async (data: Omit<CreateFormFieldDto, 'sectionId'>) => {
    if (!createFieldSectionId) return
    try {
      await mockBffClient.createFormField({
        ...data,
        sectionId: createFieldSectionId,
      })
      // Refresh sections to update field count
      const sectionsResult = await mockBffClient.getFormSections(meetingTypeId)
      setSections(sectionsResult.items)
      // Trigger field refresh
      window.dispatchEvent(
        new CustomEvent('refreshFields', { detail: { sectionId: createFieldSectionId } })
      )
      toast.success('項目を作成しました')
    } catch {
      toast.error('項目の作成に失敗しました')
      throw new Error('Failed to create field')
    }
  }

  const handleUpdateSection = async (
    data: Parameters<typeof mockBffClient.updateFormSection>[1]
  ) => {
    if (selection.type !== 'section') return
    try {
      const updated = await mockBffClient.updateFormSection(selection.section.id, data)
      setSections((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
      setSelection({ type: 'section', section: updated })
      toast.success('セクションを保存しました')
    } catch {
      toast.error('セクションの保存に失敗しました')
      throw new Error('Failed to update section')
    }
  }

  const handleUpdateField = async (data: Parameters<typeof mockBffClient.updateFormField>[1]) => {
    if (selection.type !== 'field') return
    try {
      const updated = await mockBffClient.updateFormField(selection.field.id, data)
      setSelection({ type: 'field', field: updated, section: selection.section })
      // Trigger field refresh
      window.dispatchEvent(
        new CustomEvent('refreshFields', { detail: { sectionId: selection.section.id } })
      )
      toast.success('項目を保存しました')
    } catch {
      toast.error('項目の保存に失敗しました')
      throw new Error('Failed to update field')
    }
  }

  const handleDeleteSection = useCallback(() => {
    if (selection.type !== 'section') return
    setDeleteTarget({
      type: 'section',
      id: selection.section.id,
      name: selection.section.sectionName,
      fieldCount: selection.section.fieldCount,
    })
  }, [selection])

  const handleDeleteField = useCallback(() => {
    if (selection.type !== 'field') return
    setDeleteTarget({
      type: 'field',
      id: selection.field.id,
      name: selection.field.fieldName,
    })
  }, [selection])

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      if (deleteTarget.type === 'section') {
        await mockBffClient.deleteFormSection(deleteTarget.id)
        setSections((prev) => prev.filter((s) => s.id !== deleteTarget.id))
        toast.success('セクションを削除しました')
      } else {
        await mockBffClient.deleteFormField(deleteTarget.id)
        if (selection.type === 'field') {
          // Refresh sections to update field count
          const sectionsResult = await mockBffClient.getFormSections(meetingTypeId)
          setSections(sectionsResult.items)
          // Trigger field refresh
          window.dispatchEvent(
            new CustomEvent('refreshFields', { detail: { sectionId: selection.section.id } })
          )
        }
        toast.success('項目を削除しました')
      }
      setSelection({ type: 'none' })
      setDeleteTarget(null)
    } catch {
      toast.error('削除に失敗しました')
    } finally {
      setIsDeleting(false)
    }
  }

  const getDeleteDescription = () => {
    if (!deleteTarget) return ''
    if (deleteTarget.type === 'section') {
      if (deleteTarget.fieldCount && deleteTarget.fieldCount > 0) {
        return `このセクションには ${deleteTarget.fieldCount} 個の項目があります。\nセクションと項目をすべて削除しますか？\nこの操作は取り消せません。`
      }
      return `「${deleteTarget.name}」を削除しますか？\nこの操作は取り消せません。`
    }
    return `「${deleteTarget.name}」を削除しますか？\nこの操作は取り消せません。`
  }

  // Get section for create field dialog
  const createFieldSection = sections.find((s) => s.id === createFieldSectionId)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">戻る</span>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">報告フォーム設定</h1>
              <p className="text-sm text-muted-foreground">
                {isLoading ? (
                  <Skeleton className="h-4 w-32" />
                ) : (
                  `${meetingTypeName} のフォーム構成を設定してください`
                )}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => setIsPreviewOpen(true)}>
            <Eye className="mr-2 h-4 w-4" />
            プレビュー
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Pane - Section Tree */}
            <div className="lg:col-span-1">
              <SectionTree
                meetingTypeId={meetingTypeId}
                sections={sections}
                onSectionsChange={setSections}
                selectedSectionId={
                  selection.type === 'section'
                    ? selection.section.id
                    : selection.type === 'field'
                      ? selection.section.id
                      : null
                }
                selectedFieldId={selection.type === 'field' ? selection.field.id : null}
                onSelectSection={handleSelectSection}
                onSelectField={handleSelectField}
                onAddSection={handleAddSection}
                onAddField={handleAddField}
              />
            </div>

            {/* Right Pane - Detail Panel */}
            <div className="lg:col-span-2">
              {selection.type === 'none' && (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                  <div className="mb-4 rounded-full bg-muted p-3">
                    <Layers className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mb-1 font-medium">セクションまたは項目を選択してください</h3>
                  <p className="text-sm text-muted-foreground">
                    左のリストから編集したい項目を選択すると、
                    <br />
                    ここに詳細が表示されます
                  </p>
                </div>
              )}

              {selection.type === 'section' && (
                <SectionDetailPanel
                  section={selection.section}
                  onUpdate={handleUpdateSection}
                  onDelete={handleDeleteSection}
                />
              )}

              {selection.type === 'field' && (
                <FieldDetailPanel
                  field={selection.field}
                  onUpdate={handleUpdateField}
                  onDelete={handleDeleteField}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Dialogs */}
      <CreateSectionDialog
        open={isCreateSectionOpen}
        onOpenChange={setIsCreateSectionOpen}
        onSubmit={handleCreateSection}
      />

      <CreateFieldDialog
        open={isCreateFieldOpen}
        onOpenChange={(open) => {
          setIsCreateFieldOpen(open)
          if (!open) setCreateFieldSectionId(null)
        }}
        sectionName={createFieldSection?.sectionName ?? ''}
        onSubmit={handleCreateField}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={deleteTarget?.type === 'section' ? 'セクションの削除' : '項目の削除'}
        description={getDeleteDescription()}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      <FormPreviewSheet
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        meetingTypeName={meetingTypeName}
        sections={sections}
      />
    </div>
  )
}

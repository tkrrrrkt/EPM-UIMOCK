'use client'

import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Button,
  Skeleton,
  Badge,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/ui'
import { FormPreviewField } from './form-preview-field'
import { mockBffClient } from '../../api/mock-bff-client'
import type { FormSectionDto, FormFieldDto } from '../../api/bff-client'
import { cn } from '@/lib/utils'

interface FormPreviewSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  meetingTypeName: string
  sections: FormSectionDto[]
}

export function FormPreviewSheet({
  open,
  onOpenChange,
  meetingTypeName,
  sections,
}: FormPreviewSheetProps) {
  const [fieldsMap, setFieldsMap] = useState<Record<string, FormFieldDto[]>>({})
  const [loadingFields, setLoadingFields] = useState<Set<string>>(new Set())
  const [expandedSections, setExpandedSections] = useState<string[]>([])

  // Load fields for all active sections when sheet opens
  useEffect(() => {
    if (!open) return

    const activeSections = sections.filter((s) => s.isActive)
    const loadAllFields = async () => {
      const sectionIds = activeSections.map((s) => s.id)
      setLoadingFields(new Set(sectionIds))

      for (const section of activeSections) {
        try {
          const result = await mockBffClient.getFormFields(section.id)
          setFieldsMap((prev) => ({
            ...prev,
            [section.id]: result.items.filter((f) => f.isActive).sort((a, b) => a.sortOrder - b.sortOrder),
          }))
        } catch (error) {
          console.error(`Failed to load fields for section ${section.id}:`, error)
        } finally {
          setLoadingFields((prev) => {
            const next = new Set(prev)
            next.delete(section.id)
            return next
          })
        }
      }

      // Auto-expand all sections
      setExpandedSections(sectionIds)
    }

    loadAllFields()
  }, [open, sections])

  // Get only active sections sorted by sortOrder
  const activeSections = sections
    .filter((s) => s.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  const getInputScopeLabel = (scope: string) => {
    switch (scope) {
      case 'DEPARTMENT':
        return '部門'
      case 'BU':
        return '事業部'
      case 'COMPANY':
        return '全社'
      default:
        return scope
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>フォームプレビュー</SheetTitle>
          <SheetDescription>
            {meetingTypeName} の報告フォームのプレビューです。
            実際に部門担当者が入力する際の表示を確認できます。
          </SheetDescription>
        </SheetHeader>

        {activeSections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">
              アクティブなセクションがありません。
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              セクションを作成してアクティブにしてください。
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <Accordion
              type="multiple"
              value={expandedSections}
              onValueChange={setExpandedSections}
              className="w-full"
            >
              {activeSections.map((section) => (
                <AccordionItem
                  key={section.id}
                  value={section.id}
                  className="border rounded-lg px-4 mb-3"
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex flex-col items-start gap-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{section.sectionName}</span>
                        {section.isRequired && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                            必須
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {getInputScopeLabel(section.inputScope)}
                        </Badge>
                      </div>
                      {section.description && (
                        <p className="text-xs text-muted-foreground font-normal">
                          {section.description}
                        </p>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    {loadingFields.has(section.id) ? (
                      <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {fieldsMap[section.id]?.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-4 text-center">
                            このセクションには項目がありません
                          </p>
                        ) : (
                          fieldsMap[section.id]?.map((field) => (
                            <FormPreviewField key={field.id} field={field} />
                          ))
                        )}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Inactive sections notice */}
            {sections.some((s) => !s.isActive) && (
              <div className="rounded-lg border border-dashed border-muted-foreground/25 p-4 mt-6">
                <p className="text-sm text-muted-foreground">
                  非アクティブなセクションは表示されていません。
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  非アクティブ: {sections.filter((s) => !s.isActive).map((s) => s.sectionName).join(', ')}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 flex justify-end border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            閉じる
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

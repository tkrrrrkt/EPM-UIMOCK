'use client'

import { Button, Badge, ScrollArea, Separator } from '@/shared/ui'
import { Plus, Copy, Pencil } from 'lucide-react'
import type { BffVersionSummary } from '@epm/contracts/bff/organization-master'
import { cn } from '@/lib/utils'

interface VersionListProps {
  versions: BffVersionSummary[]
  selectedVersionId: string | null
  onSelectVersion: (id: string) => void
  onCreateVersion: () => void
  onCopyVersion: () => void
  onEditVersion: () => void
}

export function VersionList({
  versions,
  selectedVersionId,
  onSelectVersion,
  onCreateVersion,
  onCopyVersion,
  onEditVersion,
}: VersionListProps) {
  return (
    <div className="flex h-full flex-col border-r border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="text-lg font-semibold">組織バージョン</h2>
        <Button size="sm" onClick={onCreateVersion}>
          <Plus className="mr-1 h-4 w-4" />
          新規
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {versions.map((version) => (
            <button
              key={version.id}
              onClick={() => onSelectVersion(version.id)}
              className={cn(
                'w-full rounded-md p-3 text-left transition-colors hover:bg-accent',
                selectedVersionId === version.id && 'bg-accent'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{version.versionCode}</span>
                    {version.isCurrentlyEffective && (
                      <Badge variant="default" className="text-xs">
                        有効
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{version.versionName}</p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{version.effectiveDate}</span>
                    <span>{version.departmentCount}部門</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>

      {selectedVersionId && (
        <>
          <Separator />
          <div className="flex gap-2 p-4">
            <Button size="sm" variant="outline" onClick={onCopyVersion} className="flex-1 bg-transparent">
              <Copy className="mr-1 h-4 w-4" />
              コピー
            </Button>
            <Button size="sm" variant="outline" onClick={onEditVersion} className="flex-1 bg-transparent">
              <Pencil className="mr-1 h-4 w-4" />
              編集
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

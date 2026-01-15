'use client'

import { Building2, ChevronRight } from 'lucide-react'
import { Badge, Button, Card } from '@/shared/ui'
import type { BffCompanyTreeNode } from '@epm/contracts/bff/company-master'
import { CONSOLIDATION_TYPE_LABELS } from '../constants'
import { cn } from '@/lib/utils'

interface CompanyTreeProps {
  roots: BffCompanyTreeNode[]
  onSelectCompany: (id: string) => void
}

export function CompanyTree({ roots, onSelectCompany }: CompanyTreeProps) {
  if (roots.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground text-center">有効な法人がありません</p>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <div className="space-y-2">
        {roots.map((root) => (
          <TreeNode key={root.id} node={root} level={0} onSelectCompany={onSelectCompany} />
        ))}
      </div>
    </Card>
  )
}

interface TreeNodeProps {
  node: BffCompanyTreeNode
  level: number
  onSelectCompany: (id: string) => void
}

function TreeNode({ node, level, onSelectCompany }: TreeNodeProps) {
  const hasChildren = node.children.length > 0

  return (
    <div>
      <Button
        variant="ghost"
        className={cn('w-full justify-start gap-2 h-auto py-2', level > 0 && 'ml-6')}
        onClick={() => onSelectCompany(node.id)}
      >
        {level > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
        <Building2 className="h-4 w-4 text-primary flex-shrink-0" />
        <span className="font-medium text-sm">
          {node.companyCode} - {node.companyName}
        </span>
        <Badge variant="secondary" className="ml-auto">
          {CONSOLIDATION_TYPE_LABELS[node.consolidationType]}
        </Badge>
      </Button>
      {hasChildren && (
        <div className="space-y-1">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} level={level + 1} onSelectCompany={onSelectCompany} />
          ))}
        </div>
      )}
    </div>
  )
}

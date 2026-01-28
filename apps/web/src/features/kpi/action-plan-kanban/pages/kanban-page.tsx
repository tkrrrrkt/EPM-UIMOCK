'use client'

import { KanbanBoard } from '../components/kanban-board'

interface KanbanPageProps {
  planId: string
}

export default function KanbanPage({ planId }: KanbanPageProps) {
  return (
    <div className="h-screen flex flex-col">
      <KanbanBoard planId={planId} />
    </div>
  )
}

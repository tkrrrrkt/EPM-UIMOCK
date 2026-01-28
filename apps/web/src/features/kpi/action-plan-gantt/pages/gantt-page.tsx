'use client'

import { GanttChart } from '../components/gantt-chart'

interface GanttPageProps {
  planId: string
}

export default function GanttPage({ planId }: GanttPageProps) {
  return (
    <div className="h-screen flex flex-col">
      <GanttChart planId={planId} />
    </div>
  )
}

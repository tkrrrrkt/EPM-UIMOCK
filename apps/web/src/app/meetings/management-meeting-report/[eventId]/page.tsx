'use client'

import { use } from 'react'
import {
  ReportMainPage,
  MockBffClient,
} from '@/features/meetings/management-meeting-report'

const bffClient = new MockBffClient()

export default function MeetingsEventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = use(params)

  return (
    <div className="h-full">
      <ReportMainPage client={bffClient} eventId={eventId} />
    </div>
  )
}

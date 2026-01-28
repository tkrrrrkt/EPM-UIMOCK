'use client'

import { use } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  SubmissionFormPage,
  MockBffClient,
} from '@/features/meetings/management-meeting-report'

const bffClient = new MockBffClient()

export default function MeetingsSubmissionPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = use(params)
  const searchParams = useSearchParams()
  const departmentStableId = searchParams.get('dept') || 'dept-sales'

  return (
    <div className="h-full">
      <SubmissionFormPage
        client={bffClient}
        eventId={eventId}
        departmentStableId={departmentStableId}
      />
    </div>
  )
}

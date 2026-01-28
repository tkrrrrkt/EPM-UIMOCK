'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import {
  EventClosePage,
  MockBffClient,
} from '@/features/meetings/management-meeting-report'

const bffClient = new MockBffClient()

export default function MeetingsClosePage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = use(params)
  const router = useRouter()

  return (
    <div className="p-6">
      <EventClosePage
        bffClient={bffClient}
        eventId={eventId}
        onBack={() => router.push(`/meetings/management-meeting-report/${eventId}`)}
        onCloseComplete={() => router.push(`/meetings/management-meeting-report/${eventId}`)}
      />
    </div>
  )
}

'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import {
  MinutesFormPage,
  MockBffClient,
} from '@/features/meetings/management-meeting-report'

const bffClient = new MockBffClient()

export default function MeetingsMinutesPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = use(params)
  const router = useRouter()

  return (
    <div className="p-6">
      <MinutesFormPage
        bffClient={bffClient}
        eventId={eventId}
        onBack={() => router.push(`/meetings/management-meeting-report/${eventId}`)}
        onSaveComplete={() => router.push(`/meetings/management-meeting-report/${eventId}`)}
      />
    </div>
  )
}

'use client'

import {
  EventCreateWizard,
  MockBffClient,
} from '@/features/meetings/management-meeting-report'

const bffClient = new MockBffClient()

export default function MeetingsEventCreatePage() {
  return (
    <div className="h-full">
      <EventCreateWizard client={bffClient} />
    </div>
  )
}

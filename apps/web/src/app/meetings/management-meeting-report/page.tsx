'use client'

import {
  EventListPage,
  MockBffClient,
} from '@/features/meetings/management-meeting-report'

const bffClient = new MockBffClient()

export default function MeetingsEventListPage() {
  return (
    <div className="h-full">
      <EventListPage client={bffClient} />
    </div>
  )
}

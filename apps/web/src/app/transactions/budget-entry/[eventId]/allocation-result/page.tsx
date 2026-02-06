'use client'

import { use } from 'react'
import { BudgetAllocationResultPage } from '@/features/transactions/budget-entry/ui/BudgetAllocationResultPage'

interface PageProps {
  params: Promise<{
    eventId: string
  }>
}

export default function Page({ params }: PageProps) {
  const { eventId } = use(params)
  return <BudgetAllocationResultPage planEventId={eventId} />
}

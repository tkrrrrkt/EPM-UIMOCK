'use client'

import { useRouter } from 'next/navigation'
import { KpiListPage as KpiListPageComponent } from '../components/kpi-list-page'

export default function KpiListPageWrapper() {
  const router = useRouter()

  return (
    <KpiListPageComponent
      onNavigateToMaster={() => router.push('/kpi/master')}
    />
  )
}

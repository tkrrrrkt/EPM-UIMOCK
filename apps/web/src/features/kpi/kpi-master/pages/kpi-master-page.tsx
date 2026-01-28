'use client'

import { useRouter } from 'next/navigation'
import { KpiMasterPage as KpiMasterPageComponent } from '../components/kpi-master-page'

export default function KpiMasterPageWrapper() {
  const router = useRouter()

  return (
    <KpiMasterPageComponent
      onNavigateToList={() => router.push('/kpi/list')}
    />
  )
}

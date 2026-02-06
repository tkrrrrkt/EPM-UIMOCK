import { Suspense } from 'react'
import AllocationMasterPage from '@/features/master-data/allocation-master/ui/page'

export default function Page() {
  return (
    <Suspense fallback={<div className="container mx-auto py-8">読み込み中...</div>}>
      <AllocationMasterPage />
    </Suspense>
  )
}

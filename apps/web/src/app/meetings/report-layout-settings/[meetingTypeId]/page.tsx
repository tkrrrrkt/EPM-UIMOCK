// Phase: UI-MOCK - Using MockBffClient
// TODO: Switch to HttpBffClient when BFF is ready
import { LayoutSettingsPage } from '@/features/meetings/meeting-report-layout'

interface PageProps {
  params: Promise<{
    meetingTypeId: string
  }>
}

export default async function Page({ params }: PageProps) {
  const { meetingTypeId } = await params
  return <LayoutSettingsPage meetingTypeId={meetingTypeId} />
}

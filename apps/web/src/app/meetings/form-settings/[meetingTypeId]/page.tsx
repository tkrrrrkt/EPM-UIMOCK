// Phase: UI-MOCK - Using MockBffClient
// TODO: Switch to HttpBffClient when BFF is ready
import { FormSettingsPage } from '@/features/meetings/meeting-form-settings'

interface PageProps {
  params: Promise<{
    meetingTypeId: string
  }>
}

export default async function Page({ params }: PageProps) {
  const { meetingTypeId } = await params
  return <FormSettingsPage meetingTypeId={meetingTypeId} />
}

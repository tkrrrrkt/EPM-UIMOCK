import { MtpEventDetailPage } from "@/features/planning/mtp/components/mtp-event-detail-page"

interface MtpEventDetailProps {
  params: Promise<{
    eventId: string
  }>
}

export default async function MtpEventDetail({ params }: MtpEventDetailProps) {
  const { eventId } = await params
  return <MtpEventDetailPage eventId={eventId} />
}

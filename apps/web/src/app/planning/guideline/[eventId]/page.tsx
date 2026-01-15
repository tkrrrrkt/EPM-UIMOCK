import { GuidelineDetailPage } from "@/features/planning/budget-guideline"

interface Props {
  params: Promise<{ eventId: string }>
}

export default async function GuidelineDetailRoute({ params }: Props) {
  const { eventId } = await params
  return <GuidelineDetailPage eventId={eventId} />
}

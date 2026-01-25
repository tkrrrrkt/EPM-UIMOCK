import { KpiDetailPage } from '@/features/kpi/kpi-master/components/kpi-detail-page';

export default function KpiMasterDetailPage({
  params,
}: {
  params: { eventId: string };
}) {
  return <KpiDetailPage eventId={params.eventId} />;
}

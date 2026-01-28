/**
 * Dashboard View Route
 * Next.js App Router dynamic page
 */
import { DashboardViewPage } from '@/features/reporting/dashboard/components/DashboardViewPage';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DashboardPage({ params }: PageProps) {
  const { id } = await params;
  return <DashboardViewPage dashboardId={id} />;
}

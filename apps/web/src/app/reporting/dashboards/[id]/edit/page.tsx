/**
 * Dashboard Edit Page Route
 * Next.js App Router page for dashboard editing
 */
import { DashboardEditPage } from '@/features/reporting/dashboard/components/DashboardEditPage';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <DashboardEditPage dashboardId={id} />;
}

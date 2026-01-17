import ProjectDetailPage from '@/features/report/project-profitability/detail-page'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  return <ProjectDetailPage projectId={id} />
}

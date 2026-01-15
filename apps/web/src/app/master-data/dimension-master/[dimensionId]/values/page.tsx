import { DimensionValueMasterPage } from '@/features/master-data/dimension-master/DimensionValueMasterPage'

interface PageProps {
  params: Promise<{
    dimensionId: string
  }>
}

export default async function Page({ params }: PageProps) {
  const { dimensionId } = await params
  return <DimensionValueMasterPage dimensionId={dimensionId} />
}

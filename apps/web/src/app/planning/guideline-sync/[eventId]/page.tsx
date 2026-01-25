import { GuidelineDetailPage } from "@/features/planning/budget-guideline-sync"

// Syncfusion CSS imports for TreeGrid
import "@syncfusion/ej2-base/styles/material.css"
import "@syncfusion/ej2-buttons/styles/material.css"
import "@syncfusion/ej2-calendars/styles/material.css"
import "@syncfusion/ej2-dropdowns/styles/material.css"
import "@syncfusion/ej2-inputs/styles/material.css"
import "@syncfusion/ej2-navigations/styles/material.css"
import "@syncfusion/ej2-popups/styles/material.css"
import "@syncfusion/ej2-splitbuttons/styles/material.css"
import "@syncfusion/ej2-grids/styles/material.css"
import "@syncfusion/ej2-treegrid/styles/material.css"

// Custom TreeGrid styling
import "@/features/transactions/budget-entry-sync/treegrid.css"

interface PageProps {
  params: Promise<{ eventId: string }>
}

export default async function Page({ params }: PageProps) {
  const { eventId } = await params
  return <GuidelineDetailPage eventId={eventId} />
}

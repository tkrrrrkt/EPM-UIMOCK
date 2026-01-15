"use client"

import { ReportsDashboardAG } from "@/features/report/budget-actual-report-ag"

// AG Grid Enterprise のライセンスキー設定（本番環境では環境変数から取得）
// import { LicenseManager } from "ag-grid-enterprise"
// LicenseManager.setLicenseKey(process.env.NEXT_PUBLIC_AG_GRID_LICENSE_KEY || "")

export default function BudgetActualReportAGPage() {
  return (
    <div className="h-screen">
      <ReportsDashboardAG />
    </div>
  )
}

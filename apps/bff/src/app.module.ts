import { Module } from '@nestjs/common'
import { ManagementMeetingReportModule } from './modules/meetings/management-meeting-report/management-meeting-report.module'
import { DashboardModule } from './modules/reporting/dashboard/dashboard.module'
import { KpiMasterBffModule } from './modules/kpi/kpi-master/kpi-master.module'

@Module({
  imports: [
    ManagementMeetingReportModule,
    DashboardModule,
    KpiMasterBffModule,
  ],
})
export class AppModule {}

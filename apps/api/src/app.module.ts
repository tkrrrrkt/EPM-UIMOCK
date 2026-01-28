import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'
import { DashboardModule } from './modules/reporting/dashboard/dashboard.module'
import { KpiMasterModule } from './modules/kpi/kpi-master/kpi-master.module'

@Module({
  imports: [
    PrismaModule,
    DashboardModule,
    KpiMasterModule,
  ],
})
export class AppModule {}

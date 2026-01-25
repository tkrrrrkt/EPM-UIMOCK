import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'
import { KpiMasterModule } from './modules/kpi/kpi-master/kpi-master.module'

@Module({
  imports: [
    PrismaModule,
    KpiMasterModule,
  ],
})
export class AppModule {}

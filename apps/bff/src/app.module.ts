import { Module } from '@nestjs/common'
import { KpiMasterModule } from './modules/kpi/kpi-master/kpi-master.module'

@Module({
  imports: [KpiMasterModule],
})
export class AppModule {}

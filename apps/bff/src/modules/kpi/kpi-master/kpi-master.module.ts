import { Module } from '@nestjs/common';
import { KpiMasterBffController } from './kpi-master.controller';
import { KpiMasterBffService } from './kpi-master.service';

@Module({
  imports: [],
  controllers: [KpiMasterBffController],
  providers: [KpiMasterBffService],
  exports: [KpiMasterBffService],
})
export class KpiMasterModule {}

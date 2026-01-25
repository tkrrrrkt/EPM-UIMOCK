import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { KpiMasterBffController } from './kpi-master.controller';
import { KpiMasterBffService } from './kpi-master.service';

@Module({
  imports: [HttpModule],
  controllers: [KpiMasterBffController],
  providers: [KpiMasterBffService],
  exports: [KpiMasterBffService],
})
export class KpiMasterModule {}

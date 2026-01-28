/**
 * KPI Master BFF Module
 *
 * Wires together:
 * - KpiMasterBffController
 * - KpiMasterBffService
 * - HttpModule (for Domain API calls)
 *
 * Reference: .kiro/specs/kpi/kpi-master/design.md (Task 5.1-5.3)
 */
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
export class KpiMasterBffModule {}

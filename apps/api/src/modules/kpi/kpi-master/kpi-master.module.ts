/**
 * KPI Master Domain API Module
 *
 * Wires together:
 * - KpiMasterController
 * - KpiMasterEventService
 * - KpiMasterItemService
 * - KpiDefinitionService
 * - KpiFactAmountService
 * - KpiTargetValueService
 * - KpiMasterEventRepository
 * - KpiMasterItemRepository
 * - KpiDefinitionRepository
 * - KpiFactAmountRepository
 * - KpiTargetValueRepository
 * - PrismaModule
 *
 * Reference: .kiro/specs/kpi/kpi-master/design.md
 */
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { KpiMasterController } from './kpi-master.controller';
import { KpiMasterEventService } from './services/kpi-master-event.service';
import { KpiMasterItemService } from './services/kpi-master-item.service';
import { KpiDefinitionService } from './services/kpi-definition.service';
import { KpiFactAmountService } from './services/kpi-fact-amount.service';
import { KpiTargetValueService } from './services/kpi-target-value.service';
import { KpiMasterEventRepository } from './repositories/kpi-master-event.repository';
import { KpiMasterItemRepository } from './repositories/kpi-master-item.repository';
import { KpiDefinitionRepository } from './repositories/kpi-definition.repository';
import { KpiFactAmountRepository } from './repositories/kpi-fact-amount.repository';
import { KpiTargetValueRepository } from './repositories/kpi-target-value.repository';

@Module({
  imports: [PrismaModule],
  controllers: [KpiMasterController],
  providers: [
    // Services
    KpiMasterEventService,
    KpiMasterItemService,
    KpiDefinitionService,
    KpiFactAmountService,
    KpiTargetValueService,
    // Repositories
    KpiMasterEventRepository,
    KpiMasterItemRepository,
    KpiDefinitionRepository,
    KpiFactAmountRepository,
    KpiTargetValueRepository,
  ],
  exports: [
    // Services (for potential use by other modules)
    KpiMasterEventService,
    KpiMasterItemService,
    KpiDefinitionService,
    KpiFactAmountService,
    KpiTargetValueService,
    // Repositories (for potential use by other modules)
    KpiMasterEventRepository,
    KpiMasterItemRepository,
    KpiDefinitionRepository,
    KpiFactAmountRepository,
    KpiTargetValueRepository,
  ],
})
export class KpiMasterModule {}

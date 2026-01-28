/**
 * Dashboard Domain API Module
 *
 * Wires together:
 * - DashboardController
 * - DashboardService
 * - WidgetDataService
 * - DashboardRepository
 * - PrismaModule
 *
 * Reference: .kiro/specs/reporting/dashboard/design.md
 */
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { WidgetDataService } from './widget-data.service';
import { DashboardRepository } from './dashboard.repository';

@Module({
  imports: [PrismaModule],
  controllers: [DashboardController],
  providers: [DashboardService, WidgetDataService, DashboardRepository],
  exports: [DashboardService, DashboardRepository],
})
export class DashboardModule {}

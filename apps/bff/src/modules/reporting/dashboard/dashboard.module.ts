/**
 * Dashboard BFF Module
 *
 * Wires together:
 * - DashboardBffController
 * - DashboardBffService
 * - HttpModule for Domain API calls
 *
 * Reference: .kiro/specs/reporting/dashboard/design.md
 */
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DashboardBffController } from './dashboard.controller';
import { DashboardBffService } from './dashboard.service';

@Module({
  imports: [HttpModule],
  controllers: [DashboardBffController],
  providers: [DashboardBffService],
  exports: [DashboardBffService],
})
export class DashboardModule {}

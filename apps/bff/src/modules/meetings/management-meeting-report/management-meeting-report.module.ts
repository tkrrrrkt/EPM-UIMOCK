import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ManagementMeetingReportController } from './management-meeting-report.controller'
import { ManagementMeetingReportService } from './management-meeting-report.service'

@Module({
  imports: [HttpModule],
  controllers: [ManagementMeetingReportController],
  providers: [ManagementMeetingReportService],
  exports: [ManagementMeetingReportService],
})
export class ManagementMeetingReportModule {}

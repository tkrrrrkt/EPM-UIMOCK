import type {
  ReportLayoutDto,
  ReportLayoutListDto,
  CreateReportLayoutDto,
  UpdateReportLayoutDto,
  ReorderLayoutsDto,
  ReportPageDto,
  ReportPageListDto,
  CreateReportPageDto,
  UpdateReportPageDto,
  ReorderPagesDto,
  ReportComponentDto,
  ReportComponentListDto,
  CreateReportComponentDto,
  UpdateReportComponentDto,
  ReorderComponentsDto,
  LayoutTemplateDto,
  LayoutTemplateListDto,
  CreateLayoutFromTemplateDto,
} from '@epm/contracts/bff/meetings'

export interface BffClient {
  // Layout operations
  getLayouts(meetingTypeId: string): Promise<ReportLayoutListDto>
  createLayout(dto: CreateReportLayoutDto): Promise<ReportLayoutDto>
  updateLayout(id: string, dto: UpdateReportLayoutDto): Promise<ReportLayoutDto>
  deleteLayout(id: string): Promise<void>
  reorderLayouts(dto: ReorderLayoutsDto): Promise<ReportLayoutListDto>

  // Page operations
  getPages(layoutId: string): Promise<ReportPageListDto>
  createPage(dto: CreateReportPageDto): Promise<ReportPageDto>
  updatePage(id: string, dto: UpdateReportPageDto): Promise<ReportPageDto>
  deletePage(id: string): Promise<void>
  reorderPages(dto: ReorderPagesDto): Promise<ReportPageListDto>

  // Component operations
  getComponents(pageId: string): Promise<ReportComponentListDto>
  createComponent(dto: CreateReportComponentDto): Promise<ReportComponentDto>
  updateComponent(id: string, dto: UpdateReportComponentDto): Promise<ReportComponentDto>
  deleteComponent(id: string): Promise<void>
  reorderComponents(dto: ReorderComponentsDto): Promise<ReportComponentListDto>

  // Template operations
  getTemplates(): Promise<LayoutTemplateListDto>
  createLayoutFromTemplate(dto: CreateLayoutFromTemplateDto): Promise<ReportLayoutDto>
}

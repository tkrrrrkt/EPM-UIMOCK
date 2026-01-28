// Main page component
export { LayoutSettingsPage } from './components/layout-settings-page'

// API
export { mockBffClient } from './api/mock-bff-client'
export type { BffClient } from './api/bff-client'

// Hooks
export { useLayouts, usePages, useComponents, useTemplates } from './hooks/use-layout-data'

// Types (re-exported from contracts)
export type {
  ReportLayoutDto,
  ReportPageDto,
  ReportComponentDto,
  LayoutTemplateDto,
  CreateReportLayoutDto,
  UpdateReportLayoutDto,
  CreateReportPageDto,
  UpdateReportPageDto,
  CreateReportComponentDto,
  UpdateReportComponentDto,
  CreateLayoutFromTemplateDto,
  ReorderPagesDto,
  ReorderComponentsDto,
  ReportComponentType,
  ReportPageType,
  ReportDataSource,
  ComponentWidth,
  TreeSelection,
  TreeItemType,
} from './types'

// Re-export from contracts
export type {
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
  ComponentConfig,
  KpiCardConfig,
  TableConfig,
  ChartConfig,
  SubmissionDisplayConfig,
  ReportLinkConfig,
  ActionListConfig,
  SnapshotCompareConfig,
  KpiDashboardConfig,
  ApProgressConfig,
} from '@epm/contracts/bff/meetings'

// Local types for UI
export type TreeItemType = 'layout' | 'page' | 'component'

export interface TreeSelection {
  type: TreeItemType
  id: string
  layoutId?: string
  pageId?: string
}

// Re-export enum types for convenience
export type ReportComponentType =
  | 'KPI_CARD'
  | 'TABLE'
  | 'CHART'
  | 'SUBMISSION_DISPLAY'
  | 'REPORT_LINK'
  | 'ACTION_LIST'
  | 'SNAPSHOT_COMPARE'
  | 'KPI_DASHBOARD'
  | 'AP_PROGRESS'

export type ReportPageType = 'FIXED' | 'PER_DEPARTMENT' | 'PER_BU'

export type ReportDataSource = 'FACT' | 'KPI' | 'SUBMISSION' | 'SNAPSHOT' | 'EXTERNAL'

export type ComponentWidth = 'FULL' | 'HALF' | 'THIRD'

export type ComponentHeight = 'AUTO' | 'SMALL' | 'MEDIUM' | 'LARGE'

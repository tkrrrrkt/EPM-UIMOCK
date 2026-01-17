import type { BffClient } from "./BffClient"
import type {
  BffImportStartRequest,
  BffImportStartResponse,
  BffImportPasteRequest,
  BffImportPasteResponse,
  BffImportPreMappingRequest,
  BffImportPreMappingResponse,
  BffApplyMappingRequest,
  BffApplyMappingResponse,
  BffImportAggregateRequest,
  BffImportAggregateResponse,
  BffImportStagingRequest,
  BffImportStagingResponse,
  BffUpdateStagingRequest,
  BffUpdateStagingResponse,
  BffImportValidateRequest,
  BffImportValidateResponse,
  BffGetAutoFixSuggestionsRequest,
  BffGetAutoFixSuggestionsResponse,
  BffApplyAutoFixRequest,
  BffApplyAutoFixResponse,
  BffImportExecuteRequest,
  BffImportExecuteResponse,
  BffImportHistoryRequest,
  BffImportHistoryResponse,
  BffImportContextRequest,
  BffImportContextResponse,
  BffMappingMasterResponse,
  BffBatchStatusRequest,
  BffBatchStatusResponse,
  BffTemplateListRequest,
  BffTemplateListResponse,
  BffStagingRow,
  BffStagingColumn,
  ImportBatchStatus,
} from "@epm/contracts/bff/data-import"

// モック用ステージングデータ
const createMockStagingData = (rowCount: number): { columns: BffStagingColumn[]; rows: BffStagingRow[] } => {
  const columns: BffStagingColumn[] = [
    { key: "subject_code", label: "科目コード", columnType: "SUBJECT_CODE", width: 100 },
    { key: "department_code", label: "部門コード", columnType: "DEPARTMENT_CODE", width: 100 },
    { key: "project_code", label: "PJコード", columnType: "PROJECT_CODE", width: 100 },
    { key: "m4", label: "4月", columnType: "AMOUNT", width: 80 },
    { key: "m5", label: "5月", columnType: "AMOUNT", width: 80 },
    { key: "m6", label: "6月", columnType: "AMOUNT", width: 80 },
    { key: "m7", label: "7月", columnType: "AMOUNT", width: 80 },
    { key: "m8", label: "8月", columnType: "AMOUNT", width: 80 },
    { key: "m9", label: "9月", columnType: "AMOUNT", width: 80 },
    { key: "m10", label: "10月", columnType: "AMOUNT", width: 80 },
    { key: "m11", label: "11月", columnType: "AMOUNT", width: 80 },
    { key: "m12", label: "12月", columnType: "AMOUNT", width: 80 },
    { key: "m1", label: "1月", columnType: "AMOUNT", width: 80 },
    { key: "m2", label: "2月", columnType: "AMOUNT", width: 80 },
    { key: "m3", label: "3月", columnType: "AMOUNT", width: 80 },
  ]

  const subjectCodes = ["1000", "2000", "3000", "4000"]
  const departmentCodes = ["S01", "S02", "D01"]
  const projectCodes = ["PJ001", "PJ002", "PJ003", ""]

  const rows: BffStagingRow[] = []
  for (let i = 0; i < rowCount; i++) {
    const subjectCode = subjectCodes[i % subjectCodes.length]
    const deptCode = departmentCodes[i % departmentCodes.length]
    const projectCode = projectCodes[i % projectCodes.length]

    rows.push({
      rowIndex: i,
      excluded: false,
      cells: {
        subject_code: subjectCode,
        department_code: deptCode,
        project_code: projectCode || null,
        m4: String(Math.floor(Math.random() * 10000)),
        m5: String(Math.floor(Math.random() * 10000)),
        m6: String(Math.floor(Math.random() * 10000)),
        m7: String(Math.floor(Math.random() * 10000)),
        m8: String(Math.floor(Math.random() * 10000)),
        m9: String(Math.floor(Math.random() * 10000)),
        m10: String(Math.floor(Math.random() * 10000)),
        m11: String(Math.floor(Math.random() * 10000)),
        m12: String(Math.floor(Math.random() * 10000)),
        m1: String(Math.floor(Math.random() * 10000)),
        m2: String(Math.floor(Math.random() * 10000)),
        m3: String(Math.floor(Math.random() * 10000)),
      },
      validationStatus: "OK",
    })
  }

  return { columns, rows }
}

export class MockBffClient implements BffClient {
  private batchCounter = 0
  private batches: Map<string, {
    status: ImportBatchStatus
    rowCount: number
    stagingData: ReturnType<typeof createMockStagingData> | null
  }> = new Map()

  async startImport(_request: BffImportStartRequest): Promise<BffImportStartResponse> {
    await this.delay(300)
    const batchId = `batch-${++this.batchCounter}`
    this.batches.set(batchId, {
      status: "PENDING",
      rowCount: 0,
      stagingData: null,
    })
    return {
      batchId,
      uploadUrl: `/mock-upload/${batchId}`,
    }
  }

  async startPasteImport(request: BffImportPasteRequest): Promise<BffImportPasteResponse> {
    await this.delay(200)
    const batchId = `batch-${++this.batchCounter}`
    const rowCount = request.data.length
    const needsAggregation = rowCount > 5000

    const stagingData = createMockStagingData(Math.min(rowCount, 100))

    this.batches.set(batchId, {
      status: needsAggregation ? "MAPPING_REQUIRED" : "STAGING",
      rowCount,
      stagingData,
    })

    return {
      batchId,
      rowCount,
      needsAggregation,
    }
  }

  async uploadFile(_uploadUrl: string, _file: File): Promise<void> {
    await this.delay(500)
    // ファイルアップロードのモック
  }

  async getPreMapping(request: BffImportPreMappingRequest): Promise<BffImportPreMappingResponse> {
    await this.delay(400)
    const batch = this.batches.get(request.batchId)
    const rowCount = batch?.rowCount ?? 100

    return {
      batchId: request.batchId,
      rowCount,
      columnMappings: [
        { columnIndex: 0, headerName: "勘定科目", mappingTarget: "SUBJECT_CODE", isLearned: true },
        { columnIndex: 1, headerName: "部門", mappingTarget: "DEPARTMENT_CODE", isLearned: true },
        { columnIndex: 2, headerName: "PJ番号", mappingTarget: "PROJECT_CODE", isLearned: false },
        { columnIndex: 3, headerName: "4月", mappingTarget: "AMOUNT", isLearned: true },
        { columnIndex: 4, headerName: "5月", mappingTarget: "AMOUNT", isLearned: true },
      ],
      subjectCodes: [
        {
          sourceValue: "売上",
          targetId: "sub-sales",
          targetCode: "1000",
          targetName: "売上高",
          status: "MAPPED",
          isLearned: true,
          rowCount: 30,
        },
        {
          sourceValue: "原価",
          targetId: "sub-cogs",
          targetCode: "2000",
          targetName: "売上原価",
          status: "MAPPED",
          isLearned: true,
          rowCount: 25,
        },
        {
          sourceValue: "研究開発費",
          targetId: null,
          targetCode: null,
          targetName: null,
          status: "UNMAPPED",
          isLearned: false,
          rowCount: 10,
        },
      ],
      departmentCodes: [
        {
          sourceValue: "営業1課",
          targetId: "dept-sales-1",
          targetCode: "S01",
          targetName: "営業1課",
          status: "MAPPED",
          isLearned: true,
          rowCount: 20,
        },
        {
          sourceValue: "第二開発",
          targetId: null,
          targetCode: null,
          targetName: null,
          status: "UNMAPPED",
          isLearned: false,
          rowCount: 15,
        },
      ],
      unmappedSubjectCount: 1,
      unmappedDepartmentCount: 1,
    }
  }

  async applyMapping(request: BffApplyMappingRequest): Promise<BffApplyMappingResponse> {
    await this.delay(300)
    const batch = this.batches.get(request.batchId)
    if (batch) {
      batch.status = "AGGREGATING"
    }
    return {
      batchId: request.batchId,
      success: true,
    }
  }

  async aggregate(request: BffImportAggregateRequest): Promise<BffImportAggregateResponse> {
    await this.delay(500)
    const batch = this.batches.get(request.batchId)
    const originalRows = batch?.rowCount ?? 10000
    const aggregatedRows = Math.min(Math.ceil(originalRows / 50), 500)

    if (batch) {
      batch.status = "STAGING"
      batch.stagingData = createMockStagingData(aggregatedRows)
    }

    return {
      batchId: request.batchId,
      originalRows,
      aggregatedRows,
      aggregationAxes: ["年月", "部門", "科目"],
    }
  }

  async getStaging(request: BffImportStagingRequest): Promise<BffImportStagingResponse> {
    await this.delay(300)
    const batch = this.batches.get(request.batchId)
    const stagingData = batch?.stagingData ?? createMockStagingData(20)

    const includedRows = stagingData.rows.filter(r => !r.excluded).length
    const excludedRows = stagingData.rows.filter(r => r.excluded).length

    return {
      batchId: request.batchId,
      columns: stagingData.columns,
      rows: stagingData.rows,
      summary: {
        totalRows: stagingData.rows.length,
        includedRows,
        excludedRows,
      },
    }
  }

  async updateStaging(request: BffUpdateStagingRequest): Promise<BffUpdateStagingResponse> {
    await this.delay(200)
    const batch = this.batches.get(request.batchId)
    if (batch?.stagingData) {
      for (const update of request.updates) {
        const row = batch.stagingData.rows.find(r => r.rowIndex === update.rowIndex)
        if (row) {
          if (update.excluded !== undefined) {
            row.excluded = update.excluded
          }
          if (update.cells) {
            Object.assign(row.cells, update.cells)
          }
        }
      }
    }
    return {
      batchId: request.batchId,
      success: true,
      updatedRows: request.updates.length,
    }
  }

  async validate(request: BffImportValidateRequest): Promise<BffImportValidateResponse> {
    await this.delay(400)
    const batch = this.batches.get(request.batchId)
    const stagingData = batch?.stagingData ?? createMockStagingData(20)
    const totalRows = stagingData.rows.length
    const excludedRows = stagingData.rows.filter(r => r.excluded).length

    // モックではエラーなしで返す
    return {
      batchId: request.batchId,
      status: "VALID",
      summary: {
        totalRows,
        validRows: totalRows - excludedRows,
        errorRows: 0,
        warningRows: 0,
        excludedRows,
      },
      errors: [],
    }
  }

  async getAutoFixSuggestions(request: BffGetAutoFixSuggestionsRequest): Promise<BffGetAutoFixSuggestionsResponse> {
    await this.delay(300)
    return {
      batchId: request.batchId,
      suggestions: [],
    }
  }

  async applyAutoFix(request: BffApplyAutoFixRequest): Promise<BffApplyAutoFixResponse> {
    await this.delay(200)
    return {
      batchId: request.batchId,
      appliedCount: request.fixes.length,
      success: true,
    }
  }

  async execute(request: BffImportExecuteRequest): Promise<BffImportExecuteResponse> {
    await this.delay(600)
    const batch = this.batches.get(request.batchId)
    const stagingData = batch?.stagingData ?? createMockStagingData(20)
    const excludedRows = stagingData.rows.filter(r => r.excluded).length
    const importedRows = stagingData.rows.length - excludedRows

    if (batch) {
      batch.status = "COMPLETED"
    }

    return {
      batchId: request.batchId,
      status: "COMPLETED",
      importedRows,
      excludedRows,
      message: "取込が完了しました",
      targetEventName: "2026年度予算",
      targetVersionName: "第1回",
    }
  }

  async getHistory(request: BffImportHistoryRequest): Promise<BffImportHistoryResponse> {
    await this.delay(300)
    const items = [
      {
        id: "hist-1",
        batchId: "batch-123",
        importType: "BUDGET" as const,
        eventId: "event-budget-2026",
        eventName: "2026年度予算",
        versionId: "version-1",
        versionName: "第1回",
        totalRows: 150,
        sourceType: "EXCEL" as const,
        sourceFilename: "予算データ_202601.xlsx",
        result: "SUCCESS" as const,
        createdByName: "田中太郎",
        createdAt: "2026-01-15T10:30:00Z",
      },
      {
        id: "hist-2",
        batchId: "batch-122",
        importType: "FORECAST" as const,
        eventId: "event-forecast-2026",
        eventName: "2026年度見込",
        versionId: "version-1",
        versionName: "1月見込",
        totalRows: 200,
        sourceType: "PASTE" as const,
        sourceFilename: null,
        result: "SUCCESS" as const,
        createdByName: "鈴木一郎",
        createdAt: "2026-01-14T14:20:00Z",
      },
    ]

    // フィルター適用
    let filtered = items
    if (request.importType) {
      filtered = filtered.filter(item => item.importType === request.importType)
    }

    return {
      items: filtered,
      pagination: {
        total: filtered.length,
        page: request.page ?? 1,
        pageSize: request.pageSize ?? 20,
        totalPages: 1,
      },
    }
  }

  async getContext(request: BffImportContextRequest): Promise<BffImportContextResponse> {
    await this.delay(200)

    const events = request.importType === "BUDGET"
      ? [
          { id: "event-budget-2026", code: "BUD2026", name: "2026年度予算", fiscalYear: 2026 },
          { id: "event-budget-2025", code: "BUD2025", name: "2025年度予算", fiscalYear: 2025 },
        ]
      : request.importType === "FORECAST"
        ? [
            { id: "event-forecast-2026", code: "FC2026", name: "2026年度見込", fiscalYear: 2026 },
          ]
        : [
            { id: "event-actual-2026", code: "ACT2026", name: "2026年度実績", fiscalYear: 2026 },
          ]

    return {
      importType: request.importType,
      events,
      versions: [
        { id: "version-1", eventId: events[0].id, code: "V1", name: "第1回", status: "DRAFT" },
        { id: "version-2", eventId: events[0].id, code: "V2", name: "第2回", status: "DRAFT" },
      ],
      templates: [
        { code: "standard", name: "標準フォーマット", isSystem: true },
        { code: "custom-1", name: "カスタムフォーマット1", isSystem: false },
      ],
    }
  }

  async getMappingMaster(): Promise<BffMappingMasterResponse> {
    await this.delay(200)
    return {
      subjects: [
        { id: "sub-sales", code: "1000", name: "売上高", parentId: null, hierarchyPath: "売上高" },
        { id: "sub-cogs", code: "2000", name: "売上原価", parentId: null, hierarchyPath: "売上原価" },
        { id: "sub-sga", code: "4000", name: "販管費", parentId: null, hierarchyPath: "販管費" },
        { id: "sub-rd", code: "4100", name: "研究開発費", parentId: "sub-sga", hierarchyPath: "販管費 > 研究開発費" },
      ],
      departments: [
        { id: "dept-sales-1", code: "S01", name: "営業1課", parentId: null, hierarchyPath: "営業1課" },
        { id: "dept-sales-2", code: "S02", name: "営業2課", parentId: null, hierarchyPath: "営業2課" },
        { id: "dept-dev", code: "D01", name: "開発部", parentId: null, hierarchyPath: "開発部" },
        { id: "dept-dev-2", code: "D02", name: "第二開発", parentId: "dept-dev", hierarchyPath: "開発部 > 第二開発" },
      ],
    }
  }

  async getTemplates(_request: BffTemplateListRequest): Promise<BffTemplateListResponse> {
    await this.delay(150)
    return {
      templates: [
        {
          id: "tmpl-1",
          templateCode: "standard",
          templateName: "標準フォーマット",
          description: "科目・部門・月別金額の標準レイアウト",
          formatType: "HORIZONTAL",
          isSystem: true,
          createdByName: null,
          lastUsedAt: "2026-01-10T09:00:00Z",
        },
        {
          id: "tmpl-2",
          templateCode: "vertical",
          templateName: "縦持ちフォーマット",
          description: "月が行方向のレイアウト",
          formatType: "VERTICAL",
          isSystem: true,
          createdByName: null,
          lastUsedAt: null,
        },
      ],
    }
  }

  async getBatchStatus(request: BffBatchStatusRequest): Promise<BffBatchStatusResponse> {
    await this.delay(100)
    const batch = this.batches.get(request.batchId)

    return {
      batchId: request.batchId,
      status: batch?.status ?? "PENDING",
      progress: batch?.status === "COMPLETED" ? 100 : 50,
      message: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

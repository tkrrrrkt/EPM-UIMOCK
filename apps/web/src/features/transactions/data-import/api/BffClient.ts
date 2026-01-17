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
} from "@epm/contracts/bff/data-import"

export interface BffClient {
  // 取込開始
  startImport(request: BffImportStartRequest): Promise<BffImportStartResponse>
  startPasteImport(request: BffImportPasteRequest): Promise<BffImportPasteResponse>
  uploadFile(uploadUrl: string, file: File): Promise<void>

  // 事前マッピング（大量データ）
  getPreMapping(request: BffImportPreMappingRequest): Promise<BffImportPreMappingResponse>
  applyMapping(request: BffApplyMappingRequest): Promise<BffApplyMappingResponse>

  // 集計（大量データ）
  aggregate(request: BffImportAggregateRequest): Promise<BffImportAggregateResponse>

  // ステージング
  getStaging(request: BffImportStagingRequest): Promise<BffImportStagingResponse>
  updateStaging(request: BffUpdateStagingRequest): Promise<BffUpdateStagingResponse>

  // 検証
  validate(request: BffImportValidateRequest): Promise<BffImportValidateResponse>
  getAutoFixSuggestions(request: BffGetAutoFixSuggestionsRequest): Promise<BffGetAutoFixSuggestionsResponse>
  applyAutoFix(request: BffApplyAutoFixRequest): Promise<BffApplyAutoFixResponse>

  // 取込実行
  execute(request: BffImportExecuteRequest): Promise<BffImportExecuteResponse>

  // 履歴
  getHistory(request: BffImportHistoryRequest): Promise<BffImportHistoryResponse>

  // コンテキスト・マスタ
  getContext(request: BffImportContextRequest): Promise<BffImportContextResponse>
  getMappingMaster(): Promise<BffMappingMasterResponse>
  getTemplates(request: BffTemplateListRequest): Promise<BffTemplateListResponse>

  // バッチ状態
  getBatchStatus(request: BffBatchStatusRequest): Promise<BffBatchStatusResponse>
}

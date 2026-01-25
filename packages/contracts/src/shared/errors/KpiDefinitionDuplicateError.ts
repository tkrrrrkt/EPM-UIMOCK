/**
 * 非財務KPI定義のkpi_codeが重複している場合のエラー
 */
export class KpiDefinitionDuplicateError extends Error {
  constructor(message: string = 'KPI definition with the same kpi_code already exists') {
    super(message);
    this.name = 'KpiDefinitionDuplicateError';
  }
}

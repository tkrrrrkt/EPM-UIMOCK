/**
 * Shared Errors
 *
 * @module shared/errors
 */

// KPI管理マスタ機能
export * from './KpiMasterEventNotFoundError';
export * from './KpiMasterEventAlreadyConfirmedError';
export * from './KpiMasterEventDuplicateError';
export * from './KpiMasterItemNotFoundError';
export * from './KpiMasterItemTypeImmutableError';
export * from './KpiMasterItemDeleteForbiddenError';
export * from './KpiMasterItemAccessDeniedError';
export * from './KpiMasterItemInvalidReferenceError';
export * from './KpiDefinitionDuplicateError';
export * from './KpiFactAmountDuplicateError';
export * from './KpiFactAmountNotFoundError';
export * from './KpiTargetValueDuplicateError';
export * from './KpiTargetValueNotFoundError';
export * from './KpiManagedSubjectNotFoundError';
export * from './KpiManagedMetricNotFoundError';
export * from './ActionPlanInvalidReferenceError';

// Dashboard（経営ダッシュボード）機能
export * from './DashboardNotFoundError';
export * from './DashboardAccessDeniedError';
export * from './DashboardDeleteForbiddenError';
export * from './WidgetDataError';
export * from './InvalidFilterConfigError';

// CVP Analysis Feature - Public API

// Components
export { CvpDashboard } from './components';

// Types
export type {
  CvpPrimaryType,
  CvpGranularity,
  CvpLineType,
  CvpFilterState,
  BffCvpOptionsRequest,
  BffCvpOptionsResponse,
  BffCvpDataRequest,
  BffCvpDataResponse,
  BffCvpKpiItem,
  BffCvpTreeLine,
  SimulatedTreeLine,
  CvpAnalysisErrorCode,
} from './types';

// API
export { createBffClient, MockBffClient, HttpBffClient } from './api';
export type { BffClient } from './api';

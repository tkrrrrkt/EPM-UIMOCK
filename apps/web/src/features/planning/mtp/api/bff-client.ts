import type {
  BffListMtpEventsRequest,
  BffListMtpEventsResponse,
  BffMtpEventDetailResponse,
  BffCreateMtpEventRequest,
  BffUpdateMtpEventRequest,
  BffDuplicateMtpEventRequest,
  BffMtpEventResponse,
  BffGetMtpAmountsRequest,
  BffMtpAmountsResponse,
  BffSaveMtpAmountsRequest,
  BffSaveMtpAmountsResponse,
  BffMtpOverviewResponse,
  BffGetMtpTrendRequest,
  BffMtpTrendResponse,
  BffListStrategyThemesResponse,
  BffCreateStrategyThemeRequest,
  BffUpdateStrategyThemeRequest,
  BffStrategyThemeResponse,
} from "@epm/contracts/bff/mtp"

export interface BffClient {
  // Event operations
  listEvents(request: BffListMtpEventsRequest): Promise<BffListMtpEventsResponse>
  getEventDetail(eventId: string): Promise<BffMtpEventDetailResponse>
  createEvent(request: BffCreateMtpEventRequest): Promise<BffMtpEventResponse>
  updateEvent(eventId: string, request: BffUpdateMtpEventRequest): Promise<BffMtpEventResponse>
  duplicateEvent(eventId: string, request: BffDuplicateMtpEventRequest): Promise<BffMtpEventResponse>
  deleteEvent(eventId: string): Promise<void>

  // Amount operations
  getAmounts(eventId: string, request: BffGetMtpAmountsRequest): Promise<BffMtpAmountsResponse>
  saveAmounts(eventId: string, request: BffSaveMtpAmountsRequest): Promise<BffSaveMtpAmountsResponse>

  // Overview operations
  getOverview(eventId: string): Promise<BffMtpOverviewResponse>

  // Trend operations
  getTrend(eventId: string, request: BffGetMtpTrendRequest): Promise<BffMtpTrendResponse>

  // Strategy theme operations
  listThemes(eventId: string): Promise<BffListStrategyThemesResponse>
  createTheme(eventId: string, request: BffCreateStrategyThemeRequest): Promise<BffStrategyThemeResponse>
  updateTheme(
    eventId: string,
    themeId: string,
    request: BffUpdateStrategyThemeRequest,
  ): Promise<BffStrategyThemeResponse>
  deleteTheme(eventId: string, themeId: string): Promise<void>
}

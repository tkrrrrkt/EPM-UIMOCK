/**
 * Multidim Analysis BffClient Interface
 *
 * Purpose:
 * - Define contract between UI and BFF for Multidim Analysis feature
 * - UI must only use BFF DTOs (packages/contracts/src/bff/multidim-analysis)
 * - Never import API contracts in UI layer
 *
 * Reference: .kiro/specs/reporting/multidim-analysis/design.md (Task 14.1)
 */
import type {
  BffFieldListDto,
  BffPivotQueryRequestDto,
  BffPivotQueryResponseDto,
  BffDrilldownRequestDto,
  BffDrilldownResponseDto,
  BffDrillthroughRequestDto,
  BffDrillthroughResponseDto,
  BffPresetListDto,
} from '@epm/contracts/bff/multidim-analysis';

/**
 * BffClient interface for Multidim Analysis feature
 * Implemented by:
 * - MockBffClient (UI-MOCK phase, hardcoded data)
 * - HttpBffClient (UI-BFF phase, real HTTP calls)
 */
export interface BffClient {
  /**
   * Get available fields for pivot layout
   * GET /api/bff/reporting/multidim/fields
   */
  getFields(): Promise<BffFieldListDto>;

  /**
   * Execute pivot query
   * POST /api/bff/reporting/multidim/query
   */
  executePivotQuery(
    request: BffPivotQueryRequestDto
  ): Promise<BffPivotQueryResponseDto>;

  /**
   * Execute drilldown
   * POST /api/bff/reporting/multidim/drilldown
   */
  executeDrilldown(
    request: BffDrilldownRequestDto
  ): Promise<BffDrilldownResponseDto>;

  /**
   * Execute drillthrough
   * POST /api/bff/reporting/multidim/drillthrough
   */
  executeDrillthrough(
    request: BffDrillthroughRequestDto
  ): Promise<BffDrillthroughResponseDto>;

  /**
   * Get layout presets
   * GET /api/bff/reporting/multidim/presets
   */
  getPresets(): Promise<BffPresetListDto>;
}

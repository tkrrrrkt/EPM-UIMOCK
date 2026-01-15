/**
 * BFF Client Interface
 *
 * Defines the contract for communicating with the BFF layer
 */

import type {
  BffListLaborCostRatesRequest,
  BffListLaborCostRatesResponse,
  BffCreateLaborCostRateRequest,
  BffUpdateLaborCostRateRequest,
  BffLaborCostRateDetailResponse,
  BffListSubjectsResponse,
  BffError,
} from "../types/bff-contracts"

export interface BffClient {
  /**
   * List labor cost rates with filtering and pagination
   */
  listLaborCostRates(request: BffListLaborCostRatesRequest): Promise<BffListLaborCostRatesResponse>

  /**
   * Get detailed information for a specific labor cost rate
   */
  getLaborCostRateDetail(id: string): Promise<BffLaborCostRateDetailResponse>

  /**
   * Create a new labor cost rate
   */
  createLaborCostRate(request: BffCreateLaborCostRateRequest): Promise<BffLaborCostRateDetailResponse>

  /**
   * Update an existing labor cost rate
   */
  updateLaborCostRate(id: string, request: BffUpdateLaborCostRateRequest): Promise<BffLaborCostRateDetailResponse>

  /**
   * Deactivate a labor cost rate
   */
  deactivateLaborCostRate(id: string): Promise<BffLaborCostRateDetailResponse>

  /**
   * Reactivate a labor cost rate
   */
  reactivateLaborCostRate(id: string): Promise<BffLaborCostRateDetailResponse>

  /**
   * Get list of subjects for rate item breakdown
   */
  listSubjects(): Promise<BffListSubjectsResponse>
}

export class BffClientError extends Error {
  constructor(
    public readonly error: BffError,
    message?: string,
  ) {
    super(message || error.message)
    this.name = "BffClientError"
  }
}

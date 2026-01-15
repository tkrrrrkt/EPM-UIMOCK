/**
 * BffClient Interface for Company Master
 *
 * UI → BFF の通信インターフェース定義
 * 実装は MockBffClient または HttpBffClient
 */

import type {
  BffListCompaniesRequest,
  BffListCompaniesResponse,
  BffCompanyDetailResponse,
  BffCreateCompanyRequest,
  BffUpdateCompanyRequest,
  BffCompanyTreeResponse,
} from '@epm/contracts/bff/company-master'

export interface BffClient {
  listCompanies(req: BffListCompaniesRequest): Promise<BffListCompaniesResponse>
  getCompanyTree(): Promise<BffCompanyTreeResponse>
  getCompanyDetail(id: string): Promise<BffCompanyDetailResponse>
  createCompany(req: BffCreateCompanyRequest): Promise<BffCompanyDetailResponse>
  updateCompany(id: string, req: BffUpdateCompanyRequest): Promise<BffCompanyDetailResponse>
  deactivateCompany(id: string): Promise<BffCompanyDetailResponse>
  reactivateCompany(id: string): Promise<BffCompanyDetailResponse>
}

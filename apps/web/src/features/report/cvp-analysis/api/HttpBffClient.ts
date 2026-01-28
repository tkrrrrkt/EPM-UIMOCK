import type { BffClient } from './BffClient';
import type {
  BffCvpOptionsRequest,
  BffCvpOptionsResponse,
  BffCvpDataRequest,
  BffCvpDataResponse,
} from '../types';

export class HttpBffClient implements BffClient {
  private baseUrl: string;

  constructor(baseUrl = '/api/bff/cvp-analysis') {
    this.baseUrl = baseUrl;
  }

  async getOptions(request: BffCvpOptionsRequest): Promise<BffCvpOptionsResponse> {
    const params = new URLSearchParams({ companyId: request.companyId });
    const response = await fetch(`${this.baseUrl}/options?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch options: ${response.statusText}`);
    }

    return response.json();
  }

  async getData(request: BffCvpDataRequest): Promise<BffCvpDataResponse> {
    const response = await fetch(`${this.baseUrl}/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    return response.json();
  }
}

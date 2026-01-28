import type { BffClient } from './BffClient';
import type {
  BffRoicOptionsRequest,
  BffRoicOptionsResponse,
  BffRoicDataRequest,
  BffRoicDataResponse,
  BffRoicSimpleInputRequest,
  BffRoicSimpleInputResponse,
  BffRoicSimpleInputSaveRequest,
  BffRoicSimpleInputSaveResponse,
} from '../types';

const BASE_URL = '/api/bff/roic-analysis';

export class HttpBffClient implements BffClient {
  async getOptions(
    request: BffRoicOptionsRequest
  ): Promise<BffRoicOptionsResponse> {
    const params = new URLSearchParams({
      companyId: request.companyId,
    });
    const response = await fetch(`${BASE_URL}/options?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch options: ${response.statusText}`);
    }
    return response.json();
  }

  async getData(request: BffRoicDataRequest): Promise<BffRoicDataResponse> {
    const response = await fetch(`${BASE_URL}/data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    return response.json();
  }

  async getSimpleInput(
    request: BffRoicSimpleInputRequest
  ): Promise<BffRoicSimpleInputResponse> {
    const params = new URLSearchParams({
      companyId: request.companyId,
      fiscalYear: String(request.fiscalYear),
      departmentStableId: request.departmentStableId,
    });
    const response = await fetch(`${BASE_URL}/simple-input?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch simple input: ${response.statusText}`);
    }
    return response.json();
  }

  async saveSimpleInput(
    request: BffRoicSimpleInputSaveRequest
  ): Promise<BffRoicSimpleInputSaveResponse> {
    const response = await fetch(`${BASE_URL}/simple-input`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error(`Failed to save simple input: ${response.statusText}`);
    }
    return response.json();
  }
}

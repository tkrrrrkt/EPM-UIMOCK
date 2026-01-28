import type {
  BffCvpOptionsRequest,
  BffCvpOptionsResponse,
  BffCvpDataRequest,
  BffCvpDataResponse,
} from '../types';

export interface BffClient {
  getOptions(request: BffCvpOptionsRequest): Promise<BffCvpOptionsResponse>;
  getData(request: BffCvpDataRequest): Promise<BffCvpDataResponse>;
}

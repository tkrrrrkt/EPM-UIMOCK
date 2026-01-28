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

export interface BffClient {
  /**
   * フィルター選択肢・モード判定を取得
   */
  getOptions(request: BffRoicOptionsRequest): Promise<BffRoicOptionsResponse>;

  /**
   * ROIC分析データを取得
   */
  getData(request: BffRoicDataRequest): Promise<BffRoicDataResponse>;

  /**
   * 簡易入力データを取得
   */
  getSimpleInput(
    request: BffRoicSimpleInputRequest
  ): Promise<BffRoicSimpleInputResponse>;

  /**
   * 簡易入力データを保存
   */
  saveSimpleInput(
    request: BffRoicSimpleInputSaveRequest
  ): Promise<BffRoicSimpleInputSaveResponse>;
}

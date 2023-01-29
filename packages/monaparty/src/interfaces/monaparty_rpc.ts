import { MonapartyRequest, MonapartyResponse } from "./rpc_caller";

export interface sendAssetRequest {
  quantity: number;
}

export interface getNormalizedBalancesRequest extends MonapartyRequest {
  addressses: string[];
}

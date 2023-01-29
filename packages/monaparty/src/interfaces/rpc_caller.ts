export type MonapartyRequest = Record<string, unknown>;
export type MonapartyResponse = Record<string, unknown>;

export interface RPCParams {
  id?: number;
  method: string;
  params: MonapartyRequest;
}

export interface RPCResponse {
  id: number;
  result?: unknown;
  error?: unknown;
  jsonrpc: string;
}

export interface MonapartyRPCError {
  data: {
    type: string;
    args: unknown;
    message: string;
  };
  code: number;
  message: string;
}

export abstract class RPCCaller {
  constructor(private endpoint: string) {}

  abstract call(param: RPCParams): Promise<RPCResponse>;
  abstract callBatch(params: RPCParams[]): Promise<RPCResponse[]>;
}

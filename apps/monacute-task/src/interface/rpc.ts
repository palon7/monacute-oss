/* eslint-disable @typescript-eslint/no-explicit-any */
export interface RPCError {
  code: number;
  message: string;
}

export interface RPCResponse {
  id: number;
  jsonrpc: string;
  rawResult: string;
  result?: any;
  error?: RPCError;
}

export interface RPCErrorResponse {
  id: string;
  jsonrpc: string;
  error: RPCError;
}

export interface RPCCall {
  id: number;
  method: string;
  params: any;
}

export interface RPCCallBody {
  jsonrpc: string;
  id: number;
  method: string;
  params: any;
}

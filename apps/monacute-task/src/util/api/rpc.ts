/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { AxiosError, AxiosInstance } from "axios";
import {
  RPCResponse,
  RPCErrorResponse,
  RPCCall,
  RPCCallBody,
} from "../../interface/rpc";
import { logger } from "../logger";

export class RPCClient {
  client: AxiosInstance;

  rpcEndpoint: string;

  constructor(_client: AxiosInstance, _rpcEndpoint: string) {
    this.client = _client;
    this.rpcEndpoint = _rpcEndpoint;
  }

  // Notice: currently electrum-mona does not support batch requesting
  callBatch = async (calls: RPCCall[]): Promise<RPCResponse[]> => {
    try {
      // construct call list
      let callDataList: RPCCallBody | RPCCallBody[];

      if (calls.length > 1) {
        // Batch call
        callDataList = calls.map(
          (c): RPCCallBody => ({
            jsonrpc: "2.0",
            id: c.id,
            method: c.method,
            params: c.params,
          })
        );
      } else if (calls.length > 0) {
        // Single call
        const c = calls[0];
        callDataList = {
          jsonrpc: "2.0",
          id: c.id,
          method: c.method,
          params: c.params,
        };
      } else {
        throw new Error("Calls must has 1 rpccall");
      }

      const response = await this.client.post<RPCResponse[] | RPCResponse>(
        this.rpcEndpoint,
        callDataList,
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );

      // if single call, pack to array
      const responses = Array.isArray(response.data)
        ? response.data
        : [response.data];
      // check error
      responses.forEach((r) => {
        if (r.error !== undefined) {
          throw new Error(`Error while RPC call: ${r.error.message}`);
        }
      });

      return responses;
    } catch (e) {
      if ((e as AxiosError<RPCErrorResponse>).response) {
        if ((e as AxiosError<RPCErrorResponse>).response?.data.error) {
          // error with message
          throw new Error(
            `Error while electrum RPC call: ${
              (e as AxiosError<RPCErrorResponse>).response?.data.error
                .message || "unknown"
            }`
          );
        } else {
          // error without message
          throw new Error("Unknown error while RPC call");
        }
      } else {
        throw e;
      }
    }
  };

  call = async (method: string, params: any, id = 1): Promise<RPCResponse> => {
    // logger.trace({ method, params }, `rpc calling`);
    const result = await this.callBatch([
      {
        id,
        method,
        params,
      },
    ]);
    return result[0];
  };

  isSuccess = (responce: RPCResponse): boolean =>
    !responce.error &&
    responce.result !== null &&
    typeof responce.result === "object";
}

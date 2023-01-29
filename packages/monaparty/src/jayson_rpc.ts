import * as jayson from "jayson/promise";
import {
  MonapartyResponse,
  RPCCaller,
  RPCParams,
  RPCResponse,
} from "./interfaces/rpc_caller";

export class JaysonRPCCaller extends RPCCaller {
  private client: jayson.Client;

  constructor(endpoint: string) {
    super(endpoint);

    // Set path to option
    const url = new URL(endpoint);
    const option = url as jayson.HttpsClientOptions;
    option.path = url.pathname;

    if (url.protocol === "https:") {
      this.client = jayson.Client.https(option);
    } else if (url.protocol === "http:") {
      this.client = jayson.Client.http(option);
    } else {
      throw new Error(
        "Protocol unknown, endpoint must be start with https:// or http://"
      );
    }
  }

  call(param: RPCParams): Promise<RPCResponse> {
    return this.client.request(
      param.method,
      param.params,
      param.id || 1
    ) as Promise<RPCResponse>;
  }

  callBatch(params: RPCParams[]): Promise<RPCResponse[]> {
    const batch = params.map((param, index) =>
      this.client.request(param.method, param.params, param.id || index, false)
    );
    return this.client.request(batch) as Promise<RPCResponse[]>;
  }
}

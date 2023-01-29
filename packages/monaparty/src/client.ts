import * as jayson from "jayson";
import {
  AddressBalance,
  AssetInfo,
  Balance,
  NormalizedBalance,
} from "./interfaces/monaparty";
import {
  MonapartyResponse,
  MonapartyRPCError,
  RPCCaller,
  RPCResponse,
} from "./interfaces/rpc_caller";
import { JaysonRPCCaller } from "./jayson_rpc";

export class MonapartyClient {
  constructor(
    private endpoint: string,
    private rpcCaller: RPCCaller = new JaysonRPCCaller(endpoint)
  ) {}

  async callCounterpartyd(
    method: string,
    params: any,
    id = 1
  ): Promise<RPCResponse> {
    return this.rpcCaller.call({
      method: "proxy_to_counterpartyd",
      params: {
        method,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        params,
      },
      id,
    });
  }

  /**
   * Create send transaction of asset.
   * @param sourceAddress Source monacoin address
   * @param destAddress Destination monacoin address
   * @param assetName Asset name to be send
   * @param quantity Quantity of asset in satoshi
   * @returns Raw send_asset transaction in hex format
   */
  async createSend(
    sourceAddress: string,
    destAddress: string,
    assetName: string,
    quantity: number
  ): Promise<string> {
    const result = await this.callCounterpartyd("create_send", {
      source: sourceAddress,
      destination: destAddress,
      asset: assetName,
      quantity,
    });

    if (typeof result.result !== "string") {
      const message = (result.error as MonapartyRPCError).data.message;
      throw new Error("Error while asset send: " + message);
    }
    return result.result;
  }

  getRandom = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  async createNFT(
    sourceAddress: string,
    description: string,
    assetGroup: string
  ): Promise<string> {
    // create nft
    const result = await this.callCounterpartyd("create_issuance", {
      source: sourceAddress,
      quantity: 1,
      asset: assetGroup,
      fungible: false,
      divisible: false,
      description: description,
      listed: true,
      reassignable: true,
    });

    if (typeof result.result !== "string") {
      const message = (result.error as MonapartyRPCError).data.message;
      throw new Error(`Error while create nft: ${message}`);
    }
    return result.result;
  }

  async isAssetFound(assetName: string): Promise<boolean> {
    const result = await this.rpcCaller.call({
      method: "get_assets_info",
      params: {
        assetsList: [assetName],
      },
    });

    if (Array.isArray(result) && result.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  async getAssetInfo(assetName: string): Promise<null | AssetInfo> {
    const result = await this.rpcCaller.call({
      method: "get_assets_info",
      params: {
        assetsList: [assetName],
      },
    });

    if (!("result" in result)) {
      return null;
    }

    const body = result.result;

    if (Array.isArray(body)) console.log(body.length);

    if (Array.isArray(body) && body.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return body[0];
    } else {
      console.log("Asset empty");
      return null;
    }
  }

  async getNormalizedBalances(
    addresses: string[]
  ): Promise<NormalizedBalance[]> {
    const { result } = await this.rpcCaller.call({
      method: "get_normalized_balances",
      params: { addresses },
    });

    const addressBalances = result as NormalizedBalance[];
    return addressBalances;
  }

  async getAddressBalances(addresses: string[]): Promise<AddressBalance[]> {
    const balance = await this.getNormalizedBalances(addresses);
    return balance.reduce<AddressBalance[]>((e, b) => {
      // Find address
      const addressBalance = e.find((x) => x.address == b.address);
      if (addressBalance) {
        addressBalance.balances.push(b as Balance); // Push to balance if already found
      } else {
        e.push({ address: b.address, balances: [b as Balance] }); // Push new addressBalance if not found
      }
      return e;
    }, []);
  }

  async getAddressBalance(
    address: string
  ): Promise<AddressBalance | undefined> {
    return (await this.getAddressBalances([address])).pop();
  }

  getEndpoint(): string {
    return this.endpoint;
  }
}

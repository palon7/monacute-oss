export interface UTXO {
  txid: string;
  amount: number;
  confirmations: number;
  ts: number;
  address: string;
  confirmationsFromCache: boolean;
  vout: number;
}

export interface AddressInfo {
  addr: string;
  block_height: number;
  info: {
    balanceSat: number;
    unconfirmedBalanceSat: number;
    addrStr: string;
    unconfirmedBalance: number;
    balance: number;
  };
  last_txns: string[];
  uxtos: UTXO[];
}

export interface Balance {
  asset: string;
  quantity: number;
  asset_longname?: string;
  owner: boolean;
  normalized_quantity: number;
}

export interface NormalizedBalance extends Balance {
  address: string;
}

export interface AddressBalance {
  address: string;
  balances: Balance[];
}

export interface AssetInfo {
  assetgroup: string | null;
  supply: number;
  asset: string;
  issuer: string | null;
  listed: boolean;
  asset_longname: string | null;
  locked: boolean;
  fungible: boolean;
  vendable: boolean;
  reassignable: boolean;
  owner: string | null;
  divisible: boolean;
  description: string;
}

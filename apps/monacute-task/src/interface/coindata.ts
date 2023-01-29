import { Network } from "bitcoinjs-lib";

export interface CoinData {
  name: string;
  network: Network;
  bip44: number;
}

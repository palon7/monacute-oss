import * as bitcoin from "bitcoinjs-lib";
import { coinData } from "./util/constant";
import { Wallet } from "./wallet";

export class WalletWIF extends Wallet {
  signer: bitcoin.ECPair.Signer;

  constructor(wif: string) {
    super();
    this.signer = bitcoin.ECPair.fromWIF(wif, coinData.network);
  }

  getSigner = (): bitcoin.ECPair.Signer => this.signer;

  getAddress = (): string => {
    const payment = bitcoin.payments.p2pkh({
      pubkey: this.signer.publicKey,
      network: coinData.network,
    });
    if (!payment.address) throw new Error("Failed to get address from WIF");
    return payment.address;
  };
}

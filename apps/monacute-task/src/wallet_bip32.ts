import * as bitcoin from "bitcoinjs-lib";
import { BIP32Interface } from "bitcoinjs-lib";
import * as bip39 from "bip39";
import * as bip32 from "bip32";
import { coinData } from "./util/constant";
import { Wallet } from "./wallet";
import { getLastAddressIndex } from "./model/address";
import { Address } from ".prisma/client";

export class WalletBIP32 extends Wallet {
  private root: BIP32Interface;

  private addressPath: { [key: string]: string } = {};

  private gapLimit = 20;

  constructor(mnemonic: string) {
    super();
    // Create BIP32 root from seed
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    this.root = bip32.fromSeed(seed, coinData.network);
  }

  // Get address from BIP44 path.
  getAddressFromPath = (path: string): undefined | string =>
    this.getPaymentFromPath(path).address;

  private getPaymentFromPath = (path: string) => {
    const child = this.root.derivePath(path);
    return bitcoin.payments.p2pkh({
      pubkey: child.publicKey,
      network: coinData.network,
    });
  };

  getSigner = (addressIndex: number, accountIndex = 0): bitcoin.ECPair.Signer =>
    this.root.derivePath(this.createPath(accountIndex, addressIndex));

  private createPath = (
    accountIndex: number,
    addressIndex: number,
    change = false,
    purpose = 44
  ) => {
    const changeIndex = change ? 1 : 0;
    // electrum default format
    return `m/${changeIndex}/${addressIndex}`;
  };

  getPubKey = (): string => this.root.neutered().toBase58();

  getWIF = (addressIndex: number, change = false) =>
    this.root.derivePath(this.createPath(0, addressIndex, change)).toWIF();

  getAddress = (addressIndex: number, change = false): string => {
    const address = this.getAddressFromPath(
      this.createPath(0, addressIndex, change)
    );
    return this.stripResult(address, "Failed to get address");
  };

  getNewAddress = async (): Promise<Address> => {
    const newIndex = (await getLastAddressIndex()) + 1;
    return {
      id: 0,
      address: this.getAddress(newIndex),
      addressIndex: newIndex,
      isChange: false,
    };
  };
}

import * as bitcoin from "bitcoinjs-lib";
import { broadcast, createSendTransaction } from "./util/api/electrum";
import { coinData } from "./util/constant";
import { logger } from "./util/logger";

export abstract class Wallet {
  // Process undefined|string value and strip to string, or raise error
  protected stripResult = (
    value: undefined | string,
    error = "Error while processing wallet"
  ): string => {
    if (typeof value === "undefined") {
      throw new Error(error);
    } else {
      return value;
    }
  };

  // prettier-ignore
  constructor() {
    ;
  }

  send = async (
    address: string,
    satoshis: number,
    utxo: string,
    utxoPos: number,
    signer: bitcoin.ECPair.Signer
  ): Promise<string> => {
    const unsignedTx = await createSendTransaction(
      address,
      satoshis,
      utxo,
      utxoPos
    );
    const signedTx = await this.signPSBT(unsignedTx, signer);
    const txId = await broadcast(signedTx);
    logger.info({ txid: txId }, `TX broadcasted`);
    return txId;
  };

  sign = (
    unsignedTx: string, // Hex formatted transaction
    signer: bitcoin.ECPair.Signer
  ): string => {
    const tx = bitcoin.Transaction.fromHex(unsignedTx);
    const txb = bitcoin.TransactionBuilder.fromTransaction(
      tx,
      coinData.network
    );
    // logger.trace({ tx }, "Signing Normal TX");
    tx.ins.forEach((output, index) => {
      txb.sign(index, signer);
    });

    return txb.build().toHex();
  };

  signPSBT = async (
    unsignedTx: string, // Hex formatted transaction
    signer: bitcoin.ECPair.Signer
  ): Promise<string> => {
    const tx = bitcoin.Psbt.fromBase64(unsignedTx, {
      network: coinData.network,
    });
    logger.trace({ unsignedTx }, "Signing PSBT");
    await tx.signAllInputsAsync(signer);
    tx.validateSignaturesOfInput(0);
    tx.finalizeAllInputs();
    return tx.extractTransaction().toHex();
  };
}

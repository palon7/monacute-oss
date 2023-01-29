/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import axios from "axios";
import { Decimal } from "decimal.js";
import * as bitcoin from "bitcoinjs-lib";
import { Transaction } from "bitcoinjs-lib";
import { Input } from "bitcoinjs-lib/types/transaction.d";
import {
  ElectrumUTXO,
  ElectrumInfo,
  ElectrumTxStatus,
} from "../../interface/electrum";
import { RPCResponse } from "../../interface/rpc";

import { UTXO } from "../../interface/blockchain";
import { coinData, refundFee } from "../constant";
import { RPCClient } from "./rpc";
import { logger } from "../logger";

interface ElectrumRPCResponse extends RPCResponse {
  result: ElectrumUTXO[] | ElectrumInfo | string;
}

const coins: Decimal = new Decimal("0.00000001");

const electrumAxios = axios.create({
  auth: {
    username: process.env.ELECTRUM_USERNAME || "electrum",
    password: process.env.ELECTRUM_PASSWORD || "password",
  },
});

const rpc = new RPCClient(
  electrumAxios,
  process.env.ELECTRUM_ENDPOINT || "http://electrum-mona:7000"
);

const isUTXOArray = (arg: any): arg is ElectrumUTXO[] =>
  arg !== null && Array.isArray(arg) && arg.length > 0 && "height" in arg[0];

const isInfo = (arg: any): arg is ElectrumInfo =>
  arg !== null && "blockchain_height" in arg;

const isTxStatus = (arg: any): arg is ElectrumTxStatus =>
  arg !== null && "confirmations" in arg;

export const createSendTransaction = async (
  address: string,
  satoshis: number,
  utxo: string,
  utxoPos: number
): Promise<string> => {
  const amount = new Decimal(satoshis).mul(coins).toString();
  const { result } = await rpc.call("payto", {
    destination: address,
    amount,
    unsigned: true,
    from_coins: `${utxo}:${utxoPos}`,
    feerate: 120,
  });
  if (typeof result !== "string")
    throw Error("create send tx return unknown data");
  return result;
};

export const getInputAddressFromTxInputs = async (
  inputs: Input[]
): Promise<string[]> => {
  // batch rpc call list
  /*
  const callList = inputs.ins.map(
    (input, index): RPCCall => ({
      id: index,
      method: "gettransaction",
      params: {
        txid: input.hash.reverse().toString("hex"),
      },
    })
  );
  */

  const results = await Promise.all(
    inputs.map((txid, index) =>
      rpc.call(
        "gettransaction",
        { txid: txid.hash.reverse().toString("hex") },
        index
      )
    )
  );

  // parse all tx addresses
  const addresses = results.map((result) => {
    if (typeof result.result !== "string")
      throw new Error("could not retrive tx info");

    const tx = Transaction.fromHex(result.result);
    const vout = inputs[result.id].index;
    const address = bitcoin.address.fromOutputScript(
      tx.outs[vout].script,
      coinData.network
    );
    return address;
  });
  return [...new Set(addresses)];
};

export const broadcast = async (txHex: string): Promise<string> => {
  const { result } = await rpc.call("broadcast", { tx: txHex });
  if (typeof result !== "string") throw new Error("Broadcast failed");
  return result;
};

export const loadWallet = async (): Promise<void> => {
  try {
    const result = await rpc.call("load_wallet", {});
    if (result.error) logger.warn(result.error);
    if (result.result) logger.info("Wallet loaded");
  } catch (e) {
    logger.error({ exception: e });
  }
};

export const getInputAddresses = async (
  inputs: Transaction
): Promise<string[]> => getInputAddressFromTxInputs(inputs.ins);

export const getFirstInputAddress = async (
  inputs: Transaction
): Promise<string> => {
  const addresses = await getInputAddressFromTxInputs([inputs.ins[0]]);
  if (addresses.length !== 1) throw Error("Get first input address failed");
  return addresses[0];
};

export const getTransactionInfo = async (
  txid: string
): Promise<bitcoin.Transaction> => {
  const { result } = await rpc.call("gettransaction", { txid });
  if (typeof result !== "string") throw Error("could not retrive tx info");
  const tx = Transaction.fromHex(result);
  return tx;
};

export const getTxConfirmCount = async (txid: string): Promise<number> => {
  const { result } = await rpc.call("get_tx_status", { txid });
  if (!isTxStatus(result)) throw Error("could not retrive tx status");

  return result.confirmations;
};

export const getUTXO = async (address: string): Promise<UTXO[]> => {
  const { result: rawUTXO } = await rpc.call("getaddressunspent", {
    address,
  });
  const { result: info } = await rpc.call("getinfo", {}); // Height of current blockchain

  if (!isInfo(info)) {
    throw new Error("Failed to getinfo");
  }

  if (!isUTXOArray(rawUTXO)) {
    if (Array.isArray(rawUTXO)) {
      // Just no utxo
      return [];
    }
    throw new Error("Failed to get utxo");
  }

  // Calculate confirm for all transaction
  const utxo: UTXO[] = rawUTXO.map((_x) => ({
    confirm: info.blockchain_height - _x.height + 1,
    height: _x.height,
    txHash: _x.tx_hash,
    txPos: _x.tx_pos,
    value: _x.value,
  }));
  return utxo;
};

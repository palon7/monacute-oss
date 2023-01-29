/* eslint-disable no-continue */
import { Address, Auction, TransactionStatus } from ".prisma/client";
import { AuctionData, AuctionUTXO } from "../interface/auction";
import { getAuctions } from "../model/auction";

import {
  markAuctionPurchased,
  isAuctionActive,
  auctionPrice,
} from "../service/auction";
import {
  getFirstInputAddress,
  getTransactionInfo,
  getUTXO,
} from "../util/api/electrum";
import { wallet } from "../wallet_manager";
import {
  bidMinimumConfirmCount,
  refundFee,
  refundThreshold,
} from "../util/constant";
import {
  createProcessedTransaction,
  getProcessedTransaction,
} from "../model/processed_transaction";
import { UTXO } from "../interface/blockchain";
import { getLogger } from "../util/logger";
import { notifySlack } from "../util/slack";
import { createTweet } from "../util/twitter";
import { satoshiToDecimal } from "../util/coinutil";
import { getMonacuteByAuction, getUnusedMonacute } from "../model/monacute";

const procesedTransactions = new Set<string>();
const logger = getLogger("watchAuction");

// Check if bid transaction is valid
const bidValid = (
  auction: Auction,
  price: number,
  currentPrice: number
): boolean => {
  // const currentDate = new Date(Date.parse("2021-10-01 13:00Z+0900")); // for test
  const currentDate = new Date();
  const { purchased, startTime, endTime } = auction;

  return (
    !purchased && // is not purchased?
    currentPrice <= price && // is valid price?
    isAuctionActive(currentDate, startTime, endTime) // is auction time active?
  );
};

export const markTransactionProccessed = async (
  address: Address,
  senderAddress: string,
  txid: string,
  status: TransactionStatus,
  assetId?: string
): Promise<void> => {
  procesedTransactions.add(txid);
  await createProcessedTransaction(
    address,
    senderAddress,
    txid,
    status,
    assetId
  );
};

// Check if transaction is already processed
const isAlreadyProcessed = async (txid: string) => {
  // check in memory
  if (procesedTransactions.has(txid)) {
    return true;
  }

  // query db
  if (await getProcessedTransaction(txid)) {
    procesedTransactions.add(txid);
    return true;
  }

  // miss
  return false;
};

// Sendback asset to sender, mark auction as purchased
const onValidBid = async (
  senderAddress: string,
  auction: AuctionData,
  utxo: UTXO,
  price: number
) => {
  // Send asset here
  logger.info({ txid: utxo.txHash }, `valid bid. set purchased flag...`);
  // await sendBackAsset(senderAddress, auction);
  // TODO: If bid too high, kindly notice here
  if (utxo.value > price) {
    logger.warn(
      { suggest_action: true },
      "bid too high. consider refund to sender"
    );

    // post to slack
    await notifySlack(
      `Notice: Too high bid on #${auction.id}: ${utxo.value} > ${price}`,
      "auction"
    );
  }
  // log transaction
  await markTransactionProccessed(
    auction.address,
    senderAddress,
    utxo.txHash,
    "UNPROCESSED",
    auction.asset.id
  );
  // log bid price
  await markAuctionPurchased(auction, price);

  // post to slack
  await notifySlack(
    `Auction #${
      auction.id
    } is purchased by ${senderAddress} for ${satoshiToDecimal(price)} MONA!`,
    "auction"
  );

  const monacute = await getMonacuteByAuction(auction);
  if (!monacute) {
    logger.error("Associated monacute not found");
    return;
  }

  // twitter notify
  await createTweet(
    `Monacute #${monacute.number} 「${
      monacute.name || ""
    }」は ${satoshiToDecimal(price)} MONAで落札されました！ ${
      process.env.ROOT_URL || ""
    }/auctions/${
      auction.id
    }?utm_source=twitter&utm_medium=social&utm_campaign=auction-bid #monacute`
  );
};

// Refund invalid bid
const onInvalidBid = async (
  senderAddress: string,
  auction: AuctionData,
  utxo: UTXO
) => {
  if (utxo.value > refundThreshold) {
    // refund
    logger.info({ senderAddress, utxo }, "Refunding invalid bid");
    const refundTxid = await wallet.send(
      senderAddress,
      utxo.value - refundFee,
      utxo.txHash,
      utxo.txPos,
      wallet.getSigner(auction.address.addressIndex)
    );
    // log to db
    await markTransactionProccessed(
      auction.address,
      senderAddress,
      utxo.txHash,
      "REFUND_COIN"
    );
    logger.info({ txid: utxo.txHash, refundTxid }, "Refund complete");
    // post to slack
    await notifySlack(
      `Refund invalid bid on #${auction.id} by ${senderAddress}`,
      "auction"
    );
  } else {
    logger.info({ txid: utxo.txHash }, "Ignore due to small amount");
    // log to db
    await markTransactionProccessed(
      auction.address,
      senderAddress,
      utxo.txHash,
      "TOO_SMALL"
    );
    // post to slack
    await notifySlack(
      `Ignore invalid bid on #${auction.id} by ${senderAddress} due to small amount`,
      "auction"
    );
  }
};

// return true if auction is purchased
const processUTXO = async (
  auction: AuctionData,
  utxo: UTXO,
  currentPrice: number
): Promise<boolean> => {
  // skip if already set
  if (await isAlreadyProcessed(utxo.txHash)) {
    return false;
  }
  // skip if unconfirmed
  if (utxo.height <= 0) {
    logger.trace(
      { auction: auction.id, utxo: utxo.txHash },
      "Unconfirmed. skip."
    );
    return false;
  }
  // require minumum confirm
  // TODO: mark as send, send asset when enough confirm
  if (utxo.confirm < bidMinimumConfirmCount) {
    logger.debug(
      { auction: auction.id, utxo: utxo.txHash, conf: utxo.confirm },
      "Waiting for confirm. skip."
    );
    return false;
  }

  // get sender address
  const senderAddress = await getFirstInputAddress(
    await getTransactionInfo(utxo.txHash)
  );

  logger.info(
    { senderAddress, auction: auction.id, utxo: utxo.txHash },
    "Processing UTXO"
  );

  // check auction active
  if (bidValid(auction, utxo.value, currentPrice)) {
    await onValidBid(senderAddress, auction, utxo, currentPrice);
    return true;
  }

  await onInvalidBid(senderAddress, auction, utxo);
  return false;
};

const listAuctionUTXO = (auctions: AuctionData[]): AuctionUTXO[] => {
  const utxoLists: AuctionUTXO[] = [];

  auctions.forEach((auction) => {
    if (auction.address.address) {
      try {
        const list = getUTXO(auction.address.address);
        utxoLists.push({
          auction,
          utxos: list,
        });
      } catch (e) {
        logger.error({ auction_id: auction.id }, "Failed to get utxo");
        if (e instanceof Error) {
          logger.error(`Message: ${e.message}`);
        }
      }
    }
  });

  return utxoLists;
};

export const watchAuctionsTask = async (): Promise<void> => {
  const auctions = await getAuctions();
  const utxoLists = listAuctionUTXO(auctions); // get utxo for auction

  for await (const ac of utxoLists) {
    const utxos = await ac.utxos;
    const currentTime = new Date();
    const { startTime, endTime, startPrice, endPrice } = ac.auction;

    // Get Price
    const currentPrice = auctionPrice(
      currentTime,
      startTime,
      endTime,
      Number(startPrice),
      Number(endPrice)
    );
    /*
    logger.trace(
      {
        price: satoshiToDecimal(currentPrice),
        priceStart: Number(startPrice),
        startTime,
        endTime,
      },
      "Checking auction"
    );
    */

    for await (const utxo of utxos) {
      try {
        const bidComplete = await processUTXO(ac.auction, utxo, currentPrice);
        if (bidComplete) break; // break if bid complete, check other utxo next time
      } catch (e) {
        logger.error(e, "Error while processing UTXO");
      }
    }
  }
};

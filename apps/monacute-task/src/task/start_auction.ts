import { add, addHours } from "date-fns";
import { prisma } from "../util/database";
import { Auction } from ".prisma/client";
import { addAuction, getLastPrices } from "../model/auction";
import {
  getSaleReadyMonacute,
  refreshMonacuteAuctionCount,
  getMonacuteByAuction,
} from "../model/monacute";
import { satoshiToDecimal } from "../util/coinutil";
import {
  gen0FirstPrice,
  satoshiPerCoin,
  startAuctionAfterUnixtime,
} from "../util/constant";
import { ceilMinute } from "../util/time";
import { NotEnoughMonacuteError } from "../error/monacute_error";
import { logger } from "../util/logger";
import { ceilSatoshiAt } from "../util/mathutil";
import { notifySlack } from "../util/slack";
import { createTweet } from "../util/twitter";

// return auction price in satoshi
export async function getPrice(): Promise<number> {
  const lastPrices = await getLastPrices();

  // return gen0price if not enough auctions
  if (lastPrices.length < 5) {
    return gen0FirstPrice;
  }

  // convert bigint to number
  const prices = lastPrices.map((price) => Number(price));
  // calculate average
  const average = Math.ceil(
    (prices.reduce((a, b) => a + b, 0) / prices.length) * 1.5
  );
  // average in satoshi
  return Math.max(ceilSatoshiAt(average, 2), 1 * satoshiPerCoin);
}

export async function addNextAuction(
  _startTime: Date,
  durationHour: number
): Promise<void> {
  const startPrice = await getPrice();
  logger.info(`Start price: ${startPrice}`);
  const asset = await getSaleReadyMonacute();
  if (asset.assetId === null) throw new Error("AssetID is null");

  const startTime = ceilMinute(_startTime, 15);
  const endTime = addHours(startTime, durationHour);

  await addAuction({
    startTime,
    endTime,
    startPrice,
    endPrice: 0.01 * satoshiPerCoin,
    assetName: asset.assetId,
  });
  logger.info("Auction added to DB");
  await refreshMonacuteAuctionCount(asset);
  await notifySlack(`Auction added: ${asset.assetId}`);
}

async function checkAuctionStart(): Promise<void> {
  const currentTime = new Date();

  const auction = await prisma.auction.findFirst({
    where: {
      startTime: {
        gte: add(currentTime, { minutes: -5 }),
        lte: add(currentTime, { minutes: 5 }),
      },
    },
    include: { asset: true },
  });

  if (auction) {
    const monacute = await getMonacuteByAuction(auction);
    if (!monacute) return;

    await createTweet(
      `Monacute #${monacute.number} 「${
        monacute.name || ""
      }」のオークションがはじまりました！ ${
        process.env.ROOT_URL || ""
      }/auctions/${
        auction.id
      }?utm_source=twitter&utm_medium=social&utm_campaign=auction-start #monacute`
    );
    logger.info("Auction tweet posted");
  } else {
    logger.warn("No auction found!");
  }
}

// start auction in next day
export async function startAuctionTask(): Promise<void> {
  try {
    // return if not auction time
    if (startAuctionAfterUnixtime > Date.now()) {
      logger.info("Auction is not started. skip.");
      return;
    }

    logger.info("Creating auction");
    const startTime = addHours(new Date(), 24);
    await addNextAuction(
      startTime,
      parseInt(process.env.AUCTION_DURATION_HOUR || "72", 10)
    );
    await checkAuctionStart();
  } catch (e) {
    if (e instanceof NotEnoughMonacuteError) {
      logger.error(e.message);
    } else {
      throw e;
    }
  }
}

import { Auction } from "@prisma/client";
import { updateAuction } from "../model/auction";
import { decimalToSatoshi, satoshiToDecimal } from "../util/coinutil";
import { auctionPriceInterval } from "../util/constant";
import { ceilSatoshiAt } from "../util/mathutil";
import { floorMinute } from "../util/time";

const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);

/**
 * Mark auction purchased and record bid price.
 * @param auction Auction for mark puchased
 * @param bidPrice Bid price
 */
export const markAuctionPurchased = async (
  auction: Auction,
  bidPrice: number
): Promise<void> => {
  await updateAuction(auction, { bidPrice, purchased: true });
};

/**
 * Return auction active
 * @param timeAt Date of given time
 * @param startTime State time of auction
 * @param endTime End time of auction
 * @returns Auction active or not
 */
export const isAuctionActive = (
  timeAt: Date,
  startTime: Date,
  endTime: Date
): boolean =>
  timeAt.getTime() > startTime.getTime() &&
  timeAt.getTime() < endTime.getTime();

/**
 * Get auction price at given time.
 * @param at Date of given time
 * @param startDate Start date of auction
 * @param endDate End date of auction
 * @param startPrice Start price of auction
 * @param endPrice end price of auction
 * @returns Price at given time
 */
export const auctionPrice = (
  at: Date,
  startDate: Date,
  endDate: Date,
  startPrice: number,
  endPrice: number
): number => {
  const nowTime = floorMinute(at, auctionPriceInterval).getTime();
  const multiplier = clamp(
    (endDate.getTime() - nowTime) / (endDate.getTime() - startDate.getTime()),
    0,
    1
  );

  return Math.max(
    ceilSatoshiAt(endPrice + (startPrice - endPrice) * multiplier, 2),
    decimalToSatoshi(0.01)
  );
};

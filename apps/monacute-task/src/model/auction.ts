import { Auction } from "@prisma/client";
import {
  AuctionData,
  AuctionDataParam,
  UpdateAuction,
} from "../interface/auction";
import {
  checkAuctionAfterDays,
  checkAuctionBeforeDays,
} from "../util/constant";
import { wallet } from "../wallet_manager";
import { prisma } from "../util/database";

const dateAt = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

export const addAuction = async (auction: AuctionDataParam): Promise<void> => {
  // create address
  const { startPrice, endPrice, startTime, endTime, assetName } = auction;
  // get monacute
  const monacute = await prisma.monacute.findFirst({
    where: { assetId: assetName },
  });
  if (!monacute) {
    throw new Error("Monacute not found");
  }

  // create auction
  const address = await wallet.getNewAddress();
  await prisma.auction.create({
    data: {
      startPrice,
      endPrice,
      startTime,
      endTime,
      address: {
        create: {
          address: address.address,
          addressIndex: address.addressIndex,
          isChange: false,
        },
      },
      asset: { connect: { id: assetName } },
    },
  });
};

export const getAuctions = async (): Promise<AuctionData[]> => {
  const startDate = dateAt(checkAuctionBeforeDays);
  const endDate = dateAt(-checkAuctionAfterDays);

  const auction = await prisma.auction.findMany({
    where: {
      startTime: {
        lt: startDate,
      },
      endTime: {
        gte: endDate,
      },
    },
    include: { address: true, asset: true },
  });
  return auction;
};

export const getLastPrices = async (): Promise<bigint[]> => {
  const auction = await prisma.auction.findMany({
    where: {
      purchased: true,
    },
    orderBy: {
      id: "desc",
    },
    select: {
      bidPrice: true,
    },
    take: 5,
  });
  return auction.map((a) => {
    if (a.bidPrice === null) throw new Error("Bid price is null");
    return a.bidPrice;
  });
};

export const updateAuction = async (
  auction: Auction,
  data: UpdateAuction
): Promise<void> => {
  await prisma.auction.update({
    where: {
      id: auction.id,
    },
    data,
  });
};

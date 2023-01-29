import { Monacute, Auction } from ".prisma/client";
import { prisma } from "../util/database";
import { gen0Limit } from "../util/constant";
import { CreateMonacute, PublishMonacute } from "../interface/monacute";
import { NotEnoughMonacuteError } from "../error/monacute_error";
import { addAsset } from "./asset";

export const GetGen0MonacuteCount = async (): Promise<number> =>
  prisma.monacute.count({
    where: {
      generation: 0,
    },
  });

export const getNextNumber = async (): Promise<number> => {
  const monacute = await prisma.monacute.findFirst({
    orderBy: [{ number: "desc" }],
  });

  if (monacute) {
    return monacute.number + 1;
  }
  return 1;
};

export const createMonacute = async (
  monacute: CreateMonacute,
  limit = gen0Limit
): Promise<Monacute> => {
  if ((await GetGen0MonacuteCount()) >= limit)
    throw new Error("Monacute limit exceeded");

  return prisma.monacute.create({
    data: monacute,
  });

  // TODO: Taskキューに投げる
};

export const setMonacutePublished = async (
  monacute: Monacute
): Promise<Monacute> =>
  prisma.monacute.update({
    where: { id: monacute.id },
    data: { published: true },
  });

export const refreshMonacuteAuctionCount = async (
  monacute: Monacute
): Promise<Monacute> => {
  const auctionCount = await prisma.auction.count({
    where: {
      asset: {
        monacute: {
          id: monacute.id,
        },
      },
    },
  });

  return prisma.monacute.update({
    where: { id: monacute.id },
    data: { auctionCount },
  });
};
export const setMonacuteAssetId = async (
  monacuteId: number,
  assetId: string,
  assetOwner: string
): Promise<Monacute> =>
  prisma.monacute.update({
    where: { id: monacuteId },
    data: {
      published: true,
      asset: {
        create: {
          id: assetId,
          assetOwner,
        },
      },
    },
  });

export const getMonacuteByAuction = async (
  auction: Auction
): Promise<Monacute | null> => {
  const data = await prisma.monacute.findFirst({
    where: {
      asset: {
        id: auction.assetId,
      },
    },
  });

  if (!data) return null;
  return data;
};

export const getUnusedMonacutes = async (): Promise<Monacute[]> => {
  const monacute = await prisma.monacute.findMany({
    where: {
      name: { not: null },
      imageCid: { not: null },
      cardCid: { not: null },
      published: false,
    },
    orderBy: {
      number: "asc",
    },
  });
  return monacute;
};

export const getUnusedMonacute = async (): Promise<Monacute> => {
  const monacutes = await getUnusedMonacutes();
  if (monacutes.length <= 0) {
    throw new NotEnoughMonacuteError("No unused monacute found");
  }
  return monacutes[0];
};

export const getSaleReadyMonacute = async (
  maxAuctionCount = 0
): Promise<Monacute> => {
  const monacutes = await prisma.monacute.findMany({
    where: {
      published: true,
      asset: {
        isNot: null,
      },
      auctionCount: {
        lte: maxAuctionCount,
      },
    },
    orderBy: {
      number: "asc",
    },
  });
  if (monacutes.length <= 0) {
    throw new NotEnoughMonacuteError("No ready to sale monacute found");
  }
  return monacutes[0];
};

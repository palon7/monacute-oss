import { MpAsset } from "@prisma/client";
import { prisma } from "../util/database";

const existAssetNames = new Set<string>();

export const addAsset = async (
  name: string,
  assetOwner: string
): Promise<void> => {
  // create asset
  await prisma.mpAsset.create({
    data: {
      id: name,
      assetOwner,
    },
  });
  // add to list
  existAssetNames.add(name);
};

export const getAssets = async (assetOwner?: string): Promise<MpAsset[]> => {
  const asset = await prisma.mpAsset.findMany({
    where: assetOwner ? { assetOwner } : {},
  });
  return asset;
};

export const isAssetExistDB = async (name: string): Promise<boolean> => {
  if (existAssetNames.has(name)) return true; // Return from cache

  const asset = await prisma.mpAsset.findMany({
    where: {
      id: name,
    },
  });

  const assetExists = asset.length > 0;
  if (assetExists) existAssetNames.add(name); // Add name if hit

  return asset.length > 0;
};

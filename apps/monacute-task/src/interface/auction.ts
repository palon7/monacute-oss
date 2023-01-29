import { Address, Auction, MpAsset } from "@prisma/client";
import { UTXO } from "./blockchain";

export interface AuctionData extends Auction {
  address: Address;
  asset: MpAsset;
}

export interface AuctionDataParam {
  startPrice: number;
  endPrice: number;
  startTime: Date;
  endTime: Date;
  assetName: string;
  bidPrice?: number;
  purchased?: boolean;
}

export interface UpdateAuction {
  startPrice?: number;
  endPrice?: number;
  startTime?: Date;
  endTime?: Date;
  assetName?: string;
  assetOwner?: string;
  bidPrice?: number;
  purchased?: boolean;
}

export interface AuctionUTXO {
  auction: AuctionData;
  utxos: Promise<UTXO[]>;
}

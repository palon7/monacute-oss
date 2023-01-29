import { GetCoinData } from "./coindata";

export const productionMode = process.env.PRODUCTION_MODE === "true";
// Coin name of bitcoinjs
export const coinName = productionMode ? "MONA" : "MONA-TEST";

export const satoshiPerCoin = 100_000_000;
export const coinData = GetCoinData(coinName);

// Interval between auction price drops
export const auctionPriceInterval = parseInt(
  process.env.AUCTION_PRICE_INTERVAL || "15",
  10
);

// Fee for refund coin
export const refundFee = satoshiPerCoin * 0.005;
// Minimum mona amount to refund
export const refundThreshold = satoshiPerCoin * 0.01;

// Watch for the auction address to start within x days to make a refund
export const checkAuctionBeforeDays = 1;
// Watch for the auction address to end within x days to make a refund
export const checkAuctionAfterDays = 3;

export const startAuctionAfterUnixtime = parseInt(
  process.env.START_AUCTION_AFTER || "0",
  10
);
export const startPublishAfterUnixtime = parseInt(
  process.env.START_PUBLISH_AFTER || "0",
  10
);

// Limit for generated cards
export const gen0Limit = 365;
export const gen0FirstPrice =
  parseFloat(process.env.GEN0_FIRST_PRICE || "10") * satoshiPerCoin;

export const NFTAssetGroup = process.env.ASSET_GROUP || "Opencute";
export const NFTDescription = "自動生成NFTのOpencuteです。";
export const minimumConfirmCount = parseInt(process.env.MIN_CONF || "40", 10);
export const bidMinimumConfirmCount = parseInt(
  process.env.BID_MIN_CONF || "1",
  10
);

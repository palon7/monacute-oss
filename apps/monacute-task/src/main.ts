import * as cron from "node-cron";
import { prisma } from "./util/database";
import { wallet } from "./wallet_manager";
import { watchAuctionsTask } from "./task/watch_auction";
import { scanAssetTask } from "./task/scan_asset";
import { logger } from "./util/logger";
import {
  gen0FirstPrice,
  productionMode,
  startAuctionAfterUnixtime,
  startPublishAfterUnixtime,
} from "./util/constant";
import { publishCardTask } from "./task/publish_card";
import { generateCardTask } from "./task/generate_card";
import { startAuctionTask } from "./task/start_auction";
import { refreshMonacuteAuctionCount } from "./model/monacute";
import { watchTransaction } from "./task/watch_transaction";
import { loadWallet } from "./util/api/electrum";
import { notifySlack } from "./util/slack";

const version = process.env.npm_package_version || "Unknown";

logger.info(`monacute-task ver. ${version} loaded.`);
logger.info({ wallet_public_key: wallet.getPubKey() });

if (productionMode) {
  logger.info("Production mode");
} else {
  logger.info("Development mode");
  logger.debug(`GEN0 Price:${gen0FirstPrice}`);
}

// setup cron task
const cronOption = { timezone: "Asia/Tokyo" };

// Publish card
cron.schedule(
  "0 0 * * *",
  async () => {
    // every 24 hours
    await publishCardTask();
  },
  cronOption
);

// Generate card
cron.schedule(
  "30 0 * * *",
  async () => {
    // every 24 hours
    await generateCardTask();
  },
  cronOption
);

// scan asset
cron.schedule(
  "*/5 * * * *",
  async () => {
    // every 5 minute
    await scanAssetTask();
  },
  cronOption
);

// start auction every day at 00:00
cron.schedule(
  "0 0 * * *",
  async () => {
    // every day
    await startAuctionTask();
  },
  cronOption
);

// TODO
async function updateAllMonacuteAuctionCount() {
  const monacutes = await prisma.monacute.findMany({
    where: {
      published: true,
    },
  });
  for (const monacute of monacutes) {
    // eslint-disable-next-line no-await-in-loop
    await refreshMonacuteAuctionCount(monacute);
  }
}

async function main() {
  await notifySlack(`${version} Started`);
  if (startPublishAfterUnixtime > Date.now()) {
    logger.info(
      `Publish monacard not activated. Start from ${new Date(
        startPublishAfterUnixtime
      ).toISOString()}`
    );
  }

  if (startAuctionAfterUnixtime > Date.now()) {
    logger.info(
      `Auction not activated. Start from ${new Date(
        startAuctionAfterUnixtime
      ).toISOString()}`
    );
  }
}

// Watch auction loop
setInterval(() => {
  watchAuctionsTask().catch((e) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    logger.error(e, "Error while watchAuction");
  });
}, 10000);

// Watch tx loop
setInterval(() => {
  watchTransaction().catch((e) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    logger.error(e, "Error while watchTransaction");
  });
}, 30000);

main().catch((e) => {
  throw e;
});

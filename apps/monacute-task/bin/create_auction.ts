/* eslint-disable import/first */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as argv from "argv";
import * as dotenv from "dotenv";
// prettier-ignore
dotenv.config();

import { addHours, isValid, parseISO } from "date-fns";
import { program } from "commander";
import { addAuction } from "../src/model/auction";
import { decimalToSatoshi } from "../src/util/coinutil";
import { walletAssetOwner } from "../src/wallet_manager";
import { ceilMinute } from "../src/util/time";
import { monaparty } from "../src/util/monaparty";
import { logger } from "../src/util/logger";
import { productionMode } from "../src/util/constant";
import { addNextAuction } from "../src/task/start_auction";
import { NotEnoughMonacuteError } from "../src/error/monacute_error";

async function main({ _startTime }: { _startTime?: string }) {
  // start time must be 15 minutes interval
  const startTime = ceilMinute(
    _startTime ? parseISO(_startTime) : new Date(),
    15
  );

  if (!isValid(startTime)) throw new Error("Date is invalid");

  try {
    logger.info("Creating auction");
    await addNextAuction(
      startTime,
      parseInt(process.env.AUCTION_DURATION_HOUR || "72", 10)
    );
  } catch (e) {
    if (e instanceof NotEnoughMonacuteError) {
      logger.error(e.message);
    }
  }
}

program.requiredOption(
  "-t, --start-time <time>",
  "Start time of auction ISO8601"
);

program.parse(process.argv);

const options = program.opts();

console.log("Adding...");
main({
  _startTime: options.startTime,
}).catch((e) => {
  console.log(e);
  console.log("Failed!");
});

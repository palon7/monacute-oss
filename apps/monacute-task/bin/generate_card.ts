/* eslint-disable no-await-in-loop */
import * as dotenv from "dotenv";
import { generateCardTask } from "../src/task/generate_card";
import { logger } from "../src/util/logger";

dotenv.config();
async function main() {
  if (process.argv.length < 3) {
    logger.error("Usage: generate_card <card_count>");
  } else {
    const cardCount = parseInt(process.argv[2], 10);

    for (let i = 0; i < cardCount; i += 1) {
      await generateCardTask();
    }
    console.log("Done!");
  }
  // await generateCardTask();
}

main().catch((e) => {
  throw e;
});

/* eslint-disable no-await-in-loop */
import { publishCardTask } from "../src/task/publish_card";
import { logger } from "../src/util/logger";

async function main() {
  if (process.argv.length < 3) {
    logger.error("Usage: publish_card <card_count>");
  } else {
    const cardCount = parseInt(process.argv[2], 10);

    for (let i = 0; i < cardCount; i += 1) {
      await publishCardTask();
    }
    console.log("Done!");
  }
  // await generateCardTask();
}

main().catch((e) => {
  throw e;
});

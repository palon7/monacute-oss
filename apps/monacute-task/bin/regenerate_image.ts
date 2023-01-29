/* eslint-disable no-await-in-loop */
import * as dotenv from "dotenv";
import Crypto from "crypto";
import { prisma } from "../src/util/database";
import { PubSubMessageGenerateCard } from "../src/interface/pubsub_message/generate_card";
import { pushMessage } from "../src/util/api/pubsub";

dotenv.config();

async function main() {
  if (process.argv.length < 3) {
    console.error("Usage: renegerate_Image <number>");
    return;
  }
  const number = parseInt(process.argv[2], 10);
  const monacute = await prisma.monacute.findFirst({ where: { number } });
  if (!monacute) {
    console.error(`Monacute not found: ${number}`);
    return;
  }
  if (monacute.published) {
    console.error(`Monacute already published: ${number}`);
    return;
  }

  // update seed
  const seed = Crypto.randomBytes(256);
  await prisma.monacute.update({
    where: { id: monacute.id },
    data: { seed, imageCid: null, dnaUrl: null },
  });
  // push pubsub
  const message = new PubSubMessageGenerateCard(monacute.id);
  await pushMessage(message);

  console.log("Regeration seed done. Run GPU to apply");
  // await generateCardTask();
}

main().catch((e) => {
  throw e;
});

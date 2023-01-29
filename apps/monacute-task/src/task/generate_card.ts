import { PubSubMessageGenerateCard } from "../interface/pubsub_message/generate_card";
import { generateGen0Monacute } from "../service/monacute";
import { pushMessage } from "../util/api/pubsub";
import { getLogger } from "../util/logger";
import { notifySlack } from "../util/slack";

const logger = getLogger("generateCard");

export const generateCardTask = async (): Promise<void> => {
  // TODO
  // Trigger generation

  logger.info("Generating card");
  const generatedMonacute = await generateGen0Monacute();
  const message = new PubSubMessageGenerateCard(generatedMonacute.id);
  await pushMessage(message);
  await notifySlack(`Generated card: ${message.monacuteId}`, "generateCard");
};

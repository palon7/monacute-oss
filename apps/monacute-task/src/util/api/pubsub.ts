import { PubSub } from "@google-cloud/pubsub";
import { PubSubMessage } from "../../interface/pubsub_message/pubsub_message";
import { logger } from "../logger";

const topicName = process.env.PUBSUB_TOPIC || "";
const pubSubClient = new PubSub();

export const pushMessage = async (data: PubSubMessage): Promise<void> => {
  logger.trace({ data, topic: topicName }, "push to pubsub");
  await pubSubClient.topic(topicName).publish(Buffer.from(data.getJSON()));
};

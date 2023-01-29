/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */

import { PubSub } from "@google-cloud/pubsub";
import * as dotenv from "dotenv";

dotenv.config();

const subscriptionName = process.env.PUBSUB_SUBSCRIPTION || "";
const pubSubClient = new PubSub();

const listenMessages = () => {
  const subscription = pubSubClient.subscription(subscriptionName);

  const messageHandler = (message: any) => {
    console.log(`Received message ${message.id}:`);
    console.log(`\tData: ${message.data}`);
    console.log(`\tAttributes: ${message.attributes}`);

    message.ack();
  };

  subscription.on("message", messageHandler);
};

listenMessages();

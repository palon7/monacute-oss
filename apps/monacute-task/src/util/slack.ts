import { IncomingWebhook } from "@slack/webhook";
import { productionMode } from "./constant";
import { logger } from "./logger";

const endpoint = process.env.SLACK_WEBHOOK_URL || "";

const webhook = new IncomingWebhook(endpoint, {
  icon_emoji: ":red_car:",
});
const envHeader = productionMode ? "" : "[DEV]";

export const notifySlack = async (
  message: string,
  _tag?: string | undefined
): Promise<void> => {
  // skip if endpoint not set
  if (endpoint === "") {
    return;
  }
  const tag = _tag ? `task/${_tag}` : "task";

  const messageBody = `${envHeader}[${tag}]: ${message}`;

  await webhook.send({
    text: messageBody,
  });
};

import TwitterApi from "twitter-api-v2";
import { logger } from "./logger";

const twitterEnabled = (): boolean =>
  process.env.TWITTER_API_KEY !== "" &&
  process.env.TWITTER_API_SECRET !== "" &&
  process.env.TWITTER_ACCESS_TOKEN !== "" &&
  process.env.TWITTER_ACCESS_TOKEN_SECRET !== "";

const getTwitterClient = (): TwitterApi | undefined => {
  if (!twitterEnabled()) return undefined;
  return new TwitterApi({
    appKey: process.env.TWITTER_API_KEY || "",
    appSecret: process.env.TWITTER_API_SECRET || "",
    accessToken: process.env.TWITTER_ACCESS_TOKEN || "",
    accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET || "",
  });
};

export const createTweet = async (text: string): Promise<boolean> => {
  try {
    const client = getTwitterClient();
    if (client === undefined) return false;

    const res = await client.v2.tweet(text);
    logger.info({ tweetId: res.data.id }, "Tweet created");
    return true;
  } catch (e) {
    logger.error({ e }, "Error while creating tweet");
    return false;
  }
};

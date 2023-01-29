import { lookup } from "dns";
import { env } from "process";
import { Monacute } from ".prisma/client";
import { NotEnoughMonacuteError } from "../error/monacute_error";
import { PublishMonacute } from "../interface/monacute";
import {
  getUnusedMonacute,
  getUnusedMonacutes,
  setMonacutePublished,
} from "../model/monacute";
import { broadcast } from "../util/api/electrum";
import { NFTAssetGroup, startPublishAfterUnixtime } from "../util/constant";
import { getLogger } from "../util/logger";
import { monaparty } from "../util/monaparty";
import { walletAssetOwner } from "../wallet_manager";
import { addAuction } from "../model/auction";
import { postMonacardFromURL } from "../service/monacard";
import { notifySlack } from "../util/slack";

const logger = getLogger("publishCard");

const ownerAddress = walletAssetOwner.getAddress();

const createNFT = async (description: string): Promise<string> => {
  // create asset
  const rawTx = await monaparty.createNFT(
    ownerAddress,
    description,
    NFTAssetGroup
  );
  const signedTx = walletAssetOwner.sign(rawTx, walletAssetOwner.getSigner());
  const txid = await broadcast(signedTx);
  logger.info({ txid }, "NFT Created");
  return txid;
};

const checkMonacutePublishReady = (monacute: Monacute) =>
  monacute.name !== null &&
  monacute.cardCid !== null &&
  monacute.imageCid !== null &&
  monacute.assetId === null &&
  monacute.cardDescription !== null &&
  monacute.dnaUrl !== null;

export const publishCardTask = async (): Promise<void> => {
  // TODO: Execute this every 2 hours
  // Get unpublished cards
  try {
    const monacute = await getUnusedMonacute();

    // check if monacute is ready to publish
    if (!checkMonacutePublishReady(monacute))
      throw new Error("Monacute not ready to publish");
    if (monacute.published) throw new Error("Monacute already published");

    // return if not auction time
    if (startPublishAfterUnixtime > Date.now()) {
      logger.info("Publish is not started. skip.");
      return;
    }

    logger.info({ monacute }, "Publishing monacute");

    // post to monacard ipfs
    let monacardCid = "";
    if (
      process.env.PRODUCTION_MODE === "true" &&
      process.env.MONACARD_DRY_RUN !== "true" &&
      process.env.IMAGE_URL
    ) {
      if (!monacute.dnaUrl) throw new Error("DNA URL is not set");
      monacardCid = await postMonacardFromURL(
        `${process.env.IMAGE_URL}/${monacute.dnaUrl}_card.png`
      );
    }

    // create monacard info
    const assetMetadata = {
      monacard: {
        name: `Monacute #${monacute.number} 「${monacute.name || ""}」`,
        owner: "Monacute",
        desc: monacute.cardDescription,
        tag: "monacute",
        cid: monacardCid,
        ver: "2",
      },
      monacute: {
        id: monacute.id,
        name: monacute.name,
        cid: {
          icon: monacute.imageCid,
        },
        model: "v1",
        dna: monacute.dnaUrl,
        ver: "1",
      },
    };

    // create asset
    const txid = await createNFT(JSON.stringify(assetMetadata));

    // save to db
    await setMonacutePublished(monacute);
    logger.info({ monacute_id: monacute.id }, "Monacute published");

    // Notify left count
    const leftMonacutes = await getUnusedMonacutes();
    await notifySlack(
      `Monacute #${monacute.number} published at ${txid}, ${leftMonacutes.length} left`,
      "publishCard"
    );
  } catch (e) {
    if (e instanceof NotEnoughMonacuteError) {
      logger.warn("Not enough monacute to publish");
      await notifySlack("Not enough monacute to publish");
    } else {
      logger.error(e);
    }
  }
};

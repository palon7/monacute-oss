/**
 * watch transaction to send back asset
 */

import { AuctionData } from "../interface/auction";
import {
  getProcessedTransactionsByStatus,
  updateProcessedTransactionStatus,
} from "../model/processed_transaction";
import { broadcast, getTxConfirmCount } from "../util/api/electrum";
import { minimumConfirmCount } from "../util/constant";
import { logger } from "../util/logger";
import { monaparty } from "../util/monaparty";
import { walletAssetOwner } from "../wallet_manager";

// Send back asset to sender
const sendBackAsset = async (
  senderAddress: string,
  assetId: string,
  txStatusId: string
) => {
  const rawTx = await monaparty.createSend(
    walletAssetOwner.getAddress(),
    senderAddress,
    assetId,
    1 // for NFT, quantity always to be 1
  );
  const signedTx = walletAssetOwner.sign(rawTx, walletAssetOwner.getSigner());
  const txid = await broadcast(signedTx);
  await updateProcessedTransactionStatus(txStatusId, "SENT_ASSET");
  logger.info({ txid }, "Asset sent");
};

export const watchTransaction = async () => {
  const transactions = await getProcessedTransactionsByStatus("UNPROCESSED");
  const results = [];

  // check all confirmation
  for (const transaction of transactions) {
    if (!transaction.assetId || !transaction.senderAddress) {
      logger.error({ transaction }, "Transaction log not valid!");
    } else {
      try {
        const { assetId, senderAddress } = transaction;

        // check confirm count
        // eslint-disable-next-line no-await-in-loop
        const confirmCount = await getTxConfirmCount(transaction.id);
        if (confirmCount >= minimumConfirmCount) {
          logger.info(
            { txid: transaction.id, confirmCount },
            "Confirmed, send back asset"
          );
          results.push(sendBackAsset(senderAddress, assetId, transaction.id));
        }
      } catch (e) {
        logger.error({ e }, "Error while transaction check");
      }
    }
  }

  await Promise.all(results);
};

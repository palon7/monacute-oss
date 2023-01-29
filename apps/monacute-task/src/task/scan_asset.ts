import { AssetInfo } from "monaparty";
import { addAsset, isAssetExistDB } from "../model/asset";
import { getLogger } from "../util/logger";
import { monaparty } from "../util/monaparty";
import { walletAssetOwner } from "../wallet_manager";
import { limitDB, limitOne } from "../util/parallel_imit";
import { setMonacuteAssetId } from "../model/monacute";
import { Monacute } from ".prisma/client";
import { notifySlack } from "../util/slack";

const logger = getLogger("scanAsset");

interface AddAssetData {
  assetId: string;
  monacuteId: number;
}

export const scanAssetTask = async (): Promise<void> => {
  const ownerAddress = walletAssetOwner.getAddress();
  const assetsBalances = await monaparty.getAddressBalance(ownerAddress);

  if (!assetsBalances?.balances) return; // return if no assets

  // check exists list
  const assetExists = await Promise.all(
    assetsBalances.balances.map((asset) => isAssetExistDB(asset.asset))
  );

  const getDataTaskList: Promise<AssetInfo | null>[] = [];
  const assetList: AddAssetData[] = [];
  const addAssetList: Promise<void>[] = [];
  const updateMonacuteList: Promise<void>[] = [];

  // Get asset data
  assetsBalances.balances.forEach((asset, i) => {
    if (
      !assetExists[i] &&
      asset.asset.startsWith("A") && // NFT always start from A
      asset.quantity === 1 // NFT always 1, and owner must have nft
    ) {
      logger.info({ assetId: asset.asset }, `Checking asset ${asset.asset}`);

      getDataTaskList.push(
        limitOne(() => {
          const assetInfo = monaparty.getAssetInfo(asset.asset);
          if (assetInfo === null)
            logger.error(
              { assetId: asset.asset },
              `Asset ${asset.asset} not found`
            );
          logger.debug({ info: assetInfo }, `Loading ${asset.asset}`);
          return assetInfo;
        })
      );
    }
  });

  // wait for all asset data
  const assetDataList = await Promise.all(getDataTaskList);

  assetDataList.forEach((assetData) => {
    if (assetData === null) {
      logger.error({ data: assetData }, `Asset not found`);
      return;
    }
    if (assetData.issuer !== ownerAddress) {
      return;
    }
    try {
      const assetDescription: any = JSON.parse(assetData.description);
      // check json valid
      if (!(assetDescription instanceof Object)) {
        return;
      }

      // check is asset is monacute
      if (
        !("monacute" in assetDescription && "id" in assetDescription.monacute)
      ) {
        return;
      }

      // associate asset with monacute`);
      const monacuteId = assetDescription.monacute.id;
      logger.info(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `Associate asset ${assetData.asset} with monacute ${monacuteId}`
      );

      updateMonacuteList.push(
        limitDB(() => {
          setMonacuteAssetId(monacuteId, assetData.asset, ownerAddress);
        })
      );
    } catch (e) {
      if (e instanceof SyntaxError) {
        logger.error(
          { assetId: assetData.asset },
          `Asset ${assetData.asset} description is not json`
        );
      }
    }
  });

  await Promise.all(updateMonacuteList);
  if (updateMonacuteList.length > 0) {
    await notifySlack(
      `${updateMonacuteList.length} asset(s) linked to monacutes`,
      "scanAsset"
    );
  }
};

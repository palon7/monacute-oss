/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { CoinData } from "../interface/coindata";

export const GetCoinData = (name: string): CoinData => {
  // FIXME: must use typedef
  // eslint-disable-next-line global-require
  const coininfo = require("coininfo");
  const coininfoData = coininfo(name);

  return {
    name,
    bip44: coininfoData.versions.bip44,
    network: coininfoData.toBitcoinJS(),
  };
};

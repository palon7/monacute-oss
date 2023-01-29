import { WalletBIP32 } from "./wallet_bip32";
import { WalletWIF } from "./wallet_wif";

const mnemonic = process.env.WALLET_MNEMONIC;
const wifAssetOwner = process.env.ASSET_OWNER_WIF;

if (!mnemonic) {
  console.error("Error: mnemonic not set.");
  process.exit();
}
if (!wifAssetOwner) {
  console.error("Error: asset owner mnemonic not set.");
  process.exit();
}

export const wallet = new WalletBIP32(mnemonic);
export const walletAssetOwner = new WalletWIF(wifAssetOwner);

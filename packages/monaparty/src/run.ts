import { MonapartyClient } from ".";
import { JaysonRPCCaller } from "./jayson_rpc";

const endpoint = "https://monapa.electrum-mona.org/_api";
const client = new MonapartyClient(endpoint);

const main = async () => {
  const response = await client.createNFT(
    "MWwWWBPh6jzJsewcxb5usnTrFTYBwxKUwx",
    "desc",
    "Palon"
  );
};

main().catch((e) => {
  throw e;
});

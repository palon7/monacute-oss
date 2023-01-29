import { MonapartyClient } from "monaparty";

export const monaparty = new MonapartyClient(
  process.env.MONAPARTY_ENDPOINT || "https://monapa.electrum-mona.org/_api"
);

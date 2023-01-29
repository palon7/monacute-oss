import { fstat, unlinkSync } from "fs";
import { argv } from "process";
import { downloadCardImage, postMonacardIPFS } from "../src/service/monacard";

async function main(url: string) {
  const filename = `/tmp/monacute_${Date.now()}.png`;

  console.log("Download image...");
  await downloadCardImage(url, filename);
  console.log("Posting...");
  await postMonacardIPFS(filename).then((cid) => {
    console.log(cid);
  });
  console.log("Clean up...");
  unlinkSync(filename);
}

if (argv.length < 3) {
  console.error("Usage: yarn run post_monacard.ts <file>");
  process.exit(1);
}

main(argv[2]).catch((e) => {
  console.error(e);
  process.exit(1);
});

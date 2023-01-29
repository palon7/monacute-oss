import { publishCardTask } from "./task/publish_card";

async function main() {
  await publishCardTask();
}

main().catch((e) => {
  throw e;
});

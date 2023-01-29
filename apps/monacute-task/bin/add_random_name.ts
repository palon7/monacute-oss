import fs from "fs";
import util from "util";
import { argv } from "process";
import { addMonacuteNames } from "../src/model/name";

const asyncReadFile = util.promisify(fs.readFile);

const addNameFromFile = async (filePath: string) => {
  const names = await asyncReadFile(filePath, "utf-8");

  await addMonacuteNames(names.split("\n"));
};

console.log("Adding names...");

if (argv.length < 3) {
  console.error("Usage: yarn run add_random_name.ts <file>");
  process.exit(1);
}

addNameFromFile(argv[2]).catch((e) => {
  console.error(e);
  process.exit(1);
});

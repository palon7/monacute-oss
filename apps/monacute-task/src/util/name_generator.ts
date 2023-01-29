import fs from "fs";

const getFileToArray = (filename: string): string[] => {
  const text = fs.readFileSync(`data/name/${filename}`, "utf8");
  return text.toString().split("\n");
};

const jpName = {
  a: getFileToArray("name_japanese_a.txt"),
  b: getFileToArray("name_japanese_b.txt"),
};

const enName = {
  a: getFileToArray("name_fantasy_a.txt"),
  b: getFileToArray("name_fantasy_b.txt"),
};

const jpNameProb = 0.9;

const pickRandomArray = (array: string[]): string =>
  array[Math.floor(Math.random() * array.length)];

type NameType = "jp" | "en";

export const generateRandomName = (param?: NameType): string => {
  const type: NameType = param || (Math.random() < jpNameProb ? "jp" : "en");

  if (type === "jp") {
    // jpname
    return `${pickRandomArray(jpName.a)} ${pickRandomArray(jpName.b)}`;
  }
  // enname
  return `${pickRandomArray(enName.a)}・${pickRandomArray(enName.b)}`;
};

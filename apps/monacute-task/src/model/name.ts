/* eslint-disable no-await-in-loop */
/* eslint-disable no-continue */
import { MonacuteName } from "@prisma/client";
import { prisma } from "../util/database";
import { notifySlack } from "../util/slack";

export const addMonacuteNames = async (names: string[]): Promise<void> => {
  for (const name of names) {
    if (name.length === 0) continue;
    await prisma.monacuteName.upsert({
      where: { name },
      create: { name },
      update: {},
    });
  }
};

// ランダム
export const getRandomName = async (): Promise<MonacuteName> => {
  const names = await prisma.monacuteName.findMany({
    where: {
      used: false,
    },
  });

  if (names.length === 0) {
    throw new Error("No unused name");
  }
  // eslint-disable-next-line no-void
  void notifySlack(`${names.length} unused names left`, "task/generate_card");

  const name = names[Math.floor(Math.random() * names.length)];
  return name;
};

export const useRandomName = async (): Promise<string> => {
  const name = await getRandomName();
  await prisma.monacuteName.update({
    where: { id: name.id },
    data: { used: true },
  });
  return name.name;
};

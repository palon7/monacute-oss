/* eslint-disable no-await-in-loop */
import { NotEnoughMonacuteError } from "../../src/error/monacute_error";
import {
  createMonacute,
  GetGen0MonacuteCount,
  getNextNumber,
  getUnusedMonacute,
} from "../../src/model/monacute";
import { prisma } from "../../src/util/database";

const monacute = {
  number: 1,
  name: "アリス",
  generation: 0,
  cardDescription: "説明文のテスト",
  seed: Buffer.alloc(256),
};

beforeEach(() => prisma.monacute.deleteMany({}));

describe("createMonacute", () => {
  const monacuteResult = {
    ...monacute,
    assetId: null,
    cardCid: null,
    imageCid: null,
    dnaUrl: null,
  };

  test("should create new monacute", async () => {
    await expect(createMonacute(monacute)).resolves.toMatchObject(
      monacuteResult
    );
    await expect(prisma.monacute.count()).resolves.toEqual(1);
  });

  test("should not create if limit is reached", async () => {
    for (let i = 0; i < 3; i += 1) {
      await expect(
        createMonacute({ ...monacute, number: i })
      ).resolves.toMatchObject({ ...monacuteResult, number: i });
    }

    await expect(prisma.monacute.count()).resolves.toEqual(3);
    await expect(
      createMonacute({ ...monacute, number: 100 }, 3)
    ).rejects.toThrow("Monacute limit exceeded");
    await expect(prisma.monacute.count()).resolves.toEqual(3);
  });
});

describe("getMonacute", () => {
  test("should get unused monacute", async () => {
    await createMonacute(monacute);
    await expect(getUnusedMonacute()).resolves.toMatchObject(monacute);
  });

  test("should throw error when no unused monacute found", async () => {
    await expect(getUnusedMonacute()).rejects.toThrow(NotEnoughMonacuteError);
  });
});

test("should increment nextNumber after creation", async () => {
  await expect(getNextNumber()).resolves.toEqual(1);
  await createMonacute(monacute);
  await expect(getNextNumber()).resolves.toEqual(2);
});

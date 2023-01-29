/* eslint-disable no-await-in-loop */
import { createMonacute, GetGen0MonacuteCount } from "../../src/model/monacute";
import { prisma } from "../../src/util/database";
import { generateGen0Monacute } from "../../src/service/monacute";

beforeEach(() => prisma.monacute.deleteMany({}));

describe("generateGen0", () => {
  test("should add card", async () => {
    await expect(prisma.monacute.count()).resolves.toEqual(0);
    await expect(generateGen0Monacute()).resolves.toHaveProperty("id");

    await expect(prisma.monacute.count()).resolves.toEqual(1);
    await expect(prisma.monacute.findFirst()).resolves.toMatchObject({
      number: 1,
      generation: 0,
    });
  });
});

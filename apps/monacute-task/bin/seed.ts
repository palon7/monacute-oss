import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.auction.create({
    data: {
      startPrice: 100_0000_0000,
      endPrice: 100_0000,
      startTime: new Date(Date.parse("2021-10-01 12:00Z+0900")),
      endTime: new Date(Date.parse("2021-10-03 12:00Z+0900")),
      address: {
        create: {
          address: "MENaS5cJhhVQwcfyARrGQaiwXEhHf5HtgR",
          addressIndex: 0,
          isChange: false,
        },
      },
      asset: {
        create: {
          id: "A000000000",
          assetOwner: "MENaS5cJhhVQwcfyARrGQaiwXEhHf5HtgR",
        },
      },
    },
  });

  const allAuction = await prisma.auction.findMany({
    include: {
      address: true,
    },
  });
  console.log(allAuction, { depth: null });
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

/*
  Warnings:

  - You are about to drop the `MPAsset` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Auction" DROP CONSTRAINT "Auction_assetId_fkey";

-- DropForeignKey
ALTER TABLE "Monacute" DROP CONSTRAINT "Monacute_assetId_fkey";

-- DropTable
DROP TABLE "MPAsset";

-- CreateTable
CREATE TABLE "MpAsset" (
    "id" VARCHAR(128) NOT NULL,
    "assetOwner" VARCHAR(64) NOT NULL,

    CONSTRAINT "MpAsset_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "MpAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Monacute" ADD CONSTRAINT "Monacute_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "MpAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

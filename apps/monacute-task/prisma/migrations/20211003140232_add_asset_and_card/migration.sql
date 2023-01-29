/*
  Warnings:

  - You are about to drop the column `assetName` on the `Auction` table. All the data in the column will be lost.
  - You are about to drop the column `assetOwner` on the `Auction` table. All the data in the column will be lost.
  - Added the required column `assetId` to the `Auction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Auction" DROP COLUMN "assetName",
DROP COLUMN "assetOwner",
ADD COLUMN     "assetId" VARCHAR(128) NOT NULL,
ADD COLUMN     "isOfficial" BOOLEAN DEFAULT false;

-- CreateTable
CREATE TABLE "MPAsset" (
    "id" VARCHAR(128) NOT NULL,
    "assetOwner" VARCHAR(64) NOT NULL,

    CONSTRAINT "MPAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Monacute" (
    "id" VARCHAR(128) NOT NULL,
    "number" INTEGER NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "cardCid" VARCHAR(128) NOT NULL,
    "imageCid" VARCHAR(128) NOT NULL,
    "dnaUrl" VARCHAR(255) NOT NULL,
    "cardDescription" VARCHAR(255) NOT NULL,

    CONSTRAINT "Monacute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_parentChild" (
    "A" VARCHAR(128) NOT NULL,
    "B" VARCHAR(128) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Monacute_number_key" ON "Monacute"("number");

-- CreateIndex
CREATE UNIQUE INDEX "_parentChild_AB_unique" ON "_parentChild"("A", "B");

-- CreateIndex
CREATE INDEX "_parentChild_B_index" ON "_parentChild"("B");

-- AddForeignKey
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "MPAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_parentChild" ADD FOREIGN KEY ("A") REFERENCES "Monacute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_parentChild" ADD FOREIGN KEY ("B") REFERENCES "Monacute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

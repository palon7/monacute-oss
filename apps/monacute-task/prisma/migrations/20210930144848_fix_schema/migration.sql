/*
  Warnings:

  - You are about to drop the `addresses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `auctions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `config` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "addresses";

-- DropTable
DROP TABLE "auctions";

-- DropTable
DROP TABLE "config";

-- CreateTable
CREATE TABLE "Address" (
    "id" SERIAL NOT NULL,
    "address" VARCHAR(64) NOT NULL,
    "addressIndex" INTEGER NOT NULL,
    "isChange" BOOLEAN NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Auction" (
    "id" SERIAL NOT NULL,
    "purchased" BOOLEAN DEFAULT false,
    "startPrice" BIGINT NOT NULL,
    "endPrice" BIGINT NOT NULL,
    "startTime" TIMESTAMP(6) NOT NULL,
    "endTime" TIMESTAMP(6) NOT NULL,
    "addressId" INTEGER NOT NULL,
    "assetName" VARCHAR(128) NOT NULL,
    "assetOwner" VARCHAR(64) NOT NULL,

    CONSTRAINT "Auction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Config" (
    "id" VARCHAR(64) NOT NULL,
    "value" INTEGER NOT NULL,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Address_address_key" ON "Address"("address");

-- AddForeignKey
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

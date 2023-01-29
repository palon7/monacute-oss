-- CreateTable
CREATE TABLE "addresses" (
    "id" SERIAL NOT NULL,
    "address" VARCHAR(64),
    "addressIndex" INTEGER NOT NULL,
    "isChange" BOOLEAN NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auctions" (
    "id" SERIAL NOT NULL,
    "purchased" BOOLEAN DEFAULT false,
    "startPrice" BIGINT NOT NULL,
    "endPrice" BIGINT NOT NULL,
    "startTime" TIMESTAMP(6) NOT NULL,
    "endTime" TIMESTAMP(6) NOT NULL,
    "address" VARCHAR(64) NOT NULL,
    "assetName" VARCHAR(128) NOT NULL,
    "assetOwner" VARCHAR(64) NOT NULL,

    CONSTRAINT "auctions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "config" (
    "id" VARCHAR(64) NOT NULL,
    "value" INTEGER NOT NULL,

    CONSTRAINT "config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "addresses_address_key" ON "addresses"("address");

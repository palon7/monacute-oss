-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('UNPROCESSED', 'SENT_ASSET', 'REFUND_COIN', 'TOO_SMALL', 'ERROR');

-- CreateTable
CREATE TABLE "ProcessedTransaction" (
    "id" TEXT NOT NULL,
    "status" "TransactionStatus" NOT NULL,
    "addressId" INTEGER NOT NULL,

    CONSTRAINT "ProcessedTransaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProcessedTransaction" ADD CONSTRAINT "ProcessedTransaction_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

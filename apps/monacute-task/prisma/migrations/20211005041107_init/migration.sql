/*
  Warnings:

  - A unique constraint covering the columns `[generation]` on the table `Monacute` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `generation` to the `Monacute` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MonacuteStatus" AS ENUM ('CREATED', 'IMAGE_GENERATED', 'PUBLISHED');

-- DropForeignKey
ALTER TABLE "Monacute" DROP CONSTRAINT "Monacute_assetId_fkey";

-- AlterTable
ALTER TABLE "Monacute" ADD COLUMN     "generation" INTEGER NOT NULL,
ALTER COLUMN "cardCid" DROP NOT NULL,
ALTER COLUMN "imageCid" DROP NOT NULL,
ALTER COLUMN "dnaUrl" DROP NOT NULL,
ALTER COLUMN "cardDescription" DROP NOT NULL,
ALTER COLUMN "assetId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Monacute_generation_key" ON "Monacute"("generation");

-- AddForeignKey
ALTER TABLE "Monacute" ADD CONSTRAINT "Monacute_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "MpAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

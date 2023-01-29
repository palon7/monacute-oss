/*
  Warnings:

  - The primary key for the `Monacute` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Monacute` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[assetId]` on the table `Monacute` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_parentChild` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `assetId` to the `Monacute` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `A` on the `_parentChild` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `B` on the `_parentChild` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "_parentChild" DROP CONSTRAINT "_parentChild_A_fkey";

-- DropForeignKey
ALTER TABLE "_parentChild" DROP CONSTRAINT "_parentChild_B_fkey";

-- AlterTable
ALTER TABLE "Monacute" DROP CONSTRAINT "Monacute_pkey",
ADD COLUMN     "assetId" VARCHAR(128) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Monacute_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "_parentChild" DROP COLUMN "A",
ADD COLUMN     "A" INTEGER NOT NULL,
DROP COLUMN "B",
ADD COLUMN     "B" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Monacute_assetId_unique" ON "Monacute"("assetId");

-- CreateIndex
CREATE UNIQUE INDEX "_parentChild_AB_unique" ON "_parentChild"("A", "B");

-- CreateIndex
CREATE INDEX "_parentChild_B_index" ON "_parentChild"("B");

-- AddForeignKey
ALTER TABLE "Monacute" ADD CONSTRAINT "Monacute_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "MPAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_parentChild" ADD FOREIGN KEY ("A") REFERENCES "Monacute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_parentChild" ADD FOREIGN KEY ("B") REFERENCES "Monacute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - Added the required column `seed` to the `Monacute` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Monacute" ADD COLUMN     "seed" BYTEA NOT NULL;

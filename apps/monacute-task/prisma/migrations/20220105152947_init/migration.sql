/*
  Warnings:

  - Made the column `name` on table `MonacuteName` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "MonacuteName" ALTER COLUMN "name" SET NOT NULL;

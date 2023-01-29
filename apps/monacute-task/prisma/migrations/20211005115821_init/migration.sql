-- AlterEnum
ALTER TYPE "MonacuteStatus" ADD VALUE 'METADATA_GENERATED';

-- DropIndex
DROP INDEX "Monacute_generation_key";

-- AlterTable
ALTER TABLE "Monacute" ALTER COLUMN "name" DROP NOT NULL;

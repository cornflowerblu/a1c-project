/*
  Warnings:

  - You are about to drop the column `runId` on the `Reading` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Reading` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `Reading` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `Reading` table. All the data in the column will be lost.
  - You are about to drop the column `completedAt` on the `Run` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Run` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Run` table. All the data in the column will be lost.
  - You are about to drop the column `startedAt` on the `Run` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Run` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - Added the required column `glucoseRunId` to the `Reading` table without a default value. This is not possible if the table is not empty.
  - Added the required column `glucoseValue` to the `Reading` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Run` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Reading" DROP CONSTRAINT "Reading_runId_fkey";

-- AlterTable
ALTER TABLE "Reading" DROP COLUMN "runId",
DROP COLUMN "type",
DROP COLUMN "unit",
DROP COLUMN "value",
ADD COLUMN     "glucoseRunId" TEXT NOT NULL,
ADD COLUMN     "glucoseValue" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "mealContext" TEXT,
ALTER COLUMN "timestamp" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Run" DROP COLUMN "completedAt",
DROP COLUMN "description",
DROP COLUMN "name",
DROP COLUMN "startedAt",
DROP COLUMN "status",
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "estimatedA1C" DOUBLE PRECISION,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
ADD COLUMN     "fullName" TEXT;

-- DropEnum
DROP TYPE "RunStatus";

-- AddForeignKey
ALTER TABLE "Reading" ADD CONSTRAINT "Reading_glucoseRunId_fkey" FOREIGN KEY ("glucoseRunId") REFERENCES "Run"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

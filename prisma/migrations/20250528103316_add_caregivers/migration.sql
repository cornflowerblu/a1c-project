-- CreateEnum
CREATE TYPE "AccessStatus" AS ENUM ('pending', 'active', 'revoked');

-- CreateTable
CREATE TABLE "CaregiverAccess" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "caregiverId" TEXT NOT NULL,
    "status" "AccessStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaregiverAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CaregiverAccess_patientId_caregiverId_key" ON "CaregiverAccess"("patientId", "caregiverId");

-- AddForeignKey
ALTER TABLE "CaregiverAccess" ADD CONSTRAINT "CaregiverAccess_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaregiverAccess" ADD CONSTRAINT "CaregiverAccess_caregiverId_fkey" FOREIGN KEY ("caregiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

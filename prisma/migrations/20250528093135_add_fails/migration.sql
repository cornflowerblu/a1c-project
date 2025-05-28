-- CreateTable
CREATE TABLE "FailedJob" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processName" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "failureReason" TEXT NOT NULL,
    "attemptsMade" INTEGER NOT NULL,
    "stackTrace" TEXT,
    "retries" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FailedJob_pkey" PRIMARY KEY ("id")
);

// api/src/app/failed-jobs/failed-jobs.module.ts
import { Module } from '@nestjs/common';
import { FailedJobsService } from './failed-jobs.service';
import { PrismaService } from '../database/prisma.service';

@Module({
  providers: [FailedJobsService, PrismaService],
  exports: [FailedJobsService],
})
export class FailedJobsModule {}

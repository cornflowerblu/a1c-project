// api/src/app/failed-jobs/failed-jobs.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Job } from 'bull';

@Injectable()
export class FailedJobsService {
  private readonly logger = new Logger(FailedJobsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async logFailedJob(job: Job, error: Error): Promise<void> {
    try {
      await this.prisma.failedJob.create({
        data: {
          processName: job.name,
          data: job.data as any,
          failureReason: error.message,
          attemptsMade: job.attemptsMade,
          stackTrace: error.stack,
          retries: job.opts.attempts || 0,
        },
      });
      
      this.logger.log(`Logged failed job ${job.id} to database`);
    } catch (dbError) {
      this.logger.error(`Error logging failed job to database: ${dbError.message}`);
      // We don't want to throw here as this is already handling an error
    }
  }

  async getFailedJobs() {
    return this.prisma.failedJob.findMany({
      orderBy: {
        timestamp: 'desc',
      },
    });
  }
}

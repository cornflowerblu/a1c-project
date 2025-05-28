// api/src/app/queue/queue-consumer.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { UsersService } from '../users/users.service';
import { FailedJobsService } from '../failed-jobs/failed-jobs.service';

@Injectable()
@Processor('clerk-webhooks')
export class QueueConsumerService {
  private readonly logger = new Logger(QueueConsumerService.name);

  constructor(private readonly usersService: UsersService, private readonly failedJobsService: FailedJobsService) {}

  @Process('process-webhook')
  async processWebhook(job: Job<any>) {
    this.logger.log(`Processing job ${job.id} of type ${job.data.type}`);
    
    try {
      const { type, data } = job.data;
      
      switch (type) {
        case 'user.created':
          await this.handleUserCreated(data);
          break;
        case 'user.updated':
          await this.handleUserUpdated(data);
          break;
        case 'user.deleted':
          await this.handleUserDeleted(data);
          break;
        default:
          this.logger.warn(`Unhandled webhook type: ${type}`);
      }
      
      this.logger.log(`Job ${job.id} completed successfully`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Error processing job ${job.id}: ${error.message}`);
      
      // If we've reached the maximum number of attempts, log a critical error
      if (job.attemptsMade >= job.opts.attempts - 1) {
        this.logger.error(`Job ${job.id} failed after ${job.attemptsMade + 1} attempts`);
        await this.failedJobsService.logFailedJob(job, error);
        // Here you could implement additional error handling like sending an alert
      }
      
      // Throwing the error will cause the job to be retried based on the backoff settings
      throw error;
    }
  }

  private async handleUserCreated(data: any) {
    const { id, email_addresses, first_name, last_name } = data;
    
    this.logger.log(`Creating user: ${id}, ${email_addresses[0]?.email_address}, ${first_name} ${last_name}`);
    
    await this.usersService.create(
      email_addresses[0]?.email_address,
      `${first_name || ''} ${last_name || ''}`.trim(),
      undefined, // Default role
      id // clerkId
    );
  }

  private async handleUserUpdated(data: any) {
    // Implement user update logic
    this.logger.log(`User updated: ${data.id}`);
  }

  private async handleUserDeleted(data: any) {
    // Implement user deletion logic
    this.logger.log(`User deleted: ${data.id}`);
  }
}

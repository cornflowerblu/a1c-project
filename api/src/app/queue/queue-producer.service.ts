// api/src/app/queue/queue-producer.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class QueueProducerService {
  private readonly logger = new Logger(QueueProducerService.name);

  constructor(@InjectQueue('clerk-webhooks') private readonly webhookQueue: Queue) {}

  async addToQueue(data: any) {
    try {
      const job = await this.webhookQueue.add('process-webhook', data, {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 2000, // 2 seconds initial delay
        },
        removeOnComplete: false,
        removeOnFail: false,
      });
      
      this.logger.log(`Added job ${job.id} to the queue`);
      return job;
    } catch (error) {
      this.logger.error(`Error adding job to queue: ${error.message}`);
      throw error;
    }
  }
}

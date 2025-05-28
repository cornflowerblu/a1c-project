// api/src/app/queue/queue.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QueueProducerService } from './queue-producer.service';
import { QueueConsumerService } from './queue-consumer.service';
import { PrismaService } from '../database';
import { FailedJobsModule } from '../failed-jobs/failed-jobs.module'
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || 'redispassword',
      },
    }),
    BullModule.registerQueue({
      name: 'clerk-webhooks',
    }),
    UsersModule,
    FailedJobsModule
  ],
  providers: [QueueProducerService, QueueConsumerService, PrismaService],
  exports: [QueueProducerService],
})
export class QueueModule {}

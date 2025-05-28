// api/src/app/webhook/webhook.module.ts
import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [QueueModule],
  controllers: [WebhookController],
})
export class WebhookModule {}

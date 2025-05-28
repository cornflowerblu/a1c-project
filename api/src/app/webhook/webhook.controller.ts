// api/src/app/webhook/webhook.controller.ts
import { Controller, Post, Body, Logger } from '@nestjs/common';
import { QueueProducerService } from '../queue/queue-producer.service';

@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly queueProducerService: QueueProducerService) {}

  @Post('clerk')
  async handleClerkWebhook(@Body() webhookData: any) {
    this.logger.log(`Received Clerk webhook: ${webhookData.type}`);
    
    try {
      // Add the webhook data to the queue for processing
      await this.queueProducerService.addToQueue(webhookData);
      return { success: true, message: 'Webhook received and queued' };
    } catch (error) {
      this.logger.error(`Error queuing webhook: ${error.message}`);
      throw error;
    }
  }
}

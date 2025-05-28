// api/src/app/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './config/config.module';
import { PrismaService } from './database/prisma.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ReadingsModule } from './readings/readings.module';
import { RunsModule } from './runs/runs.module';
// import { WebsocketModule } from './webhook/websocket.module';
import { QueueModule } from './queue/queue.module';
import { WebhookModule } from './webhook/webhook.module';
import { FailedJobsModule } from './failed-jobs/failed-jobs.module';

@Module({
  imports: [
    AppConfigModule,
    UsersModule,
    AuthModule,
    ReadingsModule,
    RunsModule,
    // WebsocketModule,
    QueueModule,
    WebhookModule,
    FailedJobsModule
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}

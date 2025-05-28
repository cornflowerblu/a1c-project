import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AppConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { ReadingsModule } from './readings/readings.module';
import { RunsModule } from './runs/runs.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    AuthModule,
    UsersModule,
    ReadingsModule,
    RunsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppConfigModule],
})
export class AppModule {}

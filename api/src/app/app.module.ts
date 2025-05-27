import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RunsModule } from './runs/runs.module';
import { ReadingsModule } from './readings/readings.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    RunsModule,
    ReadingsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

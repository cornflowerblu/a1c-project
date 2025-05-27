import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from '../prisma/prisma.module';
import { RunsModule } from './runs/runs.module';
import { ReadingsModule } from './readings/readings.module';

@Module({
  imports: [
    AuthModule, 
    UsersModule, 
    PrismaModule,
    RunsModule,
    ReadingsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { RunsController } from './runs.controller';
import { RunsService } from './runs.service';
import { PrismaService } from '../database';

@Module({
  controllers: [RunsController],
  providers: [RunsService, PrismaService],
  exports: [RunsService],
})
export class RunsModule {}
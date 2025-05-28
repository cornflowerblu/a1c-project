import { Module } from '@nestjs/common';
import { ReadingsController } from './readings.controller';
import { ReadingsService } from './readings.service';
import { PrismaService } from '../database';

@Module({
  controllers: [ReadingsController],
  providers: [ReadingsService, PrismaService],
  exports: [ReadingsService],
})
export class ReadingsModule {}
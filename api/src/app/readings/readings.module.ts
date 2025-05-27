import { Module } from '@nestjs/common';
import { ReadingsService } from './readings.service';
import { ReadingsController } from './readings.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { RunsModule } from '../runs/runs.module';

@Module({
  imports: [PrismaModule, RunsModule],
  controllers: [ReadingsController],
  providers: [ReadingsService],
})
export class ReadingsModule {}
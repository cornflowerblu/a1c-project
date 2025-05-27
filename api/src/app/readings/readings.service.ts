import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReadingDto } from './dto/create-reading.dto';
import { UpdateReadingDto } from './dto/update-reading.dto';
import { RunsService } from '../runs/runs.service';

@Injectable()
export class ReadingsService {
  constructor(
    private prisma: PrismaService,
    private runsService: RunsService,
  ) {}

  async create(runId: string, userId: string, createReadingDto: CreateReadingDto) {
    // First check if the run exists and belongs to the user
    await this.runsService.findOne(runId, userId);

    const reading = await this.prisma.reading.create({
      data: {
        ...createReadingDto,
        runId,
      },
    });

    // After adding a reading, recalculate the A1C for the run
    await this.recalculateA1C(runId, userId);

    return reading;
  }

  async findAll(runId: string, userId: string) {
    // First check if the run exists and belongs to the user
    await this.runsService.findOne(runId, userId);

    return this.prisma.reading.findMany({
      where: { runId },
      orderBy: { timestamp: 'asc' },
    });
  }

  async findOne(id: string, userId: string) {
    const reading = await this.prisma.reading.findUnique({
      where: { id },
      include: { run: true },
    });

    if (!reading || reading.run.userId !== userId) {
      throw new NotFoundException(`Reading with ID ${id} not found`);
    }

    return reading;
  }

  async update(id: string, userId: string, updateReadingDto: UpdateReadingDto) {
    // First check if the reading exists and belongs to the user
    const reading = await this.findOne(id, userId);

    const updatedReading = await this.prisma.reading.update({
      where: { id },
      data: updateReadingDto,
    });

    // After updating a reading, recalculate the A1C for the run
    await this.recalculateA1C(reading.runId, userId);

    return updatedReading;
  }

  async remove(id: string, userId: string) {
    // First check if the reading exists and belongs to the user
    const reading = await this.findOne(id, userId);
    const runId = reading.runId;

    const deletedReading = await this.prisma.reading.delete({
      where: { id },
    });

    // After removing a reading, recalculate the A1C for the run
    await this.recalculateA1C(runId, userId);

    return deletedReading;
  }

  private async recalculateA1C(runId: string, userId: string) {
    try {
      // Try to calculate A1C, but don't throw an error if it fails
      // (e.g., if there are not enough readings)
      await this.runsService.calculateA1C(runId, userId);
    } catch (error) {
      // If calculation fails, just set the A1C to null
      await this.prisma.run.update({
        where: { id: runId },
        data: { estimatedA1C: null },
      });
    }
  }
}
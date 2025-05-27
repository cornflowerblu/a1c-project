import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReadingDto, GlucoseReading, UpdateReadingDto } from '../../../../shared/api-interfaces/src';

@Injectable()
export class ReadingsService {
  constructor(private prisma: PrismaService) {}

  async findAllByRun(runId: string, userId: string): Promise<GlucoseReading[]> {
    // Check if run exists and belongs to user
    const run = await this.prisma.run.findUnique({
      where: { id: runId },
    });

    if (!run) {
      throw new NotFoundException(`Run with ID ${runId} not found`);
    }

    if (run.userId !== userId) {
      throw new ForbiddenException('You do not have permission to access this run');
    }

    return this.prisma.reading.findMany({
      where: { runId },
      orderBy: { timestamp: 'asc' },
    });
  }

  async findOne(id: string, userId: string): Promise<GlucoseReading> {
    const reading = await this.prisma.reading.findUnique({
      where: { id },
      include: { run: true },
    });

    if (!reading) {
      throw new NotFoundException(`Reading with ID ${id} not found`);
    }

    if (reading.run.userId !== userId) {
      throw new ForbiddenException('You do not have permission to access this reading');
    }

    return reading;
  }

  async create(runId: string, createReadingDto: CreateReadingDto, userId: string): Promise<GlucoseReading> {
    // Check if run exists and belongs to user
    const run = await this.prisma.run.findUnique({
      where: { id: runId },
    });

    if (!run) {
      throw new NotFoundException(`Run with ID ${runId} not found`);
    }

    if (run.userId !== userId) {
      throw new ForbiddenException('You do not have permission to add readings to this run');
    }

    return this.prisma.reading.create({
      data: {
        ...createReadingDto,
        runId,
      },
    });
  }

  async update(id: string, updateReadingDto: UpdateReadingDto, userId: string): Promise<GlucoseReading> {
    // Check if reading exists and belongs to user's run
    await this.findOne(id, userId);

    return this.prisma.reading.update({
      where: { id },
      data: updateReadingDto,
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    // Check if reading exists and belongs to user's run
    await this.findOne(id, userId);

    await this.prisma.reading.delete({
      where: { id },
    });
  }
}
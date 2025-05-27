import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRunDto, Run, RunStatistics, UpdateRunDto } from '../../../../shared/api-interfaces/src';

@Injectable()
export class RunsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string): Promise<Run[]> {
    return this.prisma.run.findMany({
      where: { userId },
      include: { readings: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string): Promise<Run> {
    const run = await this.prisma.run.findUnique({
      where: { id },
      include: { readings: true },
    });

    if (!run || run.userId !== userId) {
      throw new NotFoundException(`Run with ID ${id} not found`);
    }

    return run;
  }

  async create(createRunDto: CreateRunDto, userId: string): Promise<Run> {
    return this.prisma.run.create({
      data: {
        ...createRunDto,
        userId,
      },
      include: { readings: true },
    });
  }

  async update(id: string, updateRunDto: UpdateRunDto, userId: string): Promise<Run> {
    // Check if run exists and belongs to user
    await this.findOne(id, userId);

    return this.prisma.run.update({
      where: { id },
      data: updateRunDto,
      include: { readings: true },
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    // Check if run exists and belongs to user
    await this.findOne(id, userId);

    // Delete all readings associated with the run
    await this.prisma.reading.deleteMany({
      where: { runId: id },
    });

    // Delete the run
    await this.prisma.run.delete({
      where: { id },
    });
  }

  async calculateStatistics(id: string, userId: string): Promise<RunStatistics> {
    const run = await this.findOne(id, userId);

    if (!run.readings || run.readings.length === 0) {
      throw new NotFoundException('No readings found for this run');
    }

    const glucoseValues = run.readings.map(reading => reading.glucoseValue);
    const averageGlucose = glucoseValues.reduce((sum, value) => sum + value, 0) / glucoseValues.length;
    
    // A1C estimation formula: (average glucose + 46.7) / 28.7
    const estimatedA1C = (averageGlucose + 46.7) / 28.7;
    
    // Update the run with the estimated A1C
    await this.prisma.run.update({
      where: { id },
      data: { estimatedA1C },
    });

    // Count readings in different ranges
    const lowReadings = glucoseValues.filter(value => value < 70).length;
    const normalReadings = glucoseValues.filter(value => value >= 70 && value <= 180).length;
    const highReadings = glucoseValues.filter(value => value > 180).length;

    return {
      averageGlucose,
      estimatedA1C,
      highestReading: Math.max(...glucoseValues),
      lowestReading: Math.min(...glucoseValues),
      readingCount: glucoseValues.length,
      timeInRange: {
        low: lowReadings / glucoseValues.length,
        normal: normalReadings / glucoseValues.length,
        high: highReadings / glucoseValues.length,
      },
    };
  }
}
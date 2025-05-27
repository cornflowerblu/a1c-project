import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRunDto, Run, UpdateRunDto } from '@./source/shared/api-interfaces';

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

  async create(userId: string, createRunDto: CreateRunDto): Promise<Run> {
    return this.prisma.run.create({
      data: {
        ...createRunDto,
        userId,
      },
      include: { readings: true },
    });
  }

  async update(id: string, userId: string, updateRunDto: UpdateRunDto): Promise<Run> {
    // First check if the run exists and belongs to the user
    await this.findOne(id, userId);

    return this.prisma.run.update({
      where: { id },
      data: updateRunDto,
      include: { readings: true },
    });
  }

  async remove(id: string, userId: string): Promise<Run> {
    // First check if the run exists and belongs to the user
    await this.findOne(id, userId);

    return this.prisma.run.delete({
      where: { id },
      include: { readings: true },
    });
  }

  async calculateA1C(id: string, userId: string): Promise<number> {
    const run = await this.findOne(id, userId);
    
    if (!run.readings || run.readings.length === 0) {
      return 0;
    }

    // Simple A1C estimation formula: average glucose in mg/dL
    // A1C = (average glucose + 46.7) / 28.7
    const totalGlucose = run.readings.reduce((sum, reading) => sum + reading.glucoseValue, 0);
    const averageGlucose = totalGlucose / run.readings.length;
    const estimatedA1C = (averageGlucose + 46.7) / 28.7;

    // Update the run with the estimated A1C
    await this.prisma.run.update({
      where: { id },
      data: { estimatedA1C },
    });

    return estimatedA1C;
  }
}
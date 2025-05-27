import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRunDto } from './dto/create-run.dto';
import { UpdateRunDto } from './dto/update-run.dto';
import { calculateA1C, GlucoseReading } from '@shared/a1c-calculator';

@Injectable()
export class RunsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createRunDto: CreateRunDto) {
    return this.prisma.run.create({
      data: {
        ...createRunDto,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.run.findMany({
      where: { userId },
      include: { readings: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const run = await this.prisma.run.findUnique({
      where: { id },
      include: { readings: true },
    });

    if (!run || run.userId !== userId) {
      throw new NotFoundException(`Run with ID ${id} not found`);
    }

    return run;
  }

  async update(id: string, userId: string, updateRunDto: UpdateRunDto) {
    // First check if the run exists and belongs to the user
    await this.findOne(id, userId);

    return this.prisma.run.update({
      where: { id },
      data: updateRunDto,
    });
  }

  async remove(id: string, userId: string) {
    // First check if the run exists and belongs to the user
    await this.findOne(id, userId);

    return this.prisma.run.delete({
      where: { id },
    });
  }

  async calculateA1C(id: string, userId: string) {
    // Get the run with its readings
    const run = await this.findOne(id, userId);

    if (!run.readings || run.readings.length < 3) {
      throw new NotFoundException('Not enough readings to calculate A1C. At least 3 readings are required.');
    }

    // Convert readings to the format expected by the A1C calculator
    const glucoseReadings: GlucoseReading[] = run.readings.map(reading => ({
      glucoseValue: reading.glucoseValue,
      timestamp: reading.timestamp,
      mealContext: reading.mealContext,
      notes: reading.notes,
    }));

    // Calculate A1C
    const estimatedA1C = calculateA1C(glucoseReadings);

    if (estimatedA1C === null) {
      throw new NotFoundException('Could not calculate A1C with the provided readings.');
    }

    // Update the run with the calculated A1C
    return this.prisma.run.update({
      where: { id },
      data: { estimatedA1C },
      include: { readings: true },
    });
  }
}
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RunsService } from '../runs/runs.service';
import { CreateGlucoseReadingDto, GlucoseReading, UpdateGlucoseReadingDto } from '@./source/shared/api-interfaces';

@Injectable()
export class ReadingsService {
  constructor(
    private prisma: PrismaService,
    private runsService: RunsService,
  ) {}

  async findAll(runId: string, userId: string): Promise<GlucoseReading[]> {
    // Verify the run exists and belongs to the user
    await this.runsService.findOne(runId, userId);

    return this.prisma.reading.findMany({
      where: { runId },
      orderBy: { timestamp: 'desc' },
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

    // Verify the reading belongs to a run owned by the user
    if (reading.run.userId !== userId) {
      throw new NotFoundException(`Reading with ID ${id} not found`);
    }

    return reading;
  }

  async create(userId: string, createReadingDto: CreateGlucoseReadingDto): Promise<GlucoseReading> {
    // Validate glucose value
    this.validateGlucoseValue(createReadingDto.glucoseValue);
    
    // Verify the run exists and belongs to the user
    await this.runsService.findOne(createReadingDto.runId, userId);

    const reading = await this.prisma.reading.create({
      data: createReadingDto,
    });

    // Recalculate A1C for the run
    await this.runsService.calculateA1C(createReadingDto.runId, userId);

    return reading;
  }

  async update(id: string, userId: string, updateReadingDto: UpdateGlucoseReadingDto): Promise<GlucoseReading> {
    // Find the reading first to verify ownership
    const reading = await this.findOne(id, userId);

    // Validate glucose value if provided
    if (updateReadingDto.glucoseValue !== undefined) {
      this.validateGlucoseValue(updateReadingDto.glucoseValue);
    }

    const updatedReading = await this.prisma.reading.update({
      where: { id },
      data: updateReadingDto,
    });

    // Recalculate A1C for the run
    await this.runsService.calculateA1C(reading.runId, userId);

    return updatedReading;
  }

  async remove(id: string, userId: string): Promise<GlucoseReading> {
    // Find the reading first to verify ownership
    const reading = await this.findOne(id, userId);

    const deletedReading = await this.prisma.reading.delete({
      where: { id },
    });

    // Recalculate A1C for the run
    await this.runsService.calculateA1C(reading.runId, userId);

    return deletedReading;
  }

  private validateGlucoseValue(value: number): void {
    // Typical blood glucose range is between 20 and 600 mg/dL
    // Values outside this range are likely errors
    if (value < 20 || value > 600) {
      throw new BadRequestException('Glucose value must be between 20 and 600 mg/dL');
    }
  }
}
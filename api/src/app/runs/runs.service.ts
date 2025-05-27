import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class RunsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId?: string) {
    return this.prisma.run.findMany({
      where: userId ? { userId } : undefined,
      include: {
        readings: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.run.findUnique({
      where: { id },
      include: {
        readings: true,
      },
    });
  }

  async create(data: {
    userId: string;
    startDate: Date;
    endDate?: Date;
    estimatedA1C?: number;
    notes?: string;
  }) {
    return this.prisma.run.create({
      data,
      include: {
        readings: true,
      },
    });
  }

  async update(id: string, data: {
    startDate?: Date;
    endDate?: Date;
    estimatedA1C?: number;
    notes?: string;
  }) {
    return this.prisma.run.update({
      where: { id },
      data,
      include: {
        readings: true,
      },
    });
  }

  async delete(id: string) {
    // First delete all readings associated with this run
    await this.prisma.reading.deleteMany({
      where: { runId: id },
    });
    
    // Then delete the run
    return this.prisma.run.delete({
      where: { id },
    });
  }
}
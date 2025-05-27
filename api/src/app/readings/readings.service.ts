import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ReadingsService {
  constructor(private prisma: PrismaService) {}

  async findAll(runId?: string) {
    return this.prisma.reading.findMany({
      where: runId ? { runId } : undefined,
    });
  }

  async findOne(id: string) {
    return this.prisma.reading.findUnique({
      where: { id },
    });
  }

  async create(data: {
    runId: string;
    glucoseValue: number;
    timestamp: Date;
    mealContext?: string;
    notes?: string;
  }) {
    return this.prisma.reading.create({
      data,
    });
  }

  async update(id: string, data: {
    glucoseValue?: number;
    timestamp?: Date;
    mealContext?: string;
    notes?: string;
  }) {
    return this.prisma.reading.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.reading.delete({
      where: { id },
    });
  }
}
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Reading, CreateReadingDto, UpdateReadingDto } from '../../../../shared/api-interfaces/src';

@Injectable()
export class ReadingsService {
  constructor(private prisma: PrismaService) {}

  // Implementation using Prisma for database access
  async findAll(userId?: string, runId?: string): Promise<Reading[]> {
    const where: any = {};
    
    if (userId) {
      where.run = {
        userId
      };
    }
    
    if (runId) {
      where.runId = runId;
    }
    
    const readings = await this.prisma.reading.findMany({
      where,
      orderBy: {
        timestamp: 'desc',
      },
      include: {
        run: true
      }
    });

    // Map Prisma model to our interface
    return readings.map(reading => ({
      id: reading.id,
      value: reading.glucoseValue,
      timestamp: reading.timestamp,
      type: reading.mealContext || 'default',
      notes: reading.notes || '',
      runId: reading.runId,
      userId: reading.run?.userId || '',
      createdAt: reading.createdAt,
      updatedAt: reading.updatedAt
    }));
  }

  async findOne(id: string): Promise<Reading> {
    const reading = await this.prisma.reading.findUnique({
      where: { id },
      include: {
        run: true
      }
    });
    
    if (!reading) {
      throw new NotFoundException(`Reading with ID ${id} not found`);
    }
    
    // Map Prisma model to our interface
    return {
      id: reading.id,
      value: reading.glucoseValue,
      timestamp: reading.timestamp,
      type: reading.mealContext || 'default',
      notes: reading.notes || '',
      runId: reading.runId,
      userId: reading.run?.userId || '',
      createdAt: reading.createdAt,
      updatedAt: reading.updatedAt
    };
  }

  async create(createReadingDto: CreateReadingDto): Promise<Reading> {
    const reading = await this.prisma.reading.create({
      data: {
        glucoseValue: createReadingDto.value,
        mealContext: createReadingDto.type,
        timestamp: new Date(),
        notes: createReadingDto.notes,
        run: {
          connect: { id: createReadingDto.runId }
        }
      },
      include: {
        run: true
      }
    });

    // Map Prisma model to our interface
    return {
      id: reading.id,
      value: reading.glucoseValue,
      timestamp: reading.timestamp,
      type: reading.mealContext || 'default',
      notes: reading.notes || '',
      runId: reading.runId,
      userId: reading.run?.userId || createReadingDto.userId,
      createdAt: reading.createdAt,
      updatedAt: reading.updatedAt
    };
  }

  async update(id: string, updateReadingDto: UpdateReadingDto): Promise<Reading> {
    // Check if reading exists
    await this.findOne(id);
    
    // Prepare data for update
    const data: any = {};
    
    if (updateReadingDto.value !== undefined) {
      data.glucoseValue = updateReadingDto.value;
    }
    
    if (updateReadingDto.type !== undefined) {
      data.mealContext = updateReadingDto.type;
    }
    
    if (updateReadingDto.notes !== undefined) {
      data.notes = updateReadingDto.notes;
    }
    
    // Handle run relation
    if (updateReadingDto.runId !== undefined) {
      if (updateReadingDto.runId) {
        data.run = { connect: { id: updateReadingDto.runId } };
      } else {
        data.run = { disconnect: true };
      }
    }
    
    // Update the reading
    const reading = await this.prisma.reading.update({
      where: { id },
      data,
      include: {
        run: true
      }
    });

    // Map Prisma model to our interface
    return {
      id: reading.id,
      value: reading.glucoseValue,
      timestamp: reading.timestamp,
      type: reading.mealContext || 'default',
      notes: reading.notes || '',
      runId: reading.runId,
      userId: reading.run?.userId || '',
      createdAt: reading.createdAt,
      updatedAt: reading.updatedAt
    };
  }

  async delete(id: string): Promise<Reading> {
    // Check if reading exists
    const reading = await this.findOne(id);
    
    // Delete the reading
    await this.prisma.reading.delete({
      where: { id },
    });

    return reading;
  }

  async getStatistics(userId: string, type?: string): Promise<{ min: number; max: number; avg: number; count: number }> {
    // Build the query
    const query = this.prisma.$executeRaw`
      SELECT 
        MIN("glucoseValue") as min,
        MAX("glucoseValue") as max,
        AVG("glucoseValue") as avg,
        COUNT(*) as count
      FROM "Reading"
      JOIN "Run" ON "Reading"."runId" = "Run"."id"
      WHERE "Run"."userId" = ${userId}
      ${type ? this.prisma.$executeRaw`AND "Reading"."mealContext" = ${type}` : this.prisma.$executeRaw``}
    `;
    
    const result = await query;
    return result[0];
  }
}
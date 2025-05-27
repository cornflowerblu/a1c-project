import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

// Define Reading interface
interface Reading {
  id: string;
  value: number;
  timestamp: Date;
  type: string;
  unit?: string;
  notes?: string;
  runId?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define CreateReadingDto interface
interface CreateReadingDto {
  value: number;
  type: string;
  unit?: string;
  notes?: string;
  runId?: string;
  userId: string;
}

// Define UpdateReadingDto interface
interface UpdateReadingDto {
  value?: number;
  type?: string;
  unit?: string;
  notes?: string;
  runId?: string;
}

@Injectable()
export class ReadingsService {
  constructor(private prisma: PrismaService) {}

  // Implementation using Prisma for database access
  async findAll(userId?: string, runId?: string): Promise<Reading[]> {
    const where: any = {};
    
    if (userId) {
      where.userId = userId;
    }
    
    if (runId) {
      where.runId = runId;
    }
    
    return this.prisma.reading.findMany({
      where,
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<Reading> {
    const reading = await this.prisma.reading.findUnique({
      where: { id },
    });
    
    if (!reading) {
      throw new NotFoundException(`Reading with ID ${id} not found`);
    }
    
    return reading;
  }

  async create(createReadingDto: CreateReadingDto): Promise<Reading> {
    return this.prisma.reading.create({
      data: {
        value: createReadingDto.value,
        type: createReadingDto.type,
        unit: createReadingDto.unit,
        notes: createReadingDto.notes,
        user: {
          connect: { id: createReadingDto.userId },
        },
        ...(createReadingDto.runId && {
          run: {
            connect: { id: createReadingDto.runId },
          },
        }),
      },
    });
  }

  async update(id: string, updateReadingDto: UpdateReadingDto): Promise<Reading> {
    // Check if reading exists
    await this.findOne(id);
    
    // Prepare data for update
    const data: any = { ...updateReadingDto };
    
    // Remove runId from data and handle the relation separately
    if ('runId' in updateReadingDto) {
      delete data.runId;
      
      if (updateReadingDto.runId) {
        data.run = { connect: { id: updateReadingDto.runId } };
      } else {
        data.run = { disconnect: true };
      }
    }
    
    // Update the reading
    return this.prisma.reading.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Reading> {
    // Check if reading exists
    await this.findOne(id);
    
    // Delete the reading
    return this.prisma.reading.delete({
      where: { id },
    });
  }

  async getStatistics(userId: string, type?: string): Promise<{ min: number; max: number; avg: number; count: number }> {
    const where: any = { userId };
    
    if (type) {
      where.type = type;
    }
    
    const result = await this.prisma.$queryRaw`
      SELECT 
        MIN(value) as min,
        MAX(value) as max,
        AVG(value) as avg,
        COUNT(*) as count
      FROM "Reading"
      WHERE "userId" = ${userId}
      ${type ? this.prisma.$raw`AND "type" = ${type}` : this.prisma.$raw``}
    `;
    
    return result[0];
  }
}
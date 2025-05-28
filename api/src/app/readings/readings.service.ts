import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Reading, CreateReadingDto, UpdateReadingDto } from '@./api-interfaces';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ReadingsService {
  constructor(private prisma: PrismaService) {}

  // Implementation using Prisma for database access
  async findAll(userId?: string, runId?: string): Promise<Reading[]> {
    const where: any = {};
    
    if (userId) {
      // Validate userId is a UUID
      if (!isUUID(userId)) {
        throw new BadRequestException('Invalid user ID format');
      }
      
      where.run = {
        userId
      };
    }
    
    if (runId) {
      // Validate runId is a UUID
      if (!isUUID(runId)) {
        throw new BadRequestException('Invalid run ID format');
      }
      
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

    // Map Prisma model to our interface and sanitize output
    return readings.map(reading => ({
      id: reading.id,
      value: reading.glucoseValue,
      timestamp: reading.timestamp,
      type: this.sanitizeOutput(reading.mealContext) || 'default',
      notes: this.sanitizeOutput(reading.notes) || '',
      runId: reading.runId,
      userId: reading.run?.userId || '',
      createdAt: reading.createdAt,
      updatedAt: reading.updatedAt
    }));
  }

  async findOne(id: string): Promise<Reading> {
    // Validate id is a UUID
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid reading ID format');
    }
    
    const reading = await this.prisma.reading.findUnique({
      where: { id },
      include: {
        run: true
      }
    });
    
    if (!reading) {
      throw new NotFoundException(`Reading with ID ${id} not found`);
    }
    
    // Map Prisma model to our interface and sanitize output
    return {
      id: reading.id,
      value: reading.glucoseValue,
      timestamp: reading.timestamp,
      type: this.sanitizeOutput(reading.mealContext) || 'default',
      notes: this.sanitizeOutput(reading.notes) || '',
      runId: reading.runId,
      userId: reading.run?.userId || '',
      createdAt: reading.createdAt,
      updatedAt: reading.updatedAt
    };
  }

  async create(createReadingDto: CreateReadingDto): Promise<Reading> {
    // Validate input
    this.validateReadingDto(createReadingDto);
    
    // Sanitize input
    const sanitizedNotes = this.sanitizeInput(createReadingDto.notes || '');
    const sanitizedType = this.sanitizeInput(createReadingDto.type);
    
    try {
      const reading = await this.prisma.reading.create({
        data: {
          glucoseValue: createReadingDto.value,
          mealContext: sanitizedType,
          timestamp: new Date(),
          notes: sanitizedNotes,
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
        type: this.sanitizeOutput(reading.mealContext) || 'default',
        notes: this.sanitizeOutput(reading.notes) || '',
        runId: reading.runId,
        userId: reading.run?.userId || createReadingDto.userId,
        createdAt: reading.createdAt,
        updatedAt: reading.updatedAt
      };
    } catch (error) {
      // Handle database errors without exposing details
      throw new BadRequestException('Failed to create reading');
    }
  }

  async update(id: string, updateReadingDto: UpdateReadingDto): Promise<Reading> {
    // Validate id is a UUID
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid reading ID format');
    }
    
    // Validate input
    if (updateReadingDto.value !== undefined && (isNaN(updateReadingDto.value) || updateReadingDto.value < 0)) {
      throw new BadRequestException('Reading value must be a positive number');
    }
    
    // Check if reading exists
    await this.findOne(id);
    
    // Prepare data for update
    const data: any = {};
    
    if (updateReadingDto.value !== undefined) {
      data.glucoseValue = updateReadingDto.value;
    }
    
    if (updateReadingDto.type !== undefined) {
      data.mealContext = this.sanitizeInput(updateReadingDto.type);
    }
    
    if (updateReadingDto.notes !== undefined) {
      data.notes = this.sanitizeInput(updateReadingDto.notes);
    }
    
    // Handle run relation
    if (updateReadingDto.runId !== undefined) {
      if (updateReadingDto.runId) {
        // Validate runId is a UUID
        if (!isUUID(updateReadingDto.runId)) {
          throw new BadRequestException('Invalid run ID format');
        }
        
        data.run = { connect: { id: updateReadingDto.runId } };
      } else {
        data.run = { disconnect: true };
      }
    }
    
    try {
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
        type: this.sanitizeOutput(reading.mealContext) || 'default',
        notes: this.sanitizeOutput(reading.notes) || '',
        runId: reading.runId,
        userId: reading.run?.userId || '',
        createdAt: reading.createdAt,
        updatedAt: reading.updatedAt
      };
    } catch (error) {
      // Handle database errors without exposing details
      throw new BadRequestException('Failed to update reading');
    }
  }

  async delete(id: string): Promise<Reading> {
    // Validate id is a UUID
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid reading ID format');
    }
    
    // Check if reading exists
    const reading = await this.findOne(id);
    
    try {
      // Delete the reading
      await this.prisma.reading.delete({
        where: { id },
      });

      return reading;
    } catch (error) {
      // Handle database errors without exposing details
      throw new BadRequestException('Failed to delete reading');
    }
  }

  async getStatistics(userId: string, type?: string): Promise<{ min: number; max: number; avg: number; count: number }> {
    // Validate userId is a UUID
    if (!isUUID(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }
    
    // Sanitize type if provided
    const sanitizedType = type ? this.sanitizeInput(type) : undefined;
    
    // Use Prisma's safe query methods instead of raw SQL
    const readings = await this.prisma.reading.findMany({
      where: {
        run: {
          userId: userId,
          ...(sanitizedType && { mealContext: sanitizedType })
        }
      },
      select: {
        glucoseValue: true
      }
    });
    
    // Calculate statistics in JavaScript
    if (readings.length === 0) {
      return { min: 0, max: 0, avg: 0, count: 0 };
    }
    
    const values = readings.map(r => r.glucoseValue);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const count = values.length;
    
    return { min, max, avg, count };
  }
  
  // Helper methods for input validation and sanitization
  
  private validateReadingDto(dto: CreateReadingDto): void {
    if (isNaN(dto.value) || dto.value < 0) {
      throw new BadRequestException('Reading value must be a positive number');
    }
    
    if (!dto.type || dto.type.trim() === '') {
      throw new BadRequestException('Reading type is required');
    }
    
    if (dto.runId && !isUUID(dto.runId)) {
      throw new BadRequestException('Invalid run ID format');
    }
    
    if (!dto.userId || !isUUID(dto.userId)) {
      throw new BadRequestException('Valid user ID is required');
    }
  }
  
  private sanitizeInput(input: string | undefined): string {
    if (!input) return '';
    
    // Remove potentially dangerous characters
    return input
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/['"\\]/g, '') // Remove quotes and backslashes
      .trim();
  }
  
  private sanitizeOutput(input: string | undefined | null): string {
    if (!input) return '';
    
    // Encode HTML entities
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
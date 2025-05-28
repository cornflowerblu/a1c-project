import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Reading, CreateReadingDto, UpdateReadingDto } from '@./api-interfaces';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ReadingsService {
  constructor(private prisma: PrismaService) {}

  // Implementation using Prisma for database access
  async findAll(userId?: string, glucoseRunId?: string): Promise<Reading[]> {
    const where: any = {};
    
    if (userId) {
      // Validate userId is a UUID
      if (!isUUID(userId)) {
        throw new BadRequestException('Invalid user ID format');
      }
      
      where.userId = userId;
    }
    
    if (glucoseRunId) {
      // Validate glucoseRunId is a UUID
      if (!isUUID(glucoseRunId)) {
        throw new BadRequestException('Invalid run ID format');
      }
      
      where.glucoseRunId = glucoseRunId;
    }
    
    const readings = await this.prisma.reading.findMany({
      where,
      orderBy: {
        timestamp: 'desc',
      },
      include: {
        glucoseRun: true,
        user: true
      }
    });

    // Map Prisma model to our interface and sanitize output
    return readings.map(reading => ({
      id: reading.id,
      glucoseValue: reading.glucoseValue,
      timestamp: reading.timestamp,
      mealContext: this.sanitizeOutput(reading.mealContext) || '',
      notes: this.sanitizeOutput(reading.notes) || '',
      glucoseRunId: reading.glucoseRunId,
      userId: reading.userId,
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
        glucoseRun: true,
        user: true
      }
    });
    
    if (!reading) {
      throw new NotFoundException(`Reading with ID ${id} not found`);
    }
    
    // Map Prisma model to our interface and sanitize output
    return {
      id: reading.id,
      glucoseValue: reading.glucoseValue,
      timestamp: reading.timestamp,
      mealContext: this.sanitizeOutput(reading.mealContext) || '',
      notes: this.sanitizeOutput(reading.notes) || '',
      glucoseRunId: reading.glucoseRunId,
      userId: reading.userId,
      createdAt: reading.createdAt,
      updatedAt: reading.updatedAt
    };
  }

  async create(createReadingDto: CreateReadingDto): Promise<Reading> {
    // Validate input
    this.validateReadingDto(createReadingDto);
    
    // Sanitize input
    const sanitizedNotes = this.sanitizeInput(createReadingDto.notes || '');
    const sanitizedMealContext = this.sanitizeInput(createReadingDto.mealContext || '');
    
    try {
      const reading = await this.prisma.reading.create({
        data: {
          glucoseValue: createReadingDto.glucoseValue,
          mealContext: sanitizedMealContext,
          timestamp: createReadingDto.timestamp || new Date(),
          notes: sanitizedNotes,
          glucoseRun: {
            connect: { id: createReadingDto.glucoseRunId }
          },
          user: {
            connect: { id: createReadingDto.userId }
          }
        },
        include: {
          glucoseRun: true,
          user: true
        }
      });

      // Map Prisma model to our interface
      return {
        id: reading.id,
        glucoseValue: reading.glucoseValue,
        timestamp: reading.timestamp,
        mealContext: this.sanitizeOutput(reading.mealContext) || '',
        notes: this.sanitizeOutput(reading.notes) || '',
        glucoseRunId: reading.glucoseRunId,
        userId: reading.userId,
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
    if (updateReadingDto.glucoseValue !== undefined && (isNaN(updateReadingDto.glucoseValue) || updateReadingDto.glucoseValue < 0)) {
      throw new BadRequestException('Reading value must be a positive number');
    }
    
    // Check if reading exists
    await this.findOne(id);
    
    // Prepare data for update
    const data: any = {};
    
    if (updateReadingDto.glucoseValue !== undefined) {
      data.glucoseValue = updateReadingDto.glucoseValue;
    }
    
    if (updateReadingDto.mealContext !== undefined) {
      data.mealContext = this.sanitizeInput(updateReadingDto.mealContext);
    }
    
    if (updateReadingDto.timestamp !== undefined) {
      data.timestamp = updateReadingDto.timestamp;
    }
    
    if (updateReadingDto.notes !== undefined) {
      data.notes = this.sanitizeInput(updateReadingDto.notes);
    }
    
    // Handle glucoseRun relation
    if (updateReadingDto.glucoseRunId !== undefined) {
      if (updateReadingDto.glucoseRunId) {
        // Validate glucoseRunId is a UUID
        if (!isUUID(updateReadingDto.glucoseRunId)) {
          throw new BadRequestException('Invalid run ID format');
        }
        
        data.glucoseRun = { connect: { id: updateReadingDto.glucoseRunId } };
      } else {
        data.glucoseRun = { disconnect: true };
      }
    }
    
    try {
      // Update the reading
      const reading = await this.prisma.reading.update({
        where: { id },
        data,
        include: {
          glucoseRun: true,
          user: true
        }
      });

      // Map Prisma model to our interface
      return {
        id: reading.id,
        glucoseValue: reading.glucoseValue,
        timestamp: reading.timestamp,
        mealContext: this.sanitizeOutput(reading.mealContext) || '',
        notes: this.sanitizeOutput(reading.notes) || '',
        glucoseRunId: reading.glucoseRunId,
        userId: reading.userId,
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

  async getStatistics(userId: string, mealContext?: string): Promise<{ min: number; max: number; avg: number; count: number }> {
    // Validate userId is a UUID
    if (!isUUID(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }
    
    // Sanitize mealContext if provided
    const sanitizedMealContext = mealContext ? this.sanitizeInput(mealContext) : undefined;
    
    // Use Prisma's safe query methods instead of raw SQL
    const readings = await this.prisma.reading.findMany({
      where: {
        userId: userId,
        ...(sanitizedMealContext && { mealContext: sanitizedMealContext })
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
    if (isNaN(dto.glucoseValue) || dto.glucoseValue < 0) {
      throw new BadRequestException('Reading value must be a positive number');
    }
    
    if (!dto.timestamp) {
      throw new BadRequestException('Timestamp is required');
    }
    
    if (!dto.glucoseRunId || !isUUID(dto.glucoseRunId)) {
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
      .replace(/['\"\\\\]/g, '') // Remove quotes and backslashes
      .trim();
  }
  
  private sanitizeOutput(input: string | undefined | null): string {
    if (!input) return '';
    
    // Encode HTML entities
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
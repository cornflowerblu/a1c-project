import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Run, CreateRunDto, UpdateRunDto } from '@./api-interfaces';
import { validate as isUUID } from 'uuid';

@Injectable()
export class RunsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId?: string): Promise<Run[]> {
    try {
      // Validate userId if provided
      if (userId && !isUUID(userId)) {
        throw new BadRequestException('Invalid user ID format');
      }
      
      const where = userId ? { userId } : {};
      
      const runs = await this.prisma.run.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          glucoseReadings: true,
        },
      });

      // Map Prisma model to our interface and sanitize output
      return runs.map(run => ({
        id: run.id,
        startDate: run.startDate,
        endDate: run.endDate || undefined,
        estimatedA1C: run.estimatedA1C || undefined,
        notes: this.sanitizeOutput(run.notes) || '',
        userId: run.userId,
        createdAt: run.createdAt,
        updatedAt: run.updatedAt
      }));
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      // Handle database errors without exposing details
      throw new BadRequestException('Failed to retrieve runs');
    }
  }

  async findOne(id: string): Promise<Run> {
    // Validate id is a UUID
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid run ID format');
    }
    
    try {
      const run = await this.prisma.run.findUnique({
        where: { id },
        include: {
          glucoseReadings: true,
        },
      });
      
      if (!run) {
        throw new NotFoundException(`Run with ID ${id} not found`);
      }
      
      // Map Prisma model to our interface and sanitize output
      return {
        id: run.id,
        startDate: run.startDate,
        endDate: run.endDate || undefined,
        estimatedA1C: run.estimatedA1C || undefined,
        notes: this.sanitizeOutput(run.notes) || '',
        userId: run.userId,
        createdAt: run.createdAt,
        updatedAt: run.updatedAt
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      // Handle database errors without exposing details
      throw new BadRequestException('Failed to retrieve run');
    }
  }

  async create(createRunDto: CreateRunDto): Promise<Run> {
    // Validate input
    this.validateRunDto(createRunDto);
    
    // Sanitize input
    const sanitizedNotes = this.sanitizeInput(createRunDto.notes || '');
    
    try {
      const run = await this.prisma.run.create({
        data: {
          startDate: createRunDto.startDate || new Date(),
          endDate: createRunDto.endDate,
          estimatedA1C: createRunDto.estimatedA1C,
          notes: sanitizedNotes,
          user: {
            connect: { id: createRunDto.userId },
          },
        },
      });

      // Map Prisma model to our interface
      return {
        id: run.id,
        startDate: run.startDate,
        endDate: run.endDate || undefined,
        estimatedA1C: run.estimatedA1C || undefined,
        notes: this.sanitizeOutput(run.notes) || '',
        userId: run.userId,
        createdAt: run.createdAt,
        updatedAt: run.updatedAt
      };
    } catch (error) {
      // Handle database errors without exposing details
      throw new BadRequestException('Failed to create run');
    }
  }

  async update(id: string, updateRunDto: UpdateRunDto): Promise<Run> {
    // Validate id is a UUID
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid run ID format');
    }
    
    // Check if run exists
    await this.findOne(id);
    
    // Prepare data for update
    const data: any = {};
    
    if (updateRunDto.notes !== undefined) {
      data.notes = this.sanitizeInput(updateRunDto.notes);
    }
    
    if (updateRunDto.startDate !== undefined) {
      data.startDate = updateRunDto.startDate;
    }
    
    if (updateRunDto.endDate !== undefined) {
      data.endDate = updateRunDto.endDate;
    }
    
    if (updateRunDto.estimatedA1C !== undefined) {
      data.estimatedA1C = updateRunDto.estimatedA1C;
    }
    
    try {
      // Update the run
      const run = await this.prisma.run.update({
        where: { id },
        data,
      });

      // Map Prisma model to our interface
      return {
        id: run.id,
        startDate: run.startDate,
        endDate: run.endDate || undefined,
        estimatedA1C: run.estimatedA1C || undefined,
        notes: this.sanitizeOutput(run.notes) || '',
        userId: run.userId,
        createdAt: run.createdAt,
        updatedAt: run.updatedAt
      };
    } catch (error) {
      // Handle database errors without exposing details
      throw new BadRequestException('Failed to update run');
    }
  }

  async delete(id: string): Promise<Run> {
    // Validate id is a UUID
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid run ID format');
    }
    
    // Check if run exists
    const run = await this.findOne(id);
    
    try {
      // Delete the run
      await this.prisma.run.delete({
        where: { id },
      });

      return run;
    } catch (error) {
      // Handle database errors without exposing details
      throw new BadRequestException('Failed to delete run');
    }
  }

  async completeRun(id: string): Promise<Run> {
    // Validate id is a UUID
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid run ID format');
    }
    
    try {
      // Check if run exists
      const run = await this.findOne(id);
      
      // Only allow completing if the run doesn't have an end date
      if (run.endDate) {
        throw new BadRequestException(`Run with ID ${id} is already completed`);
      }
      
      // Update the run with an end date
      return this.update(id, {
        endDate: new Date(),
      });
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      // Handle other errors without exposing details
      throw new BadRequestException('Failed to complete run');
    }
  }
  
  // Helper methods for input validation and sanitization
  
  private validateRunDto(dto: CreateRunDto): void {
    if (!dto.startDate) {
      throw new BadRequestException('Start date is required');
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
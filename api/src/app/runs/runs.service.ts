import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Run, RunStatus, CreateRunDto, UpdateRunDto } from '@shared/api-interfaces';
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
          readings: true,
        },
      });

      // Map Prisma model to our interface and sanitize output
      return runs.map(run => ({
        id: run.id,
        name: this.sanitizeOutput(run.notes) || 'Unnamed Run',
        description: '',
        status: RunStatus.PENDING,
        userId: run.userId,
        startedAt: run.startDate,
        completedAt: run.endDate || undefined,
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
          readings: true,
        },
      });
      
      if (!run) {
        throw new NotFoundException(`Run with ID ${id} not found`);
      }
      
      // Map Prisma model to our interface and sanitize output
      return {
        id: run.id,
        name: this.sanitizeOutput(run.notes) || 'Unnamed Run',
        description: '',
        status: RunStatus.PENDING,
        userId: run.userId,
        startedAt: run.startDate,
        completedAt: run.endDate || undefined,
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
    const sanitizedName = this.sanitizeInput(createRunDto.name);
    const sanitizedDescription = this.sanitizeInput(createRunDto.description || '');
    
    try {
      const run = await this.prisma.run.create({
        data: {
          notes: sanitizedName || sanitizedDescription,
          startDate: new Date(),
          user: {
            connect: { id: createRunDto.userId },
          },
        },
      });

      // Map Prisma model to our interface
      return {
        id: run.id,
        name: this.sanitizeOutput(run.notes) || 'Unnamed Run',
        description: sanitizedDescription,
        status: RunStatus.PENDING,
        userId: run.userId,
        startedAt: run.startDate,
        completedAt: run.endDate || undefined,
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
    
    if (updateRunDto.name || updateRunDto.description) {
      const sanitizedName = this.sanitizeInput(updateRunDto.name || '');
      const sanitizedDescription = this.sanitizeInput(updateRunDto.description || '');
      data.notes = sanitizedName || sanitizedDescription;
    }
    
    if (updateRunDto.startedAt) {
      data.startDate = updateRunDto.startedAt;
    }
    
    if (updateRunDto.completedAt) {
      data.endDate = updateRunDto.completedAt;
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
        name: this.sanitizeOutput(run.notes) || 'Unnamed Run',
        description: '',
        status: updateRunDto.status || RunStatus.PENDING,
        userId: run.userId,
        startedAt: run.startDate,
        completedAt: run.endDate || undefined,
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

  async startRun(id: string): Promise<Run> {
    // Validate id is a UUID
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid run ID format');
    }
    
    try {
      // Check if run exists
      const run = await this.findOne(id);
      
      // Only allow starting if the run is in PENDING status
      if (run.status !== RunStatus.PENDING) {
        throw new BadRequestException(`Run with ID ${id} cannot be started because it is in ${run.status} status`);
      }
      
      // Update the run status and startedAt timestamp
      return this.update(id, {
        status: RunStatus.RUNNING,
        startedAt: new Date(),
      });
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      // Handle other errors without exposing details
      throw new BadRequestException('Failed to start run');
    }
  }

  async completeRun(id: string, success: boolean = true): Promise<Run> {
    // Validate id is a UUID
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid run ID format');
    }
    
    try {
      // Check if run exists
      const run = await this.findOne(id);
      
      // Only allow completing if the run is in RUNNING status
      if (run.status !== RunStatus.RUNNING) {
        throw new BadRequestException(`Run with ID ${id} cannot be completed because it is in ${run.status} status`);
      }
      
      // Update the run status and completedAt timestamp
      return this.update(id, {
        status: success ? RunStatus.COMPLETED : RunStatus.FAILED,
        completedAt: new Date(),
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
    if (!dto.name || dto.name.trim() === '') {
      throw new BadRequestException('Run name is required');
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
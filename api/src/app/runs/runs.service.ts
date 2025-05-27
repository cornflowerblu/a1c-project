import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Run, RunStatus, CreateRunDto, UpdateRunDto } from '../../../../shared/api-interfaces/src';

@Injectable()
export class RunsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId?: string): Promise<Run[]> {
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

    // Map Prisma model to our interface
    return runs.map(run => ({
      id: run.id,
      name: run.notes || 'Unnamed Run',
      description: '',
      status: RunStatus.PENDING,
      userId: run.userId,
      startedAt: run.startDate,
      completedAt: run.endDate || undefined,
      createdAt: run.createdAt,
      updatedAt: run.updatedAt
    }));
  }

  async findOne(id: string): Promise<Run> {
    const run = await this.prisma.run.findUnique({
      where: { id },
      include: {
        readings: true,
      },
    });
    
    if (!run) {
      throw new NotFoundException(`Run with ID ${id} not found`);
    }
    
    // Map Prisma model to our interface
    return {
      id: run.id,
      name: run.notes || 'Unnamed Run',
      description: '',
      status: RunStatus.PENDING,
      userId: run.userId,
      startedAt: run.startDate,
      completedAt: run.endDate || undefined,
      createdAt: run.createdAt,
      updatedAt: run.updatedAt
    };
  }

  async create(createRunDto: CreateRunDto): Promise<Run> {
    const run = await this.prisma.run.create({
      data: {
        notes: createRunDto.name || createRunDto.description,
        startDate: new Date(),
        user: {
          connect: { id: createRunDto.userId },
        },
      },
    });

    // Map Prisma model to our interface
    return {
      id: run.id,
      name: run.notes || 'Unnamed Run',
      description: createRunDto.description || '',
      status: RunStatus.PENDING,
      userId: run.userId,
      startedAt: run.startDate,
      completedAt: run.endDate || undefined,
      createdAt: run.createdAt,
      updatedAt: run.updatedAt
    };
  }

  async update(id: string, updateRunDto: UpdateRunDto): Promise<Run> {
    // Check if run exists
    await this.findOne(id);
    
    // Prepare data for update
    const data: any = {};
    
    if (updateRunDto.name || updateRunDto.description) {
      data.notes = updateRunDto.name || updateRunDto.description;
    }
    
    if (updateRunDto.startedAt) {
      data.startDate = updateRunDto.startedAt;
    }
    
    if (updateRunDto.completedAt) {
      data.endDate = updateRunDto.completedAt;
    }
    
    // Update the run
    const run = await this.prisma.run.update({
      where: { id },
      data,
    });

    // Map Prisma model to our interface
    return {
      id: run.id,
      name: run.notes || 'Unnamed Run',
      description: '',
      status: updateRunDto.status || RunStatus.PENDING,
      userId: run.userId,
      startedAt: run.startDate,
      completedAt: run.endDate || undefined,
      createdAt: run.createdAt,
      updatedAt: run.updatedAt
    };
  }

  async delete(id: string): Promise<Run> {
    // Check if run exists
    const run = await this.findOne(id);
    
    // Delete the run
    await this.prisma.run.delete({
      where: { id },
    });

    return run;
  }

  async startRun(id: string): Promise<Run> {
    // Check if run exists
    const run = await this.findOne(id);
    
    // Only allow starting if the run is in PENDING status
    if (run.status !== RunStatus.PENDING) {
      throw new Error(`Run with ID ${id} cannot be started because it is in ${run.status} status`);
    }
    
    // Update the run status and startedAt timestamp
    return this.update(id, {
      status: RunStatus.RUNNING,
      startedAt: new Date(),
    });
  }

  async completeRun(id: string, success: boolean = true): Promise<Run> {
    // Check if run exists
    const run = await this.findOne(id);
    
    // Only allow completing if the run is in RUNNING status
    if (run.status !== RunStatus.RUNNING) {
      throw new Error(`Run with ID ${id} cannot be completed because it is in ${run.status} status`);
    }
    
    // Update the run status and completedAt timestamp
    return this.update(id, {
      status: success ? RunStatus.COMPLETED : RunStatus.FAILED,
      completedAt: new Date(),
    });
  }
}
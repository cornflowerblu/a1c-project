import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

// Define Run interface
enum RunStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

interface Run {
  id: string;
  name: string;
  description?: string;
  status: RunStatus;
  startedAt?: Date;
  completedAt?: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define CreateRunDto interface
interface CreateRunDto {
  name: string;
  description?: string;
  userId: string;
}

// Define UpdateRunDto interface
interface UpdateRunDto {
  name?: string;
  description?: string;
  status?: RunStatus;
  startedAt?: Date;
  completedAt?: Date;
}

@Injectable()
export class RunsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId?: string): Promise<Run[]> {
    const where = userId ? { userId } : {};
    
    return this.prisma.run.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        readings: {
          select: {
            id: true,
            value: true,
            type: true,
            timestamp: true,
          },
        },
      },
    });
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
    
    return run;
  }

  async create(createRunDto: CreateRunDto): Promise<Run> {
    return this.prisma.run.create({
      data: {
        name: createRunDto.name,
        description: createRunDto.description,
        user: {
          connect: { id: createRunDto.userId },
        },
      },
    });
  }

  async update(id: string, updateRunDto: UpdateRunDto): Promise<Run> {
    // Check if run exists
    await this.findOne(id);
    
    // Update the run
    return this.prisma.run.update({
      where: { id },
      data: updateRunDto,
    });
  }

  async delete(id: string): Promise<Run> {
    // Check if run exists
    await this.findOne(id);
    
    // Delete the run
    return this.prisma.run.delete({
      where: { id },
    });
  }

  async startRun(id: string): Promise<Run> {
    // Check if run exists
    const run = await this.findOne(id);
    
    // Only allow starting if the run is in PENDING status
    if (run.status !== RunStatus.PENDING) {
      throw new Error(`Run with ID ${id} cannot be started because it is in ${run.status} status`);
    }
    
    // Update the run status and startedAt timestamp
    return this.prisma.run.update({
      where: { id },
      data: {
        status: RunStatus.RUNNING,
        startedAt: new Date(),
      },
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
    return this.prisma.run.update({
      where: { id },
      data: {
        status: success ? RunStatus.COMPLETED : RunStatus.FAILED,
        completedAt: new Date(),
      },
    });
  }
}
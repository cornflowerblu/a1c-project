import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { RunsService } from './runs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// Define DTOs
enum RunStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

interface CreateRunDto {
  name: string;
  description?: string;
  userId: string;
}

interface UpdateRunDto {
  name?: string;
  description?: string;
  status?: RunStatus;
  startedAt?: Date;
  completedAt?: Date;
}

@Controller('runs')
export class RunsController {
  constructor(private readonly runsService: RunsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query('userId') userId?: string) {
    return this.runsService.findAll(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.runsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRunDto: CreateRunDto) {
    return this.runsService.create(createRunDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRunDto: UpdateRunDto,
  ) {
    return this.runsService.update(id, updateRunDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.runsService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/start')
  async startRun(@Param('id') id: string) {
    return this.runsService.startRun(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/complete')
  async completeRun(
    @Param('id') id: string,
    @Body('success') success: boolean = true,
  ) {
    return this.runsService.completeRun(id, success);
  }
}
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { RunsService } from './runs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('runs')
@UseGuards(JwtAuthGuard)
export class RunsController {
  constructor(private readonly runsService: RunsService) {}

  @Get()
  async findAll(@Query('userId') userId?: string) {
    return this.runsService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.runsService.findOne(id);
  }

  @Post()
  async create(@Body() data: {
    userId: string;
    startDate: Date;
    endDate?: Date;
    estimatedA1C?: number;
    notes?: string;
  }) {
    return this.runsService.create(data);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: {
      startDate?: Date;
      endDate?: Date;
      estimatedA1C?: number;
      notes?: string;
    },
  ) {
    return this.runsService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.runsService.delete(id);
  }
}
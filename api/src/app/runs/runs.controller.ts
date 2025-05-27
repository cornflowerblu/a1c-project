import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request } from '@nestjs/common';
import { RunsService } from './runs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateRunDto, UpdateRunDto, ApiResponse, Run } from '@./source/shared/api-interfaces';

@Controller('runs')
@UseGuards(JwtAuthGuard)
export class RunsController {
  constructor(private readonly runsService: RunsService) {}

  @Get()
  async findAll(@Request() req): Promise<ApiResponse<Run[]>> {
    const runs = await this.runsService.findAll(req.user.id);
    return {
      statusCode: 200,
      data: runs,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req): Promise<ApiResponse<Run>> {
    const run = await this.runsService.findOne(id, req.user.id);
    return {
      statusCode: 200,
      data: run,
    };
  }

  @Post()
  async create(@Body() createRunDto: CreateRunDto, @Request() req): Promise<ApiResponse<Run>> {
    const run = await this.runsService.create(req.user.id, createRunDto);
    return {
      statusCode: 201,
      data: run,
      message: 'Run created successfully',
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRunDto: UpdateRunDto,
    @Request() req,
  ): Promise<ApiResponse<Run>> {
    const run = await this.runsService.update(id, req.user.id, updateRunDto);
    return {
      statusCode: 200,
      data: run,
      message: 'Run updated successfully',
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req): Promise<ApiResponse<Run>> {
    const run = await this.runsService.remove(id, req.user.id);
    return {
      statusCode: 200,
      data: run,
      message: 'Run deleted successfully',
    };
  }

  @Get(':id/estimate')
  async calculateA1C(@Param('id') id: string, @Request() req): Promise<ApiResponse<{ estimatedA1C: number }>> {
    const estimatedA1C = await this.runsService.calculateA1C(id, req.user.id);
    return {
      statusCode: 200,
      data: { estimatedA1C },
    };
  }
}
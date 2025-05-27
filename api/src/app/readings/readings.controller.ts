import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request } from '@nestjs/common';
import { ReadingsService } from './readings.service';
import { ApiResponse, CreateReadingDto, GlucoseReading, UpdateReadingDto } from '../../../../shared/api-interfaces/src';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('readings')
@UseGuards(JwtAuthGuard)
export class ReadingsController {
  constructor(private readonly readingsService: ReadingsService) {}

  @Get('run/:runId')
  async findAllByRun(@Param('runId') runId: string, @Request() req): Promise<ApiResponse<GlucoseReading[]>> {
    const readings = await this.readingsService.findAllByRun(runId, req.user.id);
    return {
      statusCode: 200,
      data: readings,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req): Promise<ApiResponse<GlucoseReading>> {
    const reading = await this.readingsService.findOne(id, req.user.id);
    return {
      statusCode: 200,
      data: reading,
    };
  }

  @Post('run/:runId')
  async create(
    @Param('runId') runId: string,
    @Body() createReadingDto: CreateReadingDto,
    @Request() req,
  ): Promise<ApiResponse<GlucoseReading>> {
    const reading = await this.readingsService.create(runId, createReadingDto, req.user.id);
    return {
      statusCode: 201,
      data: reading,
      message: 'Reading created successfully',
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateReadingDto: UpdateReadingDto,
    @Request() req,
  ): Promise<ApiResponse<GlucoseReading>> {
    const reading = await this.readingsService.update(id, updateReadingDto, req.user.id);
    return {
      statusCode: 200,
      data: reading,
      message: 'Reading updated successfully',
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req): Promise<ApiResponse<null>> {
    await this.readingsService.remove(id, req.user.id);
    return {
      statusCode: 200,
      message: 'Reading deleted successfully',
    };
  }
}
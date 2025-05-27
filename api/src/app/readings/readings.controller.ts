import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request, Query } from '@nestjs/common';
import { ReadingsService } from './readings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateGlucoseReadingDto, UpdateGlucoseReadingDto, ApiResponse, GlucoseReading } from '@./source/shared/api-interfaces';

@Controller('readings')
@UseGuards(JwtAuthGuard)
export class ReadingsController {
  constructor(private readonly readingsService: ReadingsService) {}

  @Get()
  async findAll(@Query('runId') runId: string, @Request() req): Promise<ApiResponse<GlucoseReading[]>> {
    const readings = await this.readingsService.findAll(runId, req.user.id);
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

  @Post()
  async create(@Body() createReadingDto: CreateGlucoseReadingDto, @Request() req): Promise<ApiResponse<GlucoseReading>> {
    const reading = await this.readingsService.create(req.user.id, createReadingDto);
    return {
      statusCode: 201,
      data: reading,
      message: 'Reading created successfully',
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateReadingDto: UpdateGlucoseReadingDto,
    @Request() req,
  ): Promise<ApiResponse<GlucoseReading>> {
    const reading = await this.readingsService.update(id, req.user.id, updateReadingDto);
    return {
      statusCode: 200,
      data: reading,
      message: 'Reading updated successfully',
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req): Promise<ApiResponse<GlucoseReading>> {
    const reading = await this.readingsService.remove(id, req.user.id);
    return {
      statusCode: 200,
      data: reading,
      message: 'Reading deleted successfully',
    };
  }
}
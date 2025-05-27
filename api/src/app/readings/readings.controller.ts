import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ReadingsService } from './readings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// Define DTOs
interface CreateReadingDto {
  value: number;
  type: string;
  unit?: string;
  notes?: string;
  runId?: string;
  userId: string;
}

interface UpdateReadingDto {
  value?: number;
  type?: string;
  unit?: string;
  notes?: string;
  runId?: string;
}

@Controller('readings')
export class ReadingsController {
  constructor(private readonly readingsService: ReadingsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Query('userId') userId?: string,
    @Query('runId') runId?: string,
  ) {
    return this.readingsService.findAll(userId, runId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('statistics')
  async getStatistics(
    @Query('userId') userId: string,
    @Query('type') type?: string,
  ) {
    return this.readingsService.getStatistics(userId, type);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.readingsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createReadingDto: CreateReadingDto) {
    return this.readingsService.create(createReadingDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateReadingDto: UpdateReadingDto,
  ) {
    return this.readingsService.update(id, updateReadingDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.readingsService.delete(id);
  }
}
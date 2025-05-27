import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus, ParseUUIDPipe, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ReadingsService } from './readings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateReadingDto, UpdateReadingDto } from '@shared/api-interfaces';

@Controller('readings')
export class ReadingsController {
  constructor(private readonly readingsService: ReadingsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Query('userId', new ParseUUIDPipe({ version: '4', optional: true })) userId?: string,
    @Query('runId', new ParseUUIDPipe({ version: '4', optional: true })) runId?: string,
  ) {
    try {
      return await this.readingsService.findAll(userId, runId);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve readings');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('statistics')
  async getStatistics(
    @Query('userId', new ParseUUIDPipe({ version: '4' })) userId: string,
    @Query('type') type?: string,
  ) {
    try {
      return await this.readingsService.getStatistics(userId, type);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve statistics');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    try {
      return await this.readingsService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve reading');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createReadingDto: CreateReadingDto) {
    try {
      return await this.readingsService.create(createReadingDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create reading');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateReadingDto: UpdateReadingDto,
  ) {
    try {
      return await this.readingsService.update(id, updateReadingDto);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update reading');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    try {
      await this.readingsService.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete reading');
    }
  }
}

import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus, ParseUUIDPipe, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { RunsService } from './runs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateRunDto, UpdateRunDto, RunStatus } from '@./api-interfaces';

@Controller('runs')
export class RunsController {
  constructor(private readonly runsService: RunsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Query('userId', new ParseUUIDPipe({ version: '4', optional: true })) userId?: string
  ) {
    try {
      return await this.runsService.findAll(userId);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve runs');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    try {
      return await this.runsService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve run');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRunDto: CreateRunDto) {
    try {
      // Validate userId is a UUID
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(createRunDto.userId)) {
        throw new BadRequestException('Invalid user ID format');
      }
      
      return await this.runsService.create(createRunDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create run');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateRunDto: UpdateRunDto,
  ) {
    try {
      return await this.runsService.update(id, updateRunDto);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update run');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    try {
      await this.runsService.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete run');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/start')
  async startRun(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    try {
      return await this.runsService.startRun(id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to start run');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/complete')
  async completeRun(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body('success') success: boolean = true,
  ) {
    try {
      return await this.runsService.completeRun(id, success);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to complete run');
    }
  }
}

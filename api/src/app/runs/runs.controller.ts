import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request } from '@nestjs/common';
import { RunsService } from './runs.service';
import { CreateRunDto } from './dto/create-run.dto';
import { UpdateRunDto } from './dto/update-run.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('runs')
@UseGuards(JwtAuthGuard)
export class RunsController {
  constructor(private readonly runsService: RunsService) {}

  @Post()
  create(@Request() req, @Body() createRunDto: CreateRunDto) {
    return this.runsService.create(req.user.id, createRunDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.runsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.runsService.findOne(id, req.user.id);
  }

  @Put(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateRunDto: UpdateRunDto) {
    return this.runsService.update(id, req.user.id, updateRunDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.runsService.remove(id, req.user.id);
  }

  @Get(':id/estimate')
  calculateA1C(@Request() req, @Param('id') id: string) {
    return this.runsService.calculateA1C(id, req.user.id);
  }
}
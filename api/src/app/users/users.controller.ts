import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User, UserRole } from '../../../../shared/api-interfaces/src';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User | undefined> {
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() userData: { email: string; name: string; password?: string; role?: UserRole }): Promise<User> {
    return this.usersService.create(userData);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() userData: Partial<User>): Promise<User> {
    return this.usersService.update(id, userData);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<User> {
    return this.usersService.delete(id);
  }
}

import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, HttpCode, HttpStatus, NotFoundException, ConflictException, ParseUUIDPipe, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User, UserRole } from '@shared/api-interfaces';

// DTO interfaces
interface CreateUserDto {
  email: string;
  name: string;
  password: string;
  role?: UserRole;
}

interface UpdateUserDto {
  email?: string;
  name?: string;
  password?: string;
  role?: UserRole;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(): Promise<User[]> {
    try {
      return await this.usersService.findAll();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve users');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<User | undefined> {
    try {
      return await this.usersService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve user');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    try {
      // Validate email format
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(createUserDto.email)) {
        throw new BadRequestException('Invalid email format');
      }
      
      // Validate password strength
      if (!createUserDto.password || createUserDto.password.length < 8) {
        throw new BadRequestException('Password must be at least 8 characters long');
      }
      
      return await this.usersService.create(
        createUserDto.email,
        createUserDto.name,
        createUserDto.password,
        createUserDto.role
      );
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string, 
    @Body() updateUserDto: UpdateUserDto
  ): Promise<User> {
    try {
      // Validate email format if provided
      if (updateUserDto.email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(updateUserDto.email)) {
          throw new BadRequestException('Invalid email format');
        }
      }
      
      // Validate password strength if provided
      if (updateUserDto.password && updateUserDto.password.length < 8) {
        throw new BadRequestException('Password must be at least 8 characters long');
      }
      
      return await this.usersService.update(id, updateUserDto);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<void> {
    try {
      await this.usersService.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}

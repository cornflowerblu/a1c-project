import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { User, UserRole } from '@shared/api-interfaces';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';
import { validate as isUUID } from 'uuid';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Implementation using Prisma instead of in-memory arrays
  async findOne(id: string): Promise<User | undefined> {
    // Validate id is a UUID
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid user ID format');
    }
    
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });
      
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      
      // Map Prisma model to our interface and sanitize output
      return {
        id: user.id,
        email: this.sanitizeOutput(user.email),
        name: this.sanitizeOutput(user.name) || '',
        role: user.role as UserRole,
        password: undefined, // Don't return password in response
        clerkId: user.clerkId || undefined,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      // Handle database errors without exposing details
      throw new BadRequestException('Failed to retrieve user');
    }
  }

  async findByEmail(email: string): Promise<User | undefined> {
    // Validate email
    if (!this.isValidEmail(email)) {
      throw new BadRequestException('Invalid email format');
    }
    
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });
      
      if (!user) {
        return undefined;
      }
      
      // Map Prisma model to our interface and sanitize output
      return {
        id: user.id,
        email: this.sanitizeOutput(user.email),
        name: this.sanitizeOutput(user.name) || '',
        role: user.role as UserRole,
        password: user.password, // Keep password for internal validation
        clerkId: user.clerkId || undefined,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    } catch (error) {
      // Handle database errors without exposing details
      throw new BadRequestException('Failed to retrieve user by email');
    }
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    // Validate email
    if (!this.isValidEmail(email)) {
      throw new BadRequestException('Invalid email format');
    }
    
    try {
      const user = await this.findByEmail(email);
      
      if (!user || !user.password) {
        return null;
      }
      
      // Compare the provided password with the stored hash
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return null;
      }
      
      // Remove password from returned user object
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      // Handle other errors without exposing details
      return null;
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const users = await this.prisma.user.findMany();
      
      // Map Prisma models to our interface and sanitize output
      return users.map(user => ({
        id: user.id,
        email: this.sanitizeOutput(user.email),
        name: this.sanitizeOutput(user.name) || '',
        role: user.role as UserRole,
        password: undefined, // Don't return passwords in response
        clerkId: user.clerkId || undefined,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }));
    } catch (error) {
      // Handle database errors without exposing details
      throw new BadRequestException('Failed to retrieve users');
    }
  }

  async create(email: string, name: string, password: string, role: UserRole = UserRole.USER): Promise<User> {
    // Validate input
    if (!this.isValidEmail(email)) {
      throw new BadRequestException('Invalid email format');
    }
    
    if (!name || name.trim() === '') {
      throw new BadRequestException('Name is required');
    }
    
    if (!password || password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }
    
    // Sanitize input
    const sanitizedEmail = this.sanitizeInput(email);
    const sanitizedName = this.sanitizeInput(name);
    
    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: sanitizedEmail },
      });
      
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create the user
      const user = await this.prisma.user.create({
        data: {
          email: sanitizedEmail,
          name: sanitizedName,
          password: hashedPassword,
          role: role.toString(),
        },
      });
      
      // Map Prisma model to our interface and sanitize output
      return {
        id: user.id,
        email: this.sanitizeOutput(user.email),
        name: this.sanitizeOutput(user.name) || '',
        role: user.role as UserRole,
        password: undefined, // Don't return password in response
        clerkId: user.clerkId || undefined,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      // Handle database errors without exposing details
      throw new BadRequestException('Failed to create user');
    }
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    // Validate id is a UUID
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid user ID format');
    }
    
    // Check if user exists
    await this.findOne(id);
    
    // Prepare data for update
    const updateData: any = {};
    
    if (data.email !== undefined) {
      if (!this.isValidEmail(data.email)) {
        throw new BadRequestException('Invalid email format');
      }
      updateData.email = this.sanitizeInput(data.email);
    }
    
    if (data.name !== undefined) {
      updateData.name = this.sanitizeInput(data.name);
    }
    
    if (data.role !== undefined) {
      // Validate role
      if (!Object.values(UserRole).includes(data.role)) {
        throw new BadRequestException('Invalid role');
      }
      updateData.role = data.role.toString();
    }
    
    if (data.password !== undefined) {
      if (data.password.length < 8) {
        throw new BadRequestException('Password must be at least 8 characters long');
      }
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    
    if (data.clerkId !== undefined) {
      updateData.clerkId = this.sanitizeInput(data.clerkId);
    }
    
    try {
      // Update the user
      const user = await this.prisma.user.update({
        where: { id },
        data: updateData,
      });
      
      // Map Prisma model to our interface and sanitize output
      return {
        id: user.id,
        email: this.sanitizeOutput(user.email),
        name: this.sanitizeOutput(user.name) || '',
        role: user.role as UserRole,
        password: undefined, // Don't return password in response
        clerkId: user.clerkId || undefined,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    } catch (error) {
      // Handle database errors without exposing details
      throw new BadRequestException('Failed to update user');
    }
  }

  async delete(id: string): Promise<User> {
    // Validate id is a UUID
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid user ID format');
    }
    
    // Check if user exists
    const user = await this.findOne(id);
    
    try {
      // Delete the user
      await this.prisma.user.delete({
        where: { id },
      });
      
      return user;
    } catch (error) {
      // Handle database errors without exposing details
      throw new BadRequestException('Failed to delete user');
    }
  }
  
  // Helper methods for input validation and sanitization
  
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
  
  private sanitizeInput(input: string | undefined): string {
    if (!input) return '';
    
    // Remove potentially dangerous characters
    return input
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/['"\\]/g, '') // Remove quotes and backslashes
      .trim();
  }
  
  private sanitizeOutput(input: string | undefined | null): string {
    if (!input) return '';
    
    // Encode HTML entities
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

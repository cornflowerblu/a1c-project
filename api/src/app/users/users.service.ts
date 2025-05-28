import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { User, UserRole } from '@./api-interfaces';
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
    // This method is kept for backward compatibility with auth service
    // but since we're using Clerk for authentication, we don't need to validate passwords
    try {
      const user = await this.findByEmail(email);
      
      if (!user) {
        return null;
      }
      
      // With Clerk, we would validate the user differently
      // For now, just return the user
      return user;
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
        clerkId: user.clerkId || undefined,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }));
    } catch (error) {
      // Handle database errors without exposing details
      throw new BadRequestException('Failed to retrieve users');
    }
  }

  async create(email: string, name: string, role: UserRole = UserRole.USER, clerkId?: string): Promise<User> {
    // Validate input
    if (!this.isValidEmail(email)) {
      throw new BadRequestException('Invalid email format');
    }
    
    // Sanitize input
    const sanitizedEmail = this.sanitizeInput(email);
    const sanitizedName = this.sanitizeInput(name);
    const sanitizedClerkId = clerkId ? this.sanitizeInput(clerkId) : undefined;
    
    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: sanitizedEmail },
      });
      
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
      
      // Create the user
      const user = await this.prisma.user.create({
        data: {
          email: sanitizedEmail,
          name: sanitizedName,
          role: role,
          clerkId: sanitizedClerkId,
        },
      });
      
      // Map Prisma model to our interface and sanitize output
      return {
        id: user.id,
        email: this.sanitizeOutput(user.email),
        name: this.sanitizeOutput(user.name) || '',
        role: user.role as UserRole,
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
      .replace(/['"\\\\]/g, '') // Remove quotes and backslashes
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
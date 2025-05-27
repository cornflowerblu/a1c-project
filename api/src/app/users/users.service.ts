import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { User, UserRole } from '@./api-interfaces';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Implementation using Prisma instead of in-memory arrays
  async findOne(id: string): Promise<User | undefined> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    // Map Prisma model to our interface
    return {
      id: user.id,
      email: user.email,
      name: user.name || '',
      role: user.role as UserRole,
      password: user.password,
      clerkId: user.clerkId || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      return undefined;
    }
    
    // Map Prisma model to our interface
    return {
      id: user.id,
      email: user.email,
      name: user.name || '',
      role: user.role as UserRole,
      password: user.password,
      clerkId: user.clerkId || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    
    if (!user || !user.password) {
      return null;
    }
    
    // Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return null;
    }
    
    return user;
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    
    // Map Prisma models to our interface
    return users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name || '',
      role: user.role as UserRole,
      password: user.password,
      clerkId: user.clerkId || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));
  }

  async create(email: string, name: string, password: string, role: UserRole = UserRole.USER): Promise<User> {
    // Check if user already exists
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create the user
    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role.toString(),
      },
    });
    
    // Map Prisma model to our interface
    return {
      id: user.id,
      email: user.email,
      name: user.name || '',
      role: user.role as UserRole,
      password: user.password,
      clerkId: user.clerkId || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    // Check if user exists
    await this.findOne(id);
    
    // Prepare data for update
    const updateData: any = {};
    
    if (data.email !== undefined) {
      updateData.email = data.email;
    }
    
    if (data.name !== undefined) {
      updateData.name = data.name;
    }
    
    if (data.role !== undefined) {
      updateData.role = data.role.toString();
    }
    
    if (data.password !== undefined) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    
    if (data.clerkId !== undefined) {
      updateData.clerkId = data.clerkId;
    }
    
    // Update the user
    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });
    
    // Map Prisma model to our interface
    return {
      id: user.id,
      email: user.email,
      name: user.name || '',
      role: user.role as UserRole,
      password: user.password,
      clerkId: user.clerkId || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  async delete(id: string): Promise<User> {
    // Check if user exists
    const user = await this.findOne(id);
    
    // Delete the user
    await this.prisma.user.delete({
      where: { id },
    });
    
    return user;
  }
}

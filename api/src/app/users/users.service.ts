import { Injectable } from '@nestjs/common';
import { User, UserRole } from '../../../../shared/api-interfaces/src';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string): Promise<User | undefined> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    
    if (!user || !user.password) {
      return null;
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return null;
    }
    
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async create(data: { email: string; name: string; password?: string; role?: UserRole }): Promise<User> {
    const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : null;
    
    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name || '',
        password: hashedPassword,
        role: data.role || UserRole.USER,
      },
    });
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}

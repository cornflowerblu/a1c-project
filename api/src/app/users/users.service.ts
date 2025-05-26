import { Injectable } from '@nestjs/common';
import { User, UserRole } from '../../../../shared/api-interfaces/src';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  // In-memory users for demo purposes
  // In a real application, you would use a database
  private readonly users: User[] = [
    {
      id: '1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      email: 'user@example.com',
      name: 'Regular User',
      role: UserRole.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // In-memory password storage (not for production)
  private readonly passwords: Record<string, string> = {
    '1': '$2b$10$8KVj4VlGO4TQNJHnVMF7UOIFVTtjYIHGKIwWqz.Yx8zIHTQVxvjJu', // 'admin123'
    '2': '$2b$10$8KVj4VlGO4TQNJHnVMF7UOIFVTtjYIHGKIwWqz.Yx8zIHTQVxvjJu', // 'user123'
  };

  async findOne(id: string): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email === email);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    
    if (!user) {
      return null;
    }
    
    const storedPassword = this.passwords[user.id];
    const isPasswordValid = await bcrypt.compare(password, storedPassword);
    
    if (!isPasswordValid) {
      return null;
    }
    
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.users;
  }
}

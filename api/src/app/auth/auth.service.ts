import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User, AuthResponse } from '@./api-interfaces';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    // This method is kept for backward compatibility
    // In a real implementation with Clerk, we would validate differently
    return this.usersService.validateUser(email, password);
  }

  async login(user: User): Promise<AuthResponse> {
    const payload = { email: user.email, sub: user.id, role: user.role };
    
    return {
      user,
      token: this.jwtService.sign(payload),
    };
  }
}
import { Controller, Post, UseGuards, Request, Body, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginRequest, AuthResponse } from '@./api-interfaces';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Body() loginRequest: LoginRequest): Promise<AuthResponse> {
    try {
      // Validate email format
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(loginRequest.email)) {
        throw new BadRequestException('Invalid email format');
      }
      
      // Validate password is provided
      if (!loginRequest.password || loginRequest.password.trim() === '') {
        throw new BadRequestException('Password is required');
      }
      
      return await this.authService.login(req.user);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Authentication failed');
    }
  }
}

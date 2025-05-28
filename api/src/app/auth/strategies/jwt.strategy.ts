import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { AppConfigService } from '../../config/config.service';

@Injectable()
export class ClerkJwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private configService: AppConfigService,
    private clerkService: ClerkService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.jwtSecret,
    });
  }

  async validate(token: string) {
    const session = await this.clerkService.verifyToken(token);
    if (!session) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    return session;
  }

  async validate(request: any, payload: any) {
    // Extract the token from the request
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }
  }
}

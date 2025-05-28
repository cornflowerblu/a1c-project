import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ClerkService } from '../services/clerk.service';

@Injectable()
export class ClerkJwtStrategy extends PassportStrategy(Strategy, 'clerk-jwt') {
  constructor(private readonly clerkService: ClerkService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKeyProvider: (request, rawJwtToken, done) => {
        // We'll verify the token with Clerk service instead of using a local secret
        done(null, 'clerk-verification'); // Placeholder, actual verification happens in validate
      },
    });
  }

  async validate(request: any, payload: any) {
    // Extract the token from the request
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    if (!token) {
      throw new UnauthorizedException('Invalid Authorization format');
    }

    // Verify the token with Clerk
    const session = await this.clerkService.verifyToken(token);
    if (!session) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Return the session data to be attached to the request
    return session;
  }
}

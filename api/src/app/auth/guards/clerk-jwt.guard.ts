import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class ClerkJwtGuard extends AuthGuard('clerk-jwt') {
  // This guard will use the 'clerk-jwt' strategy we created
  // You can add custom behavior here if needed
}

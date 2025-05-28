import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../auth.service";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const sessionId = request.headers['authorization']?.split(' ')[1];
    
    if (!sessionId) {
      throw new UnauthorizedException();
    }
    
    const user = await this.authService.validateSession(sessionId);
    if (!user) {
      throw new UnauthorizedException();
    }
    
    request.user = user;
    return true;
  }
}
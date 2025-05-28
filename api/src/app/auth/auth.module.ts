import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { ClerkJwtStrategy } from './strategies/clerk-jwt.strategy';
import { ClerkService } from './services/clerk.service';
import { AppConfigService } from '../config/config.service';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => ({
        secret: configService.jwtSecret,
        signOptions: { expiresIn: configService.jwtExpiration },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    ClerkJwtStrategy, 
    ClerkService
  ],
  exports: [AuthService, ClerkService],
})
export class AuthModule {}

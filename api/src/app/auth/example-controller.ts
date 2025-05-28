import { Controller, Get, UseGuards } from '@nestjs/common';
import { ClerkJwtGuard } from './guards/clerk-jwt.guard';
import { ClerkUser } from './decorators/clerk-user.decorator';

@Controller('example')
export class ExampleController {
  
  @Get('protected')
  @UseGuards(ClerkJwtGuard)
  getProtectedResource(@ClerkUser() user) {
    // The user object contains the Clerk session data
    return {
      message: 'This is a protected resource',
      userId: user.id,
      // You can access other user properties from the Clerk session
    };
  }
  
  @Get('protected-with-specific-data')
  @UseGuards(ClerkJwtGuard)
  getProtectedWithSpecificData(@ClerkUser('id') userId: string) {
    // Extract specific properties from the user object
    return {
      message: 'This endpoint extracts specific user data',
      userId,
    };
  }
}

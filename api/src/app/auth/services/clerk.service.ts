import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../config/config.service';
import { createClerkClient } from '@clerk/clerk-sdk-node';

@Injectable()
export class ClerkService {
  private clerkClient;

  constructor(private configService: AppConfigService) {
    // Initialize Clerk client with API key from config
    this.clerkClient = createClerkClient({
      secretKey: this.configService.get('CLERK_SECRET_KEY'),
    });
  }

  async verifyToken(token: string) {
    try {
      // Verify the JWT token with Clerk
      const session = await this.clerkClient.sessions.verifyToken(token);
      return session;
    } catch (error) {
      console.error('Error verifying Clerk token:', error);
      return null;
    }
  }

  async getUser(userId: string) {
    try {
      return await this.clerkClient.users.getUser(userId);
    } catch (error) {
      console.error('Error fetching user from Clerk:', error);
      return null;
    }
  }
}

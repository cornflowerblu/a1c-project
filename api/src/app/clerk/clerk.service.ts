// clerk.service.ts
import { Injectable } from '@nestjs/common';
import { clerkClient, verifySessionToken } from '@clerk/backend';

@Injectable()
export class ClerkService {
  async verifyToken(token: string) {
    try {
      const session = await verifySessionToken(token);
      return session; // contains userId, sessionId, etc.
    } catch (err) {
      console.error('Invalid Clerk session token', err);
      return null;
    }
  }

  async getUser(userId: string) {
    return await clerkClient.users.getUser(userId);
  }
}
# Authentication Strategy for Clerk Webhooks

## Current Setup

- The application uses a JwtAuthGuard for API authentication
- The webhook endpoint in `web/src/app/api/webhook/clerk/route.ts` receives events from Clerk
- The webhook already verifies the Clerk signature using Svix

## Challenge

The webhook needs to make authenticated calls to our API, but:
1. Webhook requests come directly from Clerk, not from an authenticated user
2. There's no JWT token available in the webhook payload
3. The API endpoints are protected by JwtAuthGuard

## Solution: Using Clerk Actor Tokens

After reviewing the Clerk Backend API documentation, we can use Clerk's Actor Tokens to authenticate API calls from the webhook handler. This approach leverages Clerk's built-in functionality to generate tokens on behalf of users.

### 1. Set Up Clerk Backend SDK

First, install the Clerk Backend SDK:

```bash
npm install @clerk/backend
```

### 2. Configure the Clerk Client in the Webhook Handler

```typescript
// web/src/app/api/webhook/clerk/route.ts
import { Clerk } from '@clerk/backend';

// Initialize Clerk with your secret key
const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });
```

### 3. Generate Actor Tokens for API Calls

When a webhook event is received, we can use the user ID from the event to generate an actor token:

```typescript
// web/src/app/api/webhook/clerk/route.ts
async function getActorToken(userId: string): Promise<string> {
  try {
    // Generate a short-lived actor token for the user
    const token = await clerk.users.getToken(userId, {
      // Optional: specify the session duration
      sessionDuration: 60, // 1 minute, just enough for our API call
    });
    
    return token;
  } catch (error) {
    console.error('Error generating actor token:', error);
    throw new Error('Failed to generate authentication token');
  }
}
```

### 4. Update the API Call Function to Use Actor Tokens

```typescript
// web/src/app/api/webhook/clerk/route.ts
async function callApiWithAuth(endpoint: string, method: string, userId: string, data?: any) {
  try {
    // Get an actor token for the user
    const token = await getActorToken(userId);
    
    const response = await fetch(`${process.env.API_URL}/${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`API call failed: ${error.message}`);
    }
    
    return response.json().catch(() => ({}));
  } catch (error) {
    console.error(`Error calling API ${endpoint}:`, error);
    throw error;
  }
}
```

### 5. Use the Function in Webhook Handlers

```typescript
// web/src/app/api/webhook/clerk/route.ts
// Inside your webhook handler:
if (eventType === 'user.created') {
  const { id, email_addresses, first_name, last_name } = evt.data;
  
  try {
    await callApiWithAuth('users', 'POST', id, {
      clerkId: id,
      email: email_addresses[0]?.email_address,
      firstName: first_name,
      lastName: last_name,
    });
  } catch (error) {
    console.error('Error syncing user to database:', error);
    // Implement retry logic or error handling
  }
}
```

### 6. Configure Your JWT Strategy to Use Clerk's JWKS Endpoint

Update your JWT strategy to use Clerk's JWKS endpoint for token verification:

```typescript
// api/src/app/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { AppConfigService } from '../../config/config.service';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private configService: AppConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Use jwks-rsa to fetch the public key from Clerk's JWKS endpoint
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: 'https://modest-kite-9.clerk.accounts.dev/.well-known/jwks.json',
      }),
      // Validate the audience and issuer
      issuer: 'https://modest-kite-9.clerk.accounts.dev',
      algorithms: ['RS256'],
    });
  }

  async validate(payload: any) {
    // For Clerk tokens, get the user from your database using the Clerk user ID
    if (payload.sub) {
      const user = await this.usersService.findByClerkId(payload.sub);
      
      if (!user) {
        // Handle case where user exists in Clerk but not in your database
        // You might want to create the user or throw an exception
        throw new Error('User not found in database');
      }
      
      return user;
    }
    
    return null;
  }
}
```

You'll need to install the `jwks-rsa` package:

```bash
npm install jwks-rsa
```

This approach uses the JWKS endpoint provided by Clerk to automatically fetch and cache the public keys needed to verify the JWT tokens. The strategy will validate that:

1. The token is signed with the correct key
2. The token has the correct issuer (`iss` claim)
3. The token is not expired
4. The token uses the RS256 algorithm

## Special Case: User Deletion

For user deletion events, you won't be able to get an actor token for the deleted user. In this case, create a special endpoint with Svix signature verification:

### Create a Webhook Verification Service

```typescript
// api/src/app/webhooks/webhook.service.ts
import { Injectable } from '@nestjs/common';
import { Webhook } from 'svix';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WebhookService {
  private webhook: Webhook;

  constructor(private configService: ConfigService) {
    const webhookSecret = this.configService.get<string>('CLERK_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('CLERK_WEBHOOK_SECRET is not defined');
    }
    this.webhook = new Webhook(webhookSecret);
  }

  verifyWebhook(
    body: string,
    signature: string,
    svixId: string,
    timestamp: string
  ): boolean {
    try {
      this.webhook.verify(body, {
        'svix-id': svixId,
        'svix-timestamp': timestamp,
        'svix-signature': signature,
      });
      return true;
    } catch (error) {
      console.error('Webhook verification failed:', error);
      return false;
    }
  }
}
```

### Create a Special Endpoint for Webhook Deletion

```typescript
// api/src/app/users/users.controller.ts
import { WebhookService } from '../webhooks/webhook.service';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private webhookService: WebhookService
  ) {}

  // Regular endpoints with JwtAuthGuard...

  @Delete('webhook/:id')
  async deleteUserByWebhook(
    @Param('id') id: string,
    @Headers('svix-signature') signature: string,
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') timestamp: string,
    @Body() rawBody: any
  ) {
    // Verify the webhook signature
    const bodyString = JSON.stringify(rawBody);
    const isValid = this.webhookService.verifyWebhook(
      bodyString,
      signature,
      svixId,
      timestamp
    );
    
    if (!isValid) {
      throw new UnauthorizedException('Invalid webhook signature');
    }
    
    // Verify this is a user.deleted event
    if (rawBody.type !== 'user.deleted') {
      throw new BadRequestException('Invalid event type for this endpoint');
    }
    
    // Verify the user ID matches
    if (rawBody.data?.id !== id) {
      throw new BadRequestException('User ID mismatch');
    }
    
    // Proceed with user deletion
    return this.usersService.remove(id);
  }
}
```

### Update the Webhook Handler for User Deletion

```typescript
// web/src/app/api/webhook/clerk/route.ts
if (eventType === 'user.deleted') {
  const { id } = evt.data;
  
  try {
    // For deletion, we use a special endpoint that verifies the Svix signature
    const response = await fetch(`${process.env.API_URL}/users/webhook/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature
      },
      body: body // Pass the original webhook body
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
  } catch (error) {
    console.error('Error deleting user from database:', error);
  }
}
```

This approach ensures that:

1. The webhook request is genuinely from Clerk (via Svix signature verification)
2. The event type matches what we expect for this endpoint
3. The user ID in the URL matches the one in the webhook payload

## Security Considerations

1. **Token Expiration**: Actor tokens should be short-lived, just enough to make the API call.

2. **Clerk Secret Key**: Protect your Clerk Secret Key as it can be used to generate tokens for any user.

3. **Webhook Signature Verification**: Always verify the Svix signature to ensure the webhook is legitimate.

4. **Error Handling**: Implement proper error handling and logging for failed API calls.

5. **Audit Logging**: Log all operations performed through the webhook for security auditing.

## Implementation Steps

1. Install the Clerk Backend SDK and jwks-rsa package
2. Configure the Clerk client in your webhook handler
3. Implement the actor token generation function
4. Update your API call function to use actor tokens
5. Configure your JWT strategy to use Clerk's JWKS endpoint
6. Create the webhook verification service for user deletion events
7. Create a special endpoint for webhook deletion with Svix verification
8. Test the implementation with Clerk webhook events

This approach leverages Clerk's built-in functionality to generate tokens on behalf of users, providing a secure and straightforward way to authenticate API calls from your webhook handler.

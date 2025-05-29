import { WebhookEvent } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';

export async function POST(req: Request) {
  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || '';
  
  if (!webhookSecret) {
    return new Response('Error: Missing webhook secret', {
      status: 500,
    });
  }

  const wh = new Webhook(webhookSecret);

  let evt: WebhookEvent;

  // Get headers
  const headersList = await headers();
  const svix_id = headersList.get('svix-id');
  const svix_timestamp = headersList.get('svix-timestamp');
  const svix_signature = headersList.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing svix headers', {
      status: 400,
    });
  }

  // Verify the webhook payload
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error verifying webhook', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;
  
  // Handle user creation
  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    
    // Here you would typically sync this user to your database
    console.log(`User created: ${id}, ${email_addresses[0]?.email_address}, ${first_name} ${last_name}`);
    
    // You could make an API call to your backend to create the user
   try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/webhook/clerk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: eventType,
        data: evt.data
      }),
    });
    
    return new Response('Webhook received and queued', { status: 200 });
  } catch (error) {
    console.error('Error sending event to queue:', error);
    return new Response('Error processing webhook', { status: 500 });
  }
}
  
  // Handle user Update
  if (eventType === 'user.updated') {
    const { id } = evt.data;
    
    // Here you would typically delete this user from your database
    console.log(`User updated: ${id}`);
    
    // You could make an API call to your backend to delete the user
    try {
      // Example API call (commented out)
      // await fetch(`${process.env.API_URL}/users/${id}`, {
      //   method: 'DELETE',
      // });
    } catch (error) {
      console.error('Error updating user in database:', error);
      // TODO: Implement retry logic or admin notification
    }
    return new Response('Webhook received', { status: 200 });
  }

  
  // Handle user deletion
  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    
    // Here you would typically delete this user from your database
    console.log(`User deleted: ${id}`);
    
    // You could make an API call to your backend to delete the user
    try {
      // Example API call (commented out)
      // await fetch(`${process.env.API_URL}/users/${id}`, {
      //   method: 'DELETE',
      // });
    } catch (error) {
      console.error('Error deleting user from database:', error);
    }    
    return new Response('Webhook received', { status: 200 });
  }
  
  // Default response for unhandled event types
  return new Response('Webhook received', { status: 200 });
}

// Next.js will automatically handle OPTIONS requests for CORS preflight
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function OPTIONS() {
  return new Response('Options received', {
    status: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type, svix-id, svix-timestamp, svix-signature',
    }     
  });
}

// web/src/test-webhook.ts
import fetch from 'node-fetch';
import crypto from 'crypto';

async function testWebhook() {
  console.log('Starting webhook test...');
  
  // Create a sample webhook payload
  const payload = {
    data: {
      id: 'test-clerk-id-' + Date.now(),
      email_addresses: [{ email_address: 'mcTesty144423@example.com' }],
      first_name: 'Test',
      last_name: 'User',
    },
    type: 'user.created',
  };
  
  const body = JSON.stringify(payload);
  
  // Create Svix headers (this is a simplified version)
  // In a real scenario, you'd need to properly sign the payload with your webhook secret
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const svixId = crypto.randomUUID();
  
  // Note: This is a simplified signature and won't pass verification
  // For testing purposes, you might need to modify your webhook handler to skip verification
  const svixSignature = 'test-signature';
  
  try {
    const response = await fetch('http://localhost:3333/api/webhook/clerk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'svix-id': svixId,
        'svix-timestamp': timestamp,
        'svix-signature': svixSignature,
      },
      body,
    });
    
    console.log('Response status:', response.status);
    console.log('Response text:', await response.text());
  } catch (error) {
    console.error('Error testing webhook:', error);
  }
}

testWebhook();

// src/routes/clerkWebhooks.ts
import { Webhook } from 'svix';
import { createClient } from '@supabase/supabase-js';
import { Request, Response } from 'express';

type ClerkWebhookEvent = {
  data: {
    id: string;
    email_addresses: Array<{ email_address: string }>;
    first_name: string | null;
    last_name: string | null;
    image_url: string;
    created_at: number;
  };
  type: 'user.created' | 'user.updated' | 'user.deleted' | 'user.signed_in' | 'user.signed_out';
};

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

// Validate environment variables
if (!supabaseUrl || !supabaseServiceKey || !webhookSecret) {
  throw new Error('Missing required environment variables. Check your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Handle Clerk webhook events
export const handleClerkWebhook = async (req: Request, res: Response) => {
  try {
    // Verify webhook signature
    const svix_id = req.headers['svix-id'] as string;
    const svix_timestamp = req.headers['svix-timestamp'] as string;
    const svix_signature = req.headers['svix-signature'] as string;

    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error('Missing required headers');
      return res.status(400).json({ error: 'Missing required headers' });
    }

    const payload = JSON.stringify(req.body);
    const wh = new Webhook(webhookSecret);

    let event: ClerkWebhookEvent;
    try {
      const verifiedPayload = wh.verify(payload, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as ClerkWebhookEvent;
      event = verifiedPayload;
    } catch (err) {
      console.error('Webhook verification failed:', err);
      return res.status(400).json({ error: 'Invalid signature' });
    }

    console.log('Processing webhook event:', event.type);

    try {
      const { id, email_addresses, first_name, last_name, image_url } = event.data;
      const email = email_addresses?.[0]?.email_address;

      switch (event.type) {
        case 'user.created':
        case 'user.updated':
        case 'user.signed_in':
        case 'user.signed_out':
          console.log(`Processing ${event.type} for user:`, { id, email });

          const { error: upsertError } = await supabase.from('clerk_users').upsert(
            {
              clerk_id: id,
              email: email || null,
              first_name: first_name || null,
              last_name: last_name || null,
              image_url: image_url || null,
              last_event: event.type,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'clerk_id' }, // 👈 clave del cambio
          );

          if (upsertError) {
            console.error('Error upserting user:', upsertError);
            return res.status(500).json({
              error: 'Failed to sync user',
              details: upsertError.message,
            });
          }
          console.log(`Successfully processed ${event.type} for user:`, id);
          break;

        case 'user.deleted':
          console.log('Processing user.deleted for user ID:', id);
          const { error: deleteError } = await supabase
            .from('clerk_users')
            .delete()
            .eq('clerk_id', id);

          if (deleteError) {
            console.error('Error deleting user:', deleteError);
            return res.status(500).json({
              error: 'Failed to delete user',
              details: deleteError.message,
            });
          }
          console.log('Successfully deleted user:', id);
          break;

        default:
          console.log('Unhandled event type:', event.type);
          return res.status(200).json({ received: true, message: 'Event type not handled' });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error processing webhook event:', error);
      return res.status(500).json({
        error: 'Error processing webhook',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  } catch (error) {
    console.error('Unexpected error in webhook handler:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Export a function to register the webhook route
export const registerWebhookRoute = (app: any) => {
  app.post('/api/clerk/webhooks', handleClerkWebhook);
};

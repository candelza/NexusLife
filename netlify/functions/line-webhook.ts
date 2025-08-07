import { supabase } from '../../src/integrations/supabase/client';

// Line webhook event types
interface LineWebhookEvent {
  type: string;
  message?: {
    id: string;
    type: string;
    text?: string;
    userId: string;
  };
  replyToken?: string;
  source: {
    type: string;
    userId?: string;
    groupId?: string;
  };
  timestamp: number;
}

interface LineWebhookRequest {
  events: LineWebhookEvent[];
  destination: string;
}

// Verify Line webhook signature
const verifyLineSignature = (body: string, signature: string, channelSecret: string): boolean => {
  const crypto = require('crypto');
  const hash = crypto.createHmac('SHA256', channelSecret).update(body).digest('base64');
  return hash === signature;
};

// Process Line webhook events
const processLineWebhook = async (events: LineWebhookEvent[]) => {
  for (const event of events) {
    console.log('Processing Line event:', event.type);
    
    switch (event.type) {
      case 'message':
        await handleLineMessage(event);
        break;
      case 'follow':
        await handleLineFollow(event);
        break;
      case 'unfollow':
        await handleLineUnfollow(event);
        break;
      case 'join':
        await handleLineJoin(event);
        break;
      case 'leave':
        await handleLineLeave(event);
        break;
      default:
        console.log('Unhandled Line event type:', event.type);
    }
  }
};

// Handle Line message events
const handleLineMessage = async (event: LineWebhookEvent) => {
  if (!event.message || event.message.type !== 'text') {
    return;
  }

  const userId = event.source.userId || event.source.groupId;
  const messageText = event.message.text;

  console.log('Received Line message:', { userId, messageText });

  // Store message in database
  try {
    const { error } = await supabase
      .from('line_messages')
      .insert({
        line_user_id: userId,
        message_type: event.message.type,
        message_text: messageText,
        timestamp: new Date(event.timestamp).toISOString(),
        source_type: event.source.type,
      });

    if (error) {
      console.error('Error storing Line message:', error);
    }
  } catch (error) {
    console.error('Error processing Line message:', error);
  }
};

// Handle Line follow events
const handleLineFollow = async (event: LineWebhookEvent) => {
  const userId = event.source.userId;
  console.log('Line user followed:', userId);

  try {
    const { error } = await supabase
      .from('line_users')
      .upsert({
        line_user_id: userId,
        status: 'active',
        followed_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error storing Line user:', error);
    }
  } catch (error) {
    console.error('Error processing Line follow:', error);
  }
};

// Handle Line unfollow events
const handleLineUnfollow = async (event: LineWebhookEvent) => {
  const userId = event.source.userId;
  console.log('Line user unfollowed:', userId);

  try {
    const { error } = await supabase
      .from('line_users')
      .update({
        status: 'inactive',
        unfollowed_at: new Date().toISOString(),
      })
      .eq('line_user_id', userId);

    if (error) {
      console.error('Error updating Line user:', error);
    }
  } catch (error) {
    console.error('Error processing Line unfollow:', error);
  }
};

// Handle Line join events (for groups)
const handleLineJoin = async (event: LineWebhookEvent) => {
  const groupId = event.source.groupId;
  console.log('Line bot joined group:', groupId);

  try {
    const { error } = await supabase
      .from('line_groups')
      .upsert({
        line_group_id: groupId,
        status: 'active',
        joined_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error storing Line group:', error);
    }
  } catch (error) {
    console.error('Error processing Line join:', error);
  }
};

// Handle Line leave events (for groups)
const handleLineLeave = async (event: LineWebhookEvent) => {
  const groupId = event.source.groupId;
  console.log('Line bot left group:', groupId);

  try {
    const { error } = await supabase
      .from('line_groups')
      .update({
        status: 'inactive',
        left_at: new Date().toISOString(),
      })
      .eq('line_group_id', groupId);

    if (error) {
      console.error('Error updating Line group:', error);
    }
  } catch (error) {
    console.error('Error processing Line leave:', error);
  }
};

const LINE_CHANNEL_SECRET = process.env.VITE_LINE_CHANNEL_SECRET || '';

export const handler = async (event: any, context: any) => {
  try {
    // Get the request body
    const body = event.body;
    const signature = event.headers['x-line-signature'] || '';

    // Verify the signature
    if (!verifyLineSignature(body, signature, LINE_CHANNEL_SECRET)) {
      console.error('Invalid Line webhook signature');
      return {
        statusCode: 401,
        body: 'Unauthorized'
      };
    }

    // Parse the webhook data
    const webhookData: LineWebhookRequest = JSON.parse(body);
    console.log('Received Line webhook:', webhookData);

    // Process the events
    await processLineWebhook(webhookData.events);

    return {
      statusCode: 200,
      body: 'OK'
    };
  } catch (error) {
    console.error('Error processing Line webhook:', error);
    return {
      statusCode: 500,
      body: 'Internal Server Error'
    };
  }
};

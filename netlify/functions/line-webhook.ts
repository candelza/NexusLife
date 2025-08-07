import { processLineWebhook, verifyLineSignature, type LineWebhookRequest } from '../../../src/integrations/line/webhook-receiver';

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

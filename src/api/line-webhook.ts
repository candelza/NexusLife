import { processLineWebhook, verifyLineSignature, type LineWebhookRequest } from '@/integrations/line/webhook-receiver';

const LINE_CHANNEL_SECRET = process.env.VITE_LINE_CHANNEL_SECRET || '';

export const handleLineWebhook = async (request: Request): Promise<Response> => {
  try {
    // Get the request body
    const body = await request.text();
    const signature = request.headers.get('x-line-signature') || '';

    // Verify the signature
    if (!verifyLineSignature(body, signature, LINE_CHANNEL_SECRET)) {
      console.error('Invalid Line webhook signature');
      return new Response('Unauthorized', { status: 401 });
    }

    // Parse the webhook data
    const webhookData: LineWebhookRequest = JSON.parse(body);
    console.log('Received Line webhook:', webhookData);

    // Process the events
    await processLineWebhook(webhookData.events);

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Error processing Line webhook:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};

// Netlify function handler
export const handler = async (event: any, context: any) => {
  const request = new Request(event.url, {
    method: event.httpMethod,
    headers: event.headers,
    body: event.body,
  });

  return handleLineWebhook(request);
};

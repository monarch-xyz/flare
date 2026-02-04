import axios from 'axios';
import { createHmac } from 'crypto';
import { config } from '../config/index.js';
import { WebhookPayload } from '../types/index.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('worker:notifier');

export interface NotificationResult {
  success: boolean;
  status?: number;
  error?: string;
  durationMs: number;
}

export async function dispatchNotification(
  url: string,
  payload: WebhookPayload,
  timeoutMs = 10000
): Promise<NotificationResult> {
  const start = Date.now();
  const payloadJson = JSON.stringify(payload);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'Flare-Notification-Service/1.0',
  };

  const secret = config.webhook.secret;
  if (secret) {
    const digest = createHmac('sha256', secret).update(payloadJson).digest('hex');
    headers['X-Flare-Signature'] = `sha256=${digest}`;
  }
  
  try {
    const response = await axios.post(url, payloadJson, {
      timeout: timeoutMs,
      headers,
    });

    return {
      success: true,
      status: response.status,
      durationMs: Date.now() - start,
    };
  } catch (error: any) {
    logger.error({ url, error: error.message }, 'Webhook delivery failed');
    
    return {
      success: false,
      status: error.response?.status,
      error: error.message,
      durationMs: Date.now() - start,
    };
  }
}

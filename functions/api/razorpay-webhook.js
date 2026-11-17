// Cloudflare Pages Function: POST /api/razorpay-webhook
// Set this URL as the webhook in Razorpay Dashboard → Settings → Webhooks.
import { handleWebhook } from '../../billx/server/handlers.js';

export const onRequestPost = ({ request, env }) => handleWebhook(request, env);

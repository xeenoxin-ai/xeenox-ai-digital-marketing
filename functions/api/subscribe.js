// Cloudflare Pages Function: POST /api/subscribe (BillX payments).
import { handleSubscribe } from '../../billx/server/handlers.js';

export const onRequestPost = ({ request, env }) => handleSubscribe(request, env);

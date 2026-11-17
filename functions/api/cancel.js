// Cloudflare Pages Function: POST /api/cancel (BillX payments).
import { handleCancel } from '../../billx/server/handlers.js';

export const onRequestPost = ({ request, env }) => handleCancel(request, env);

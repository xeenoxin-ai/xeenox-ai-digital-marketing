// Cloudflare Pages Function: POST /api/verify (BillX payments).
import { handleVerify } from '../../billx/server/handlers.js';

export const onRequestPost = ({ request, env }) => handleVerify(request, env);

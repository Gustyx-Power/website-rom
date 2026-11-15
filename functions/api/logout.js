import { json } from "../../shared/response.js";
import { clearCookie } from "../../shared/auth.js";

// POST /api/logout
export async function onRequestPost() {
  return json({ ok: true }, 200, { "Set-Cookie": clearCookie() });
}

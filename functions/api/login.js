import { json, err } from "../../shared/response.js";
import { createSessionToken, sessionCookie } from "../../shared/auth.js";

// POST /api/login  { password }
export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_TOKEN) {
    return err(
      "ADMIN_TOKEN is not configured. Set it as a Pages secret first.",
      500
    );
  }
  const body = await request.json().catch(() => null);
  const password = body?.password;
  if (!password || password !== env.ADMIN_TOKEN) {
    return err("Wrong password", 401);
  }
  const token = await createSessionToken(env.ADMIN_TOKEN);
  return json({ ok: true }, 200, { "Set-Cookie": sessionCookie(token) });
}

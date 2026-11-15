import { json } from "../../shared/response.js";
import { isAuthenticated } from "../../shared/auth.js";

// GET /api/me — dipakai frontend untuk cek status login admin.
export async function onRequestGet({ request, env }) {
  if (await isAuthenticated(request, env)) {
    return json({ authenticated: true });
  }
  return json({ authenticated: false }, 401);
}

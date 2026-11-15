// Auth sederhana berbasis password tunggal (env.ADMIN_TOKEN).
// Login -> cookie httpOnly berisi token HMAC-SHA256 (payload.exp ditandatangani).
// Rotasi ADMIN_TOKEN otomatis membuat semua session lama invalid.
import { err } from "./response.js";

const COOKIE_NAME = "xms_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 hari

const enc = new TextEncoder();

function b64urlEncode(bytes) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(str) {
  let s = str.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function hmac(secret, msgBytes) {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, msgBytes));
}

export async function createSessionToken(secret) {
  const payload = b64urlEncode(
    enc.encode(JSON.stringify({ exp: Date.now() + MAX_AGE * 1000 }))
  );
  const sig = b64urlEncode(await hmac(secret, enc.encode(payload)));
  return `${payload}.${sig}`;
}

export async function verifySessionToken(token, secret) {
  if (typeof token !== "string" || !token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = b64urlEncode(await hmac(secret, enc.encode(payload)));
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  if (diff !== 0) return false;
  try {
    const data = JSON.parse(new TextDecoder().decode(b64urlDecode(payload)));
    return typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

function getCookie(request, name) {
  const header = request.headers.get("Cookie") || "";
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return v.join("=");
  }
  return null;
}

export async function isAuthenticated(request, env) {
  if (!env || !env.ADMIN_TOKEN) return false;
  return verifySessionToken(getCookie(request, COOKIE_NAME), env.ADMIN_TOKEN);
}

// Dipakai di handler admin: const unauth = await requireAuth(request, env); if (unauth) return unauth;
export async function requireAuth(request, env) {
  if (await isAuthenticated(request, env)) return null;
  return err("Unauthorized", 401);
}

export function sessionCookie(token) {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`;
}

export function clearCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

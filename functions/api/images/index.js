import { json, err } from "../../../shared/response.js";
import { requireAuth } from "../../../shared/auth.js";

const MAX_BYTES = 20 * 1024 * 1024; // 20 MB / gambar
const ALLOWED = /^image\/(png|jpeg|jpg|webp|gif|avif|bmp)$/i;

// POST /api/images (multipart: file, romId) — admin: upload gambar ke R2, metadata ke D1.
export async function onRequestPost({ request, env }) {
  const unauth = await requireAuth(request, env);
  if (unauth) return unauth;

  let form;
  try {
    form = await request.formData();
  } catch {
    return err("Expected multipart form data");
  }

  const romId = Number(form.get("romId"));
  const file = form.get("file");
  if (!Number.isInteger(romId) || romId <= 0) return err("romId is required");
  if (!file || typeof file === "string") return err("file is required");

  const rom = await env.DB
    .prepare("SELECT id FROM roms WHERE id = ?")
    .bind(romId)
    .first();
  if (!rom) return err("ROM not found", 404);

  const type = (file.type || "").toLowerCase();
  if (!ALLOWED.test(type)) return err(`Unsupported image type: ${type}`, 415);

  const bytes = await file.arrayBuffer();
  if (bytes.byteLength > MAX_BYTES) return err("Max image size is 20MB", 413);

  const ext = type.split("/")[1].replace("jpeg", "jpg");
  const key = `roms/${romId}/${Date.now()}-${crypto
    .randomUUID()
    .slice(0, 8)}.${ext}`;

  await env.IMAGES.put(key, bytes, { httpMetadata: { contentType: type } });
  await env.DB.prepare(
    "INSERT INTO rom_images (rom_id, object_key, content_type) VALUES (?, ?, ?)"
  )
    .bind(romId, key, type)
    .run();

  const row = await env.DB
    .prepare("SELECT id, object_key FROM rom_images WHERE object_key = ?")
    .bind(key)
    .first();

  return json(
    { image: { id: row.id, object_key: row.object_key, url: `/images/${row.object_key}` } },
    201
  );
}

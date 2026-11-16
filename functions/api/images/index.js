import { json, err } from "../../../shared/response.js";
import { requireAuth } from "../../../shared/auth.js";
import { ensureColumns } from "../../../shared/db.js";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB / gambar
const ALLOWED = /^image\/(png|jpeg|jpg|webp|gif|avif)$/i;

// POST /api/images (multipart: file, romId, isBanner) — admin: upload ke R2, metadata ke D1.
export async function onRequestPost({ request, env }) {
  const unauth = await requireAuth(request, env);
  if (unauth) return unauth;
  await ensureColumns(env.DB);

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

  const isBanner = form.get("isBanner") === "1" || form.get("isBanner") === "true";

  const rom = await env.DB
    .prepare("SELECT id FROM roms WHERE id = ?")
    .bind(romId)
    .first();
  if (!rom) return err("ROM not found", 404);

  const type = (file.type || "").toLowerCase();
  if (!ALLOWED.test(type)) return err(`Unsupported image type: ${type}`, 415);

  const bytes = await file.arrayBuffer();
  if (bytes.byteLength > MAX_BYTES) return err("Max image size is 5MB", 413);

  const ext = (type.split("/")[1] || "png").replace("jpeg", "jpg");
  const prefix = isBanner ? "banners" : "screenshots";
  const key = `${prefix}/${romId}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  // Jika banner, bersihkan banner lama untuk ROM ini
  if (isBanner) {
    const oldBanners = (
      await env.DB
        .prepare("SELECT id, object_key FROM rom_images WHERE rom_id = ? AND is_banner = 1")
        .bind(romId)
        .all()
    ).results || [];

    for (const old of oldBanners) {
      try {
        await env.IMAGES.delete(old.object_key);
      } catch {}
    }
    await env.DB
      .prepare("DELETE FROM rom_images WHERE rom_id = ? AND is_banner = 1")
      .bind(romId)
      .run();
  }

  await env.IMAGES.put(key, bytes, { httpMetadata: { contentType: type } });

  await env.DB.prepare(
    `INSERT INTO rom_images (rom_id, object_key, content_type, is_banner)
     VALUES (?, ?, ?, ?)`
  )
    .bind(romId, key, type, isBanner ? 1 : 0)
    .run();

  if (isBanner) {
    await env.DB
      .prepare("UPDATE roms SET banner_object_key = ? WHERE id = ?")
      .bind(key, romId)
      .run();
  }

  const row = await env.DB
    .prepare("SELECT id, object_key, is_banner FROM rom_images WHERE object_key = ?")
    .bind(key)
    .first();

  return json(
    {
      image: {
        id: row.id,
        object_key: row.object_key,
        url: `/images/${row.object_key}`,
        is_banner: Boolean(row.is_banner),
      },
    },
    201
  );
}

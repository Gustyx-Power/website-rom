import { json, err } from "../../../shared/response.js";
import { requireAuth } from "../../../shared/auth.js";

// GET /api/screenshots/:slug — publik: kembalikan semua screenshot sebuah ROM.
export async function onRequestGet({ env, params }) {
  const rom = await env.DB
    .prepare("SELECT id FROM roms WHERE slug = ?")
    .bind(params.slug)
    .first();
  if (!rom) return err("ROM not found", 404);

  const images = (
    await env.DB
      .prepare(
        `SELECT id, object_key, content_type FROM rom_images
         WHERE rom_id = ? AND is_banner = 0 ORDER BY id`
      )
      .bind(rom.id)
      .all()
  ).results;

  return json({
    total: Array.isArray(images) ? images.length : 0,
    screenshots: (Array.isArray(images) ? images : []).map((img) => ({
      id: img.id,
      url: `/images/${img.object_key}`,
      type: img.content_type,
    })),
  });
}

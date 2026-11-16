import { json, err } from "../../../shared/response.js";
import { requireAuth } from "../../../shared/auth.js";

// DELETE /api/images/:id — admin: hapus gambar dari R2 + metadata D1.
export async function onRequestDelete({ request, env, params }) {
  const unauth = await requireAuth(request, env);
  if (unauth) return unauth;

  const id = Number(params.id);
  if (!Number.isInteger(id)) return err("Invalid image id");

  const row = await env.DB
    .prepare("SELECT id, rom_id, object_key, is_banner FROM rom_images WHERE id = ?")
    .bind(id)
    .first();
  if (!row) return err("Image not found", 404);

  try {
    await env.IMAGES.delete(row.object_key);
  } catch {
    // file sudah tidak ada — tetap hapus metadata.
  }
  await env.DB.prepare("DELETE FROM rom_images WHERE id = ?").bind(id).run();

  if (row.is_banner) {
    await env.DB
      .prepare("UPDATE roms SET banner_object_key = '' WHERE id = ? AND banner_object_key = ?")
      .bind(row.rom_id, row.object_key)
      .run();
  }

  return json({ ok: true });
}

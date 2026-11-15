import { json, err } from "../../../shared/response.js";
import { requireAuth } from "../../../shared/auth.js";
import {
  getRomBySlug,
  insertFeatures,
  nowStamp,
  FEATURE_STATUSES,
  ensureColumns,
} from "../../../shared/db.js";

// GET /api/roms/:slug — publik: detail ROM + fitur + gambar.
export async function onRequestGet({ env, params }) {
  const rom = await getRomBySlug(env.DB, params.slug);
  if (!rom) return err("ROM not found", 404);
  return json({ rom });
}

// POST /api/roms/:slug / publik: catat klik download (1x per browser/cookie cache).
export async function onRequestPost({ request, env, params }) {
  await ensureColumns(env.DB);
  const rom = await env.DB
    .prepare("SELECT id, downloads FROM roms WHERE slug = ?")
    .bind(params.slug)
    .first();
  if (!rom) return err("ROM not found", 404);

  const cookieHeader = request.headers.get("Cookie") || "";
  const cookieName = `xms_dl_${params.slug}`;
  const hasCookie = cookieHeader.includes(`${cookieName}=1`);

  let currentDownloads = Number(rom.downloads) || 0;

  if (!hasCookie) {
    currentDownloads += 1;
    await env.DB
      .prepare("UPDATE roms SET downloads = ? WHERE id = ?")
      .bind(currentDownloads, rom.id)
      .run();
  }

  const res = json({ ok: true, downloads: currentDownloads, cached: hasCookie });
  if (!hasCookie) {
    res.headers.set(
      "Set-Cookie",
      `${cookieName}=1; Max-Age=2592000; Path=/; SameSite=Lax`
    );
  }
  return res;
}

// PUT /api/roms/:slug — admin: update data ROM (fitur di-replace).
export async function onRequestPut({ request, env, params }) {
  const unauth = await requireAuth(request, env);
  if (unauth) return unauth;
  await ensureColumns(env.DB);

  const rom = await env.DB
    .prepare("SELECT id FROM roms WHERE slug = ?")
    .bind(params.slug)
    .first();
  if (!rom) return err("ROM not found", 404);

  const body = await request.json().catch(() => null);
  const title = String(body?.title || "").trim();
  if (!title) return err("Title is required");

  const features = Array.isArray(body?.features)
    ? body.features
        .filter((f) => String(f?.name || "").trim())
        .map((f) => ({
          name: String(f.name).trim(),
          status: FEATURE_STATUSES.includes(f.status) ? f.status : "works",
          notes: String(f.notes || "").trim(),
        }))
    : [];

  await env.DB.prepare(
    `UPDATE roms SET
      title = ?, version = ?, android_version = ?, kernel = ?, source = ?,
      maintainer = ?, credits = ?, description = ?, changelog = ?, flash_guide = ?, download_url = ?, updated_at = ?
     WHERE id = ?`
  )
    .bind(
      title.slice(0, 120),
      String(body?.version || "").trim().slice(0, 40),
      String(body?.android_version || "").trim().slice(0, 20),
      String(body?.kernel || "").trim().slice(0, 120),
      String(body?.source || "").trim().slice(0, 120),
      String(body?.maintainer || "").trim().slice(0, 120),
      String(body?.credits || "").slice(0, 8000),
      String(body?.description || "").slice(0, 8000),
      String(body?.changelog || "").slice(0, 8000),
      String(body?.flash_guide || "").slice(0, 8000),
      String(body?.download_url || "").trim().slice(0, 600),
      nowStamp(),
      rom.id
    )
    .run();

  await env.DB.prepare("DELETE FROM rom_features WHERE rom_id = ?")
    .bind(rom.id)
    .run();
  if (features.length) await insertFeatures(env.DB, rom.id, features);

  return json({ ok: true });
}

// DELETE /api/roms/:slug — admin: hapus ROM + fitur + gambar (file R2 ikut dibersihkan).
export async function onRequestDelete({ request, env, params }) {
  const unauth = await requireAuth(request, env);
  if (unauth) return unauth;

  const rom = await env.DB
    .prepare("SELECT id FROM roms WHERE slug = ?")
    .bind(params.slug)
    .first();
  if (!rom) return err("ROM not found", 404);

  const images = (
    await env.DB
      .prepare("SELECT object_key FROM rom_images WHERE rom_id = ?")
      .bind(rom.id)
      .all()
  ).results;

  await env.DB.prepare("DELETE FROM rom_features WHERE rom_id = ?")
    .bind(rom.id)
    .run();
  await env.DB.prepare("DELETE FROM rom_images WHERE rom_id = ?")
    .bind(rom.id)
    .run();
  await env.DB.prepare("DELETE FROM roms WHERE id = ?").bind(rom.id).run();

  // Best effort bersih-bersih file di R2.
  for (const img of images) {
    try {
      await env.IMAGES.delete(img.object_key);
    } catch {
      // abaikan — metadata sudah hilang, file orphan tidak mengganggu.
    }
  }

  return json({ ok: true });
}

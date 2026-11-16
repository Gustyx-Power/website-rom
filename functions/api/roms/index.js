import { json, err } from "../../../shared/response.js";
import { requireAuth } from "../../../shared/auth.js";
import {
  slugify,
  uniqueSlug,
  insertFeatures,
  nowStamp,
  FEATURE_STATUSES,
  ensureColumns,
  getAllRoms,
} from "../../../shared/db.js";

// GET /api/roms — publik: daftar semua ROM (terbaru dulu).
export async function onRequestGet({ env }) {
  await ensureColumns(env.DB);
  const roms = await getAllRoms(env.DB);
  return json({ roms });
}

// POST /api/roms — admin: buat ROM baru + fitur.
export async function onRequestPost({ request, env }) {
  const unauth = await requireAuth(request, env);
  if (unauth) return unauth;
  await ensureColumns(env.DB);

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

  const baseSlug = slugify(String(body?.slug || "").trim() || title);
  const slug = await uniqueSlug(env.DB, baseSlug);
  const now = nowStamp();

  await env.DB.prepare(
    `INSERT INTO roms
      (slug, title, version, android_version, kernel, source, maintainer, credits, description, changelog, flash_guide, download_url, donation_url, support_url, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      slug,
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
      String(body?.donation_url || "").trim().slice(0, 600),
      String(body?.support_url || "").trim().slice(0, 600),
      now,
      now
    )
    .run();

  const row = await env.DB.prepare("SELECT id, slug FROM roms WHERE slug = ?")
    .bind(slug)
    .first();
  if (features.length) await insertFeatures(env.DB, row.id, features);

  return json({ rom: row }, 201);
}

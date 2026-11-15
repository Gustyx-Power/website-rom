// Helper database D1.

export const FEATURE_STATUSES = ["works", "partial", "broken"];

export function slugify(text) {
  const s = String(text)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return s || "rom";
}

export async function uniqueSlug(db, base) {
  let slug = base;
  let n = 2;
  for (;;) {
    const row = await db
      .prepare("SELECT id FROM roms WHERE slug = ?")
      .bind(slug)
      .first();
    if (!row) return slug;
    slug = `${base}-${n++}`;
  }
}

export async function insertFeatures(db, romId, features) {
  for (let i = 0; i < features.length; i++) {
    const f = features[i];
    await db
      .prepare(
        "INSERT INTO rom_features (rom_id, name, status, notes, sort) VALUES (?, ?, ?, ?, ?)"
      )
      .bind(
        romId,
        String(f.name).slice(0, 80),
        FEATURE_STATUSES.includes(f.status) ? f.status : "works",
        String(f.notes || "").slice(0, 500),
        i
      )
      .run();
  }
}

export async function ensureColumns(db) {
  try {
    await db.prepare("ALTER TABLE roms ADD COLUMN maintainer TEXT NOT NULL DEFAULT ''").run();
  } catch {}
  try {
    await db.prepare("ALTER TABLE roms ADD COLUMN credits TEXT NOT NULL DEFAULT ''").run();
  } catch {}
}

export async function getRomBySlug(db, slug) {
  await ensureColumns(db);
  const rom = await db
    .prepare("SELECT * FROM roms WHERE slug = ?")
    .bind(slug)
    .first();
  if (!rom) return null;
  const features = (
    await db
      .prepare(
        "SELECT id, name, status, notes FROM rom_features WHERE rom_id = ? ORDER BY sort, id"
      )
      .bind(rom.id)
      .all()
  ).results;
  const images = (
    await db
      .prepare(
        "SELECT id, object_key, content_type FROM rom_images WHERE rom_id = ? ORDER BY id"
      )
      .bind(rom.id)
      .all()
  ).results;
  return { ...rom, features, images };
}

export function nowStamp() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

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

/** Column definitions that may or may not already exist. */
const ALTER_ROMS = [
  ["maintainer",   "TEXT NOT NULL DEFAULT ''"],
  ["credits",      "TEXT NOT NULL DEFAULT ''"],
  ["downloads",    "INTEGER NOT NULL DEFAULT 0"],
  ["donation_url", "TEXT NOT NULL DEFAULT ''"],
  ["support_url",  "TEXT NOT NULL DEFAULT ''"],
  ["banner_object_key", "TEXT NOT NULL DEFAULT ''"],
];

const ALTER_IMAGES = [
  ["is_banner", "INTEGER NOT NULL DEFAULT 0"],
];

/**
 * Ensure all expected columns exist. Uses PRAGMA table_info so retries are safe.
 */
export async function ensureColumns(db) {
  // Build a Set of existing columns once per call
  async function existingCols(table) {
    const rows = (await db.prepare(`PRAGMA table_info(${table})`).all()).results;
    return new Set(rows.map((r) => r.name));
  }

  const romCols   = await existingCols("roms");
  const imgCols   = await existingCols("rom_images");

  for (const [name, def] of ALTER_ROMS) {
    if (!romCols.has(name)) {
      try {
        await db.prepare(`ALTER TABLE roms ADD COLUMN ${name} ${def}`).run();
      } catch {}
    }
  }
  for (const [name, def] of ALTER_IMAGES) {
    if (!imgCols.has(name)) {
      try {
        await db.prepare(`ALTER TABLE rom_images ADD COLUMN ${name} ${def}`).run();
      } catch {}
    }
  }
}

async function attachImagesToRom(db, rom) {
  const [bannerResult, screenshotsResult] = await Promise.all([
    db
      .prepare(
        "SELECT id, object_key, content_type FROM rom_images WHERE rom_id = ? AND is_banner = 1 LIMIT 1"
      )
      .bind(rom.id)
      .first(),
    db
      .prepare(
        "SELECT id, object_key, content_type FROM rom_images WHERE rom_id = ? AND is_banner = 0 ORDER BY id"
      )
      .bind(rom.id)
      .all(),
  ]);

  const screens = (screenshotsResult.results || []).map((img) => ({
    ...img,
    url: `/images/${img.object_key}`,
  }));

  const bannerRow = bannerResult || null;
  return {
    ...rom,
    banner: bannerRow
      ? { ...bannerRow, url: `/images/${bannerRow.object_key}` }
      : null,
    screenshots: screens,
  };
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
  const enriched = await attachImagesToRom(db, rom);
  return { ...enriched, features };
}

export async function getAllRoms(db) {
  await ensureColumns(db);
  const rows = (
    await db.prepare("SELECT * FROM roms ORDER BY datetime(created_at) DESC, id DESC").all()
  ).results;
  const list = [];
  for (const row of rows) {
    list.push(await attachImagesToRom(db, row));
  }
  return list;
}

export function nowStamp() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

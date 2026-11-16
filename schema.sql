-- XMS Port — Cloudflare D1 schema
-- Jalankan: npm run db:init        (local)
--           wrangler d1 execute xms-port-db --remote --file=schema.sql  (production)

CREATE TABLE IF NOT EXISTS roms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '',
  android_version TEXT NOT NULL DEFAULT '',
  kernel TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT '',
  maintainer TEXT NOT NULL DEFAULT '',
  credits TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  changelog TEXT NOT NULL DEFAULT '',
  flash_guide TEXT NOT NULL DEFAULT '',
  download_url TEXT NOT NULL DEFAULT '',
  donation_url TEXT NOT NULL DEFAULT '',
  support_url TEXT NOT NULL DEFAULT '',
  banner_object_key TEXT NOT NULL DEFAULT '',
  downloads INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Status dokumentasi per fitur: works | partial | broken
CREATE TABLE IF NOT EXISTS rom_features (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rom_id INTEGER NOT NULL REFERENCES roms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('works','partial','broken')),
  notes TEXT NOT NULL DEFAULT '',
  sort INTEGER NOT NULL DEFAULT 0
);

-- Metadata gambar. File fisiknya ada di R2 (binding IMAGES), key disimpan di sini.
CREATE TABLE IF NOT EXISTS rom_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rom_id INTEGER NOT NULL REFERENCES roms(id) ON DELETE CASCADE,
  object_key TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL DEFAULT 'image/png',
  is_banner INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_rom_features_rom ON rom_features (rom_id);
CREATE INDEX IF NOT EXISTS idx_rom_images_rom ON rom_images (rom_id);
CREATE INDEX IF NOT EXISTS idx_rom_images_is_banner ON rom_images (rom_id, is_banner);

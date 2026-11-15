-- XMS Port — sample data (opsional, untuk testing)
-- Jalankan setelah schema.sql: npm run db:seed

INSERT OR IGNORE INTO roms
  (slug, title, version, android_version, kernel, source, description, changelog, flash_guide, download_url)
VALUES
  (
    'xtra-ultra-port-v3-2',
    'XTRA ULTRA PORT',
    'v3.2',
    '16',
    'Stock marble 6.1',
    'Xtra Ultra (Redmi Note 12 Pro 5G)',
    'Rebased port dari Xtra Ultra untuk POCO F5 (marble). Fokus daily driver: baterai stabil, suara speaker dirapikan, gesture nav mulus.',
    'Rebase ke Android 16
Fixed NFC toggle crash
Improved speaker gain profile
Known issue: widevine L3 di beberapa DRM app',
    'Bootloader harus sudah unlock
Flash recovery port via fastboot: fastboot flash recovery recovery.img
Reboot ke recovery, pilih "Apply update from ADB"
adb sideload rom.zip
Wipe data/factory reset (WAJIB, rom baru tidak bisa install di atas data MIUI)
Reboot system, tunggu first boot 5-10 menit',
    'https://example.com/downloads/xtra-ultra-v3-2.zip'
  ),
  (
    'hyperos-port-v1-0',
    'HYPEROS PORT',
    'v1.0',
    '15',
    'Stock marble 6.1',
    'HyperOS (POCO F5 Pro - mondrian)',
    'Port HyperOS mondrian ke marble. Build perdana, masih banyak bug yang dilacak — cek status dokumentasi sebelum flash.',
    'Initial build HyperOS mondrian
Face unlock tidak tersedia
Audio pembatas volume akan diperbaiki di v1.1',
    'Wajib bootloader unlock
Backup semua data
Boot ke fastboot mode
fastboot flash boot boot.img
Reboot recovery lalu adb sideload rom.zip
Format data, reboot',
    ''
  );

-- Fitur untuk XTRA ULTRA PORT
INSERT OR IGNORE INTO rom_features (rom_id, name, status, notes, sort)
  SELECT id, 'WiFi', 'works', 'Stabil, 5GHz oke', 0 FROM roms WHERE slug='xtra-ultra-port-v3-2';
INSERT OR IGNORE INTO rom_features (rom_id, name, status, notes, sort)
  SELECT id, 'Bluetooth', 'works', 'Termasuk codec aptX', 1 FROM roms WHERE slug='xtra-ultra-port-v3-2';
INSERT OR IGNORE INTO rom_features (rom_id, name, status, notes, sort)
  SELECT id, 'NFC', 'partial', 'Toggle kadang crash, Google Pay belum jalan', 2 FROM roms WHERE slug='xtra-ultra-port-v3-2';
INSERT OR IGNORE INTO rom_features (rom_id, name, status, notes, sort)
  SELECT id, 'Face Unlock', 'broken', 'Tidak tersedia di build ini', 3 FROM roms WHERE slug='xtra-ultra-port-v3-2';

-- Fitur untuk HYPEROS PORT
INSERT OR IGNORE INTO rom_features (rom_id, name, status, notes, sort)
  SELECT id, 'WiFi', 'works', 'RDP safe', 0 FROM roms WHERE slug='hyperos-port-v1-0';
INSERT OR IGNORE INTO rom_features (rom_id, name, status, notes, sort)
  SELECT id, 'Kamera', 'partial', 'Main sensor oke, ultrawide agak lembut', 1 FROM roms WHERE slug='hyperos-port-v1-0';
INSERT OR IGNORE INTO rom_features (rom_id, name, status, notes, sort)
  SELECT id, 'Volume Audio', 'partial', 'Pembatas volume belum pas', 2 FROM roms WHERE slug='hyperos-port-v1-0';
INSERT OR IGNORE INTO rom_features (rom_id, name, status, notes, sort)
  SELECT id, 'Face Unlock', 'broken', 'Belum diporting', 3 FROM roms WHERE slug='hyperos-port-v1-0';

# XMS Port — Xtra Manager Software Port

Blog / distribusi custom ROM untuk **POCO F5 (marble)**. Neo-brutalism × Swiss, hitam-putih.

**Stack:** React (Vite) · Cloudflare Worker + Static Assets · D1 (data) · R2 (gambar)

## Struktur

```
├─ src/worker.js         # Worker entry — router API (panggil handler functions/) 
├─ functions/            # Handler API (dipanggil dari src/worker.js)
│  ├─ api/
│  │  ├─ login.js / logout.js / me.js        # auth password tunggal (cookie httpOnly)
│  │  ├─ roms/index.js                        # GET daftar (publik), POST buat (admin)
│  │  ├─ roms/[slug].js                       # GET detail (publik), PUT/DELETE (admin)
│  │  └─ images/index.js, images/[id].js      # upload / hapus gambar (admin) → R2 + D1
│  └─ images/[[path]].js                      # GET /images/* — serve file dari R2 (publik)
├─ shared/                # Helper backend (response, auth HMAC cookie, db helper)
├─ schema.sql             # Skema D1 (roms, rom_features, rom_images)
├─ seed.sql               # Data contoh
└─ src/                   # Frontend React (pages/, components/, styles/, utils/)
```

## Setup lokal

```bash
npm install
copy .dev.vars.example .dev.vars      # lalu isi ADMIN_TOKEN
npm run db:init                       # init D1 lokal dari schema.sql
npm run db:seed                       # (opsional) data contoh
npm run dev:api                       # worker + assets di http://localhost:8788
npm run dev                           # (opsional) vite HMR di :5173, proxy API ke :8788
```

> `dev:api` membangun dist dulu (frontend tanpa HMR). Untuk kerja UI sambil API hidup: jalankan keduanya.

## Deploy (GitHub → auto deploy)

1. Push repo ini ke `github.com/Gustyx-Power/website-rom`.
2. Project Worker `xms-port` sudah terhubung ke Git — build command `npm run build`, deploy command `npx wrangler deploy`. `wrangler.toml` (config-as-code) memasang binding D1 + R2 + assets otomatis saat deploy.
3. Secret admin (sekali):
   ```
   npx wrangler secret put ADMIN_TOKEN --name xms-port
   ```
4. Setelah itu tiap `git push` → auto build & deploy. Admin site: `https://<domain>/admin`.

## API ringkas

| Method | Route | Auth |
| --- | --- | --- |
| GET | `/api/roms`, `/api/roms/:slug` | publik |
| POST/PUT/DELETE | `/api/roms`, `/api/roms/:slug` | admin |
| POST | `/api/images` (multipart: `file`, `romId`) | admin |
| DELETE | `/api/images/:id` | admin |
| POST/GET | `/api/login`, `/api/logout`, `/api/me` | — |

## Catatan

- Halaman admin: `/admin` (login pakai `ADMIN_TOKEN`).
- Gambar diserve publik dari `/images/<object_key>` via binding R2 — tanpa public bucket.
- Rotasi `ADMIN_TOKEN` otomatis menglogout semua session lama.

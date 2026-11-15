# XMS Port — Xtra Manager Software Port

Blog / distribusi custom ROM untuk **POCO F5 (marble)**. Neo-brutalism × Swiss, hitam-putih.

**Stack:** React (Vite) · Cloudflare Pages Functions · D1 (data) · R2 (gambar)

## Struktur

```
├─ functions/            # Backend (Pages Functions)
│  ├─ api/
│  │  ├─ login.js / logout.js / me.js        # auth password tunggal (cookie httpOnly)
│  │  ├─ roms/index.js                        # GET daftar (publik), POST buat (admin)
│  │  ├─ roms/[slug].js                       # GET detail (publik), PUT/DELETE (admin)
│  │  └─ images/index.js, images/[id].js      # upload / hapus gambar (admin) → R2 + D1
│  ├─ images/[[path]].js                      # GET /images/* — serve file dari R2 (publik)
│  └─ lib/                                    # response, auth (HMAC cookie), db helper
├─ shared/                # Helper backend (di luar functions/ agar tidak jadi route)
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
npm run dev:cf                        # full stack: vite + functions + D1 lokal → http://localhost:8788
```

> `npm run dev` hanya frontend (API mati). Selalu pakai `dev:cf` untuk develop lengkap.

## Deploy (GitHub → Cloudflare Pages auto deploy)

1. Push repo ini ke `github.com/Xtra-Manager-Software/website-rom`.
2. Cloudflare Dashboard → **Workers & Pages → Create → Pages → Connect to Git** → pilih repo org.
   - Build command: `npm run build` · Output: `dist`
3. Buat resource & bind (Settings → Bindings, atau langsung dari `wrangler.toml` saat build):
   - **D1**: `wrangler d1 create xms-port-db` → ganti `database_id` di `wrangler.toml` → init schema remote:
     `wrangler d1 execute xms-port-db --remote --file=schema.sql`
   - **R2**: `wrangler r2 bucket create xms-port-images` → binding name `IMAGES`
   - **Secret**: `npx wrangler pages secret put ADMIN_TOKEN --project-name xms-port`
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

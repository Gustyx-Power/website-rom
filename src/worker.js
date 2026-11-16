// Worker entry — router API (memakai ulang seluruh handler di functions/) + asset SPA.
// Konfigurasi assets ada di wrangler.toml: /api/* & /images/* hit worker ini dulu,
// sisanya dilayani langsung dari ./dist dengan SPA fallback (not_found_handling).
import * as login from "../functions/api/login.js";
import * as logoutMod from "../functions/api/logout.js";
import * as me from "../functions/api/me.js";
import * as romsIndex from "../functions/api/roms/index.js";
import * as romsSlug from "../functions/api/roms/[slug].js";
import * as imagesIndex from "../functions/api/images/index.js";
import * as imageId from "../functions/api/images/[id].js";
import * as screenshotsSlug from "../functions/api/screenshots/[slug].js";
import * as serveImage from "../functions/images/[[path]].js";
import { err } from "../shared/response.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const seg = url.pathname.split("/").filter(Boolean);
    const method = request.method;

    try {
      if (seg[0] === "api") {
        if (seg[1] === "login" && seg.length === 2 && method === "POST") {
          return login.onRequestPost({ request, env });
        }
        if (seg[1] === "logout" && seg.length === 2 && method === "POST") {
          return logoutMod.onRequestPost({ request, env });
        }
        if (seg[1] === "me" && seg.length === 2 && method === "GET") {
          return me.onRequestGet({ request, env });
        }

        if (seg[1] === "roms") {
          if (seg.length === 2) {
            if (method === "GET") return romsIndex.onRequestGet({ request, env });
            if (method === "POST") return romsIndex.onRequestPost({ request, env });
          } else if (seg.length === 3) {
            const ctx = { request, env, params: { slug: decodeURIComponent(seg[2]) } };
            if (method === "GET") return romsSlug.onRequestGet(ctx);
            if (method === "PUT") return romsSlug.onRequestPut(ctx);
            if (method === "DELETE") return romsSlug.onRequestDelete(ctx);
          }
        }

        if (seg[1] === "images") {
          if (seg.length === 2 && method === "POST") {
            return imagesIndex.onRequestPost({ request, env });
          }
          if (seg.length === 3 && method === "DELETE") {
            return imageId.onRequestDelete({ request, env, params: { id: seg[2] } });
          }
        }

        if (seg[1] === "screenshots" && seg.length === 3 && method === "GET") {
          return screenshotsSlug.onRequestGet({ env, params: { slug: decodeURIComponent(seg[2]) } });
        }

        return err("Method not allowed", 405);
      }

      // Serve file gambar dari R2: /images/<object_key>
      if (seg[0] === "images") {
        return serveImage.onRequestGet({
          request,
          env,
          params: { path: seg.slice(1).join("/") },
        });
      }

      return err("Not found", 404);
    } catch (e) {
      console.error(e);
      return err(e?.message || "Server error", 500);
    }
  },
};

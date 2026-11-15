// GET /images/* — publik: serve file gambar langsung dari binding R2.
// URL gambar: /images/<object_key>  (contoh: /images/roms/1/1720-abc123.png)

function keyFromParams(params) {
  let path = params.path;
  if (path == null) return null;
  const parts = Array.isArray(path) ? path : String(path).split("/");
  return parts
    .map((p) => {
      try {
        return decodeURIComponent(p);
      } catch {
        return p;
      }
    })
    .filter(Boolean)
    .join("/");
}

export async function onRequestGet({ env, params }) {
  const key = keyFromParams(params);
  if (!key) return new Response("Not found", { status: 404 });

  const obj = await env.IMAGES.get(key);
  if (!obj) return new Response("Not found", { status: 404 });

  return new Response(obj.body, {
    status: 200,
    headers: {
      "Content-Type": obj.httpMetadata?.contentType || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
      ETag: obj.httpEtag,
    },
  });
}

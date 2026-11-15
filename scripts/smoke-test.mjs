// Smoke test end-to-end API (butuh server jalan: npm run preview:cf)
// Jalankan: node scripts/smoke-test.mjs [baseUrl]
const base = process.argv[2] || "http://localhost:8788";
const PASSWORD = process.env.SMOKE_PASSWORD || "dev-password";

const PNG_B64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
const png = Uint8Array.from(atob(PNG_B64), (c) => c.charCodeAt(0));

let failures = 0;
function check(name, cond, extra = "") {
  console.log(`${cond ? "✓" : "✗"} ${name}${extra ? ` — ${extra}` : ""}`);
  if (!cond) failures++;
}

async function main() {
  // 1. Login
  const login = await fetch(`${base}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: PASSWORD }),
  });
  const cookie = login.headers.get("set-cookie")?.split(";")[0] || "";
  check("login 200", login.status === 200);
  check("cookie httpOnly", /httponly/i.test(login.headers.get("set-cookie") || ""));

  const auth = { Cookie: cookie };
  const json = { "Content-Type": "application/json" };

  // 2. Login salah
  const badLogin = await fetch(`${base}/api/login`, {
    method: "POST",
    headers: json,
    body: JSON.stringify({ password: "salah" }),
  });
  check("login salah 401", badLogin.status === 401);

  // 3. Create ROM (admin)
  const create = await fetch(`${base}/api/roms`, {
    method: "POST",
    headers: { ...auth, ...json },
    body: JSON.stringify({
      title: "SMOKE TEST ROM",
      version: "v0.1",
      android_version: "16",
      source: "Test Source",
      description: "Baris satu.\nBaris dua.",
      changelog: "Initial build",
      flash_guide: "Step satu\nStep dua",
      download_url: "https://example.com/smoke.zip",
      features: [
        { name: "WiFi", status: "works", notes: "oke" },
        { name: "NFC", status: "broken", notes: "" },
      ],
    }),
  });
  const created = await create.json();
  check("create 201", create.status === 201, `slug=${created.rom?.slug}`);
  const slug = created.rom?.slug;

  // 4. Create tanpa auth
  const noAuth = await fetch(`${base}/api/roms`, {
    method: "POST",
    headers: json,
    body: JSON.stringify({ title: "X" }),
  });
  check("create tanpa auth 401", noAuth.status === 401);

  // 5. GET detail publik
  const detail = await fetch(`${base}/api/roms/${slug}`);
  const d = await detail.json();
  check("detail 200", detail.status === 200);
  check("fitur tersimpan", d.rom?.features?.length === 2);

  // 6. PUT update
  const update = await fetch(`${base}/api/roms/${slug}`, {
    method: "PUT",
    headers: { ...auth, ...json },
    body: JSON.stringify({
      title: "SMOKE TEST ROM EDITED",
      features: [{ name: "BT", status: "partial", notes: "hmm" }],
    }),
  });
  check("update 200", update.status === 200);
  const d2 = await (await fetch(`${base}/api/roms/${slug}`)).json();
  check("update diterapkan", d2.rom.title === "SMOKE TEST ROM EDITED" && d2.rom.features?.length === 1);

  // 7. Upload gambar
  const fd = new FormData();
  fd.append("romId", String(d2.rom.id));
  fd.append("file", new Blob([png], { type: "image/png" }), "test.png");
  const up = await fetch(`${base}/api/images`, { method: "POST", headers: auth, body: fd });
  const upData = await up.json();
  check("upload 201", up.status === 201, upData.image?.url);
  const key = upData.image?.object_key;

  // 8. Serve gambar
  const img = await fetch(`${base}${upData.image?.url}`);
  check("serve gambar 200", img.status === 200, `type=${img.headers.get("content-type")}`);
  const imgBytes = new Uint8Array(await img.arrayBuffer());
  check("isi gambar identik", imgBytes.length === png.length && imgBytes[0] === 0x89);

  // 9. Delete gambar
  const delImg = await fetch(`${base}/api/images/${upData.image?.id}`, {
    method: "DELETE",
    headers: auth,
  });
  check("delete gambar 200", delImg.status === 200);
  const imgGone = await fetch(`${base}${upData.image?.url}`);
  check("gambar hilang 404", imgGone.status === 404);

  // 10. Delete ROM
  const del = await fetch(`${base}/api/roms/${slug}`, { method: "DELETE", headers: auth });
  check("delete rom 200", del.status === 200);
  const gone = await fetch(`${base}/api/roms/${slug}`);
  check("rom hilang 404", gone.status === 404);

  // 11. Logout
  const logout = await fetch(`${base}/api/logout`, { method: "POST" });
  check("logout 200", logout.status === 200);
  const meAfter = await fetch(`${base}/api/me`, {
    headers: { Cookie: logout.headers.get("set-cookie")?.split(";")[0] || "" },
  });
  check("session mati setelah logout", meAfter.status === 401);

  console.log(failures === 0 ? "\nSEMUA TES LULUS ✅" : `\n${failures} TES GAGAL ❌`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});

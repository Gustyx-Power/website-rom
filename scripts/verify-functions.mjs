// Sanity check: import semua file functions dan pastikan export handler valid.
// Jalankan: npm run verify:api
import { readdirSync, statSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const VALID = [
  "onRequest",
  "onRequestGet",
  "onRequestPost",
  "onRequestPut",
  "onRequestDelete",
  "onRequestPatch",
  "onRequestHead",
  "onRequestOptions",
];

async function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${name.name}`;
    if (name.isDirectory()) out.push(...(await walk(p)));
    else if (name.name.endsWith(".js")) out.push(p);
  }
  return out;
}

const root = fileURLToPath(new URL("../functions/", import.meta.url));
const files = await walk(root);
let ok = true;

for (const file of files) {
  const mod = await import(pathToFileURL(file).href);
  const handlers = Object.keys(mod).filter((k) => VALID.includes(k));
  if (handlers.length === 0) {
    console.error(`✗ ${file} — tidak ada handler Pages Functions yang valid`);
    ok = false;
  } else {
    console.log(`✓ ${file} — ${handlers.join(", ")}`);
  }
}

if (!ok) process.exit(1);
console.log(`\nSemua ${files.length} file functions valid.`);

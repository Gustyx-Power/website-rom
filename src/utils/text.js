// Util text: baris → item list (dipakai changelog & flash guide).
export function parseLines(text = "") {
  return String(text)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

// Strip bullet / numbering di awal baris.
export function parseSteps(text = "") {
  return parseLines(text)
    .map((l) => l.replace(/^[-–—•*]\s*/, "").replace(/^\d+[.)]\s*/, "").trim())
    .filter(Boolean);
}

// Baris deskripsi pertama untuk preview card.
export function firstLine(text = "", max = 140) {
  const line = parseLines(text)[0] || "";
  return line.length > max ? `${line.slice(0, max - 1)}…` : line;
}

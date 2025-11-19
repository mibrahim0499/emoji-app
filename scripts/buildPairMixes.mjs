import fs from "node:fs/promises";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const EMOJI_JSON_PATH = path.join(rootDir, "emoji.json");
const OUTPUT_PATH = path.join(rootDir, "public", "pairMixes.json");

/**
 * Normalize a pair of codepoints into a stable key.
 * We sort so that A+B and B+A map to the same entry.
 */
const normalizePairKey = (a, b) => {
  if (!a || !b) return null;
  const left = String(a).toLowerCase();
  const right = String(b).toLowerCase();
  return [left, right].sort().join("+");
};

const isNewer = (a, b) => {
  if (!a) return true;
  if (!b) return false;
  return String(a) > String(b);
};

const main = async () => {
  console.log("Reading emoji.json from:", EMOJI_JSON_PATH);

  const raw = await fs.readFile(EMOJI_JSON_PATH, "utf8");

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse emoji.json:", err);
    process.exitCode = 1;
    return;
  }

  const source = Array.isArray(parsed) ? parsed : parsed.data;
  if (!Array.isArray(source)) {
    console.error("emoji.json has unexpected shape. Expected array or { data: [] }.");
    process.exitCode = 1;
    return;
  }

  /** @type {Record<string, any>} */
  const pairMap = {};

  for (const emoji of source) {
    const combos = emoji?.combinations;
    if (!Array.isArray(combos)) continue;

    for (const combo of combos) {
      const leftCode = combo.leftEmojiCodepoint ?? combo.leftEmoji?.codepoint;
      const rightCode = combo.rightEmojiCodepoint ?? combo.rightEmoji?.codepoint;
      const key = normalizePairKey(leftCode, rightCode);
      if (!key) continue;

      const existing = pairMap[key];
      if (!existing || isNewer(combo.date, existing.date)) {
        pairMap[key] = {
          key,
          leftEmoji: combo.leftEmoji,
          rightEmoji: combo.rightEmoji,
          leftEmojiCodepoint: leftCode,
          rightEmojiCodepoint: rightCode,
          gStaticUrl: combo.gStaticUrl,
          alt: combo.alt,
          date: combo.date,
        };
      }
    }
  }

  const output = {
    generatedAt: new Date().toISOString(),
    count: Object.keys(pairMap).length,
    pairs: pairMap,
  };

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(output), "utf8");

  console.log(`Wrote ${output.count} pairs to ${OUTPUT_PATH}`);
};

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});



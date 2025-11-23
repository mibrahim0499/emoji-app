import fs from "node:fs/promises";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const EMOJI_JSON_PATH = path.join(rootDir, "emoji.json");
const OUTPUT_PATH = path.join(rootDir, "public", "emojiIndex.json");

const main = async () => {
  console.log("Reading emoji.json from:", EMOJI_JSON_PATH);

  const raw = await fs.readFile(EMOJI_JSON_PATH, "utf8");
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    console.error("Failed to parse emoji.json:", error);
    process.exitCode = 1;
    return;
  }

  const source = Array.isArray(parsed) ? parsed : parsed.data;
  if (!Array.isArray(source)) {
    console.error("emoji.json has unexpected shape. Expected array or { data: [] }.");
    process.exitCode = 1;
    return;
  }

  const records = [];

  for (const item of source) {
    if (!item) continue;
    const {
      emoji,
      emojiCodepoint,
      alt,
      keywords,
      category,
      subcategory,
      gBoardOrder,
      combinations,
    } = item;

    if (!emoji || !emojiCodepoint) continue;

    records.push({
      emoji,
      codepoint: String(emojiCodepoint).toLowerCase(),
      name: alt ?? (Array.isArray(keywords) ? keywords[0] : undefined) ?? "",
      keywords: Array.isArray(keywords) ? keywords : [],
      category: category ?? "other",
      subcategory: subcategory ?? "",
      order: typeof gBoardOrder === "number" ? gBoardOrder : Number.MAX_SAFE_INTEGER,
      hasMix: Array.isArray(combinations) && combinations.length > 0,
    });
  }

  records.sort((a, b) => a.order - b.order);

  const output = {
    generatedAt: new Date().toISOString(),
    count: records.length,
    emojis: records,
  };

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(output), "utf8");

  console.log(`Wrote ${output.count} emoji records to ${OUTPUT_PATH}`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});



export type EmojiMix = {
  id: string;
  emojiA: string;
  emojiB: string;
  imageUrl: string;
  label: string;
};

export type EmojiMeta = {
  emoji: string;
  codepoint: string;
  name: string;
  keywords: string[];
  category: string;
  subcategory: string;
  order: number;
  hasMix: boolean;
};

/**
 * Convert an emoji character into the codepoint string format used by emoji.json.
 * Example: \"😀\" -> \"1f600\", \"👩‍💻\" -> \"1f469-200d-1f4bb\".
 */
export const emojiToCodepointSequence = (emoji: string): string => {
  const codepoints: string[] = [];
  for (const symbol of Array.from(emoji)) {
    const cp = symbol.codePointAt(0);
    if (cp !== undefined) {
      codepoints.push(cp.toString(16));
    }
  }
  return codepoints.join("-").toLowerCase();
};

// Helper to create a normalized key from two codepoint sequences so order doesn’t matter.
export const normalizeCodepointPair = (a: string, b: string): string => {
  return [a.toLowerCase(), b.toLowerCase()].sort().join("+");
};


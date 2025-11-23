import { useMemo, useState } from "react";
import type { EmojiMeta } from "../data/emojiMixes";
import "./EmojiPicker.css";

type EmojiPickerProps = {
  emojis: EmojiMeta[];
  emojiA: string | null;
  emojiB: string | null;
  onEmojiClick: (emoji: string) => void;
  highlightCodepoints?: Set<string>;
};

const CATEGORY_ORDER = [
  "all",
  "smileys & emotion",
  "people & body",
  "animals & nature",
  "food & drink",
  "activities",
  "travel & places",
  "objects",
  "symbols",
  "flags",
];

const CATEGORY_LABELS: Record<string, string> = {
  all: "All",
  "smileys & emotion": "Smileys",
  "people & body": "People",
  "animals & nature": "Animals",
  "food & drink": "Food",
  activities: "Activities",
  "travel & places": "Travel",
  objects: "Objects",
  symbols: "Symbols",
  flags: "Flags",
};

export const EmojiPicker = ({
  emojis,
  emojiA,
  emojiB,
  onEmojiClick,
  highlightCodepoints,
}: EmojiPickerProps) => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("smileys & emotion");

  const filteredEmojis = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase();

    return emojis.filter((item) => {
      if (activeCategory !== "all" && item.category !== activeCategory) {
        return false;
      }

      if (!normalizedQuery) return true;

      const haystack = [
        item.name,
        item.emoji,
        ...item.keywords,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [activeCategory, emojis, search]);

  const categoriesWithData = useMemo(() => {
    const set = new Set<string>();
    for (const item of emojis) {
      set.add(item.category);
    }
    const values = CATEGORY_ORDER.filter(
      (key) => key === "all" || set.has(key),
    );
    return values;
  }, [emojis]);

  const handleCategoryClick = (categoryKey: string) => {
    setActiveCategory(categoryKey);
  };

  const hasResults = filteredEmojis.length > 0;

  return (
    <div className="emoji-picker">
      <div className="emoji-picker-header">
        <h2 className="emoji-picker-title">Pick emojis</h2>
        <p className="emoji-picker-hint">
          Tap two emojis to try a mix. Not every pair has a mashup yet. Use
          search or categories to explore the full catalog.
        </p>
      </div>

      <div className="emoji-picker-toolbar">
        <div className="emoji-search-wrapper">
          <input
            type="search"
            className="emoji-search-input"
            placeholder="Search emojis by name or keyword…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="emoji-category-row" aria-label="Emoji categories">
          {categoriesWithData.map((categoryKey) => (
            <button
              key={categoryKey}
              type="button"
              className={`emoji-category-chip${
                activeCategory === categoryKey ? " emoji-category-chip--active" : ""
              }`}
              onClick={() => handleCategoryClick(categoryKey)}
            >
              {CATEGORY_LABELS[categoryKey] ?? categoryKey}
            </button>
          ))}
        </div>
      </div>

      <div className="emoji-grid">
        {hasResults ? (
          filteredEmojis.map((item) => {
            const isSelected = item.emoji === emojiA || item.emoji === emojiB;
            const hasMixWithPrimary =
              highlightCodepoints?.has(item.codepoint) ?? false;
            return (
              <button
                key={item.codepoint}
                type="button"
                className={`emoji-button${
                  isSelected ? " emoji-button--selected" : ""
                }${
                  !isSelected && hasMixWithPrimary
                    ? " emoji-button--has-mix"
                    : ""
                }`}
                onClick={() => onEmojiClick(item.emoji)}
                aria-label={item.name || item.emoji}
              >
                <span className="emoji-glyph" aria-hidden="true">
                  {item.emoji}
                </span>
              </button>
            );
          })
        ) : (
          <div className="emoji-empty-state">
            <p className="emoji-empty-title">No emojis found</p>
            <p className="emoji-empty-body">
              Try a different search term or switch to another category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};


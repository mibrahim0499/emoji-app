# Emoji Mixer

Emoji Mixer is a web app inspired by Gboard’s Emoji Kitchen. It lets you pick two emojis and instantly see a mixed sticker, powered by a large catalog of known emoji combinations.

## Features

- Emoji picker UI: Clean, responsive grid for selecting two emojis.
- Instant mixing: Looks up pairs in a preprocessed catalog (`emoji.json` → `pairMixes.json`) with tens of thousands of combinations.
- Real sticker rendering: Displays mix images using the catalog’s sticker URLs for development/testing.
- Fallback states: Friendly messaging when a pair has no mix or when catalog data isn’t available.
- Modern UI: Single-page React interface with desktop and mobile-friendly layout.

## Tech stack

- Frontend: React + TypeScript + Vite
- Styling: Plain CSS modules per component
- Data:
  - `emoji.json` – Emoji Kitchen–style source catalog (emoji metadata + combinations)
  - `pairMixes.json` – Preprocessed pair → mix map generated from `emoji.json`

## How it works

### 1. Catalog preprocessing

- A Node script reads `emoji.json` and iterates over all `combinations` arrays.
- For each combination, it builds a normalized key like `1f600+1f603` (sorted codepoints).
- It de-duplicates pairs and keeps the most recent entry by `date`.
- The result is written to `public/pairMixes.json` as:
  - `generatedAt` – ISO timestamp  
  - `count` – number of unique pairs  
  - `pairs` – dictionary of `key → { leftEmojiCodepoint, rightEmojiCodepoint, gStaticUrl, alt, date, ... }`

### 2. Runtime lookup

- The React app loads `pairMixes.json` on startup.
- When the user selects two emojis, they are converted to Unicode codepoint sequences (e.g. 🙂 → `1f642`, multi-codepoint sequences supported).
- The app builds the same normalized key and looks it up in `pairs`.
- If found, the corresponding `gStaticUrl` is used as the image source for the mixed sticker.

## Getting started

### Prerequisites

- Node.js 18+ (recommended)
- npm (comes with Node)

### Install

```bash
npm install
```

### Prepare the mix catalog

Make sure `emoji.json` is present at the project root, then:

```bash
npm run build:pair-mixes
```

This generates `public/pairMixes.json` with all pair combinations referenced by the app.

### Run in development

```bash
npm run dev
```

Open the printed URL in your browser (typically `http://localhost:5173`) and start mixing emojis.

### Build for production

```bash
npm run build
```

This creates an optimized production bundle in `dist/`.

## Project structure (high level)

- `src/App.tsx`: App shell, emoji selection state, catalog loading, and mix lookup.
- `src/components/EmojiPicker.tsx`: Emoji grid and selection interactions.
- `src/components/SelectionBar.tsx`: “First” and “Second” emoji slots, swap/clear controls.
- `src/components/MixResult.tsx`: Mixed sticker display and messaging.
- `src/data/emojiMixes.ts`: Base emoji list and helpers for emoji → codepoint conversion.
- `scripts/buildPairMixes.mjs`: Preprocessing script from `emoji.json` → `pairMixes.json`.
- `public/pairMixes.json`: Generated pair → mix metadata used at runtime.

## Legal and licensing notes

- Sticker images: The `gStaticUrl` sticker images referenced in the catalog come from Google’s Emoji Kitchen infrastructure and are used here for experimentation and internal testing only.
- Production use: For any public or commercial deployment, you should:
  - Treat `emoji.json` / `pairMixes.json` strictly as metadata (which pairs exist).
  - Replace `gStaticUrl` with your own assets generated from an open emoji set (e.g. Noto Emoji) or original artwork.
  - Review and comply with all relevant licenses for emoji fonts and images you choose.

## Roadmap / ideas

- Custom rendering pipeline: Programmatic SVG/canvas mixes based on open emoji sets (no reliance on external sticker URLs).
- Search and categories: Filter emojis by name, category, or mood.
- Favorites and history: Store recent mixes locally for quick reuse.
- Share / export: One-click export of stickers as PNG/WebP for use in chats.

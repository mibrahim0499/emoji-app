import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";
import {
  emojiToCodepointSequence,
  normalizeCodepointPair,
  type EmojiMix,
  type EmojiMeta,
} from "./data/emojiMixes";
import { EmojiPicker } from "./components/EmojiPicker";
import { SelectionBar } from "./components/SelectionBar";
import { MixResult } from "./components/MixResult";

type PairMixEntry = {
  key: string;
  leftEmoji?: string;
  rightEmoji?: string;
  leftEmojiCodepoint: string;
  rightEmojiCodepoint: string;
  gStaticUrl: string;
  alt?: string;
  date?: string;
};

type PairMixesData = {
  generatedAt: string;
  count: number;
  pairs: Record<string, PairMixEntry>;
};

type EmojiIndexData = {
  generatedAt: string;
  count: number;
  emojis: EmojiMeta[];
};

type MixSuggestion = {
  id: string;
  emojiA: string;
  emojiB: string;
  label: string;
};

function App() {
  const [emojiA, setEmojiA] = useState<string | null>(null);
  const [emojiB, setEmojiB] = useState<string | null>(null);
  const [pairData, setPairData] = useState<PairMixesData | null>(null);
  const [pairsError, setPairsError] = useState<string | null>(null);
  const [emojiIndex, setEmojiIndex] = useState<EmojiMeta[] | null>(null);
  const [emojiIndexError, setEmojiIndexError] = useState<string | null>(null);
  const [isLoadingPairs, setIsLoadingPairs] = useState<boolean>(false);

  const loadPairs = useCallback(async () => {
    setIsLoadingPairs(true);
    setPairsError(null);

    try {
      const response = await fetch("/pairMixes.json");
      if (!response.ok) {
        throw new Error(`Failed to load pairMixes.json (${response.status})`);
      }
      const json = (await response.json()) as PairMixesData;
      setPairData(json);
    } catch (error) {
      console.error(error);
      setPairsError("Could not load emoji mix catalog. Please try again.");
      setPairData(null);
    } finally {
      setIsLoadingPairs(false);
    }
  }, []);

  useEffect(() => {
    void loadPairs();
  }, [loadPairs]);

  useEffect(() => {
    const loadEmojiIndex = async () => {
      try {
        const response = await fetch("/emojiIndex.json");
        if (!response.ok) {
          throw new Error(`Failed to load emojiIndex.json (${response.status})`);
        }
        const json = (await response.json()) as EmojiIndexData;
        // Only keep emojis that actually have mixes to keep the grid relevant.
        setEmojiIndex(json.emojis.filter((item) => item.hasMix));
      } catch (error) {
        console.error(error);
        setEmojiIndexError("Could not load emoji list.");
        setEmojiIndex(null);
      }
    };

    void loadEmojiIndex();
  }, []);

  const partnerIndex = useMemo(() => {
    if (!pairData) return {};
    const map: Record<string, Set<string>> = {};
    for (const entry of Object.values(pairData.pairs)) {
      const a = entry.leftEmojiCodepoint.toLowerCase();
      const b = entry.rightEmojiCodepoint.toLowerCase();
      if (!map[a]) map[a] = new Set<string>();
      if (!map[b]) map[b] = new Set<string>();
      map[a].add(b);
      map[b].add(a);
    }
    return map;
  }, [pairData]);

  const emojiByCodepoint = useMemo(() => {
    if (!emojiIndex) return {};
    const map: Record<string, EmojiMeta> = {};
    for (const item of emojiIndex) {
      map[item.codepoint.toLowerCase()] = item;
    }
    return map;
  }, [emojiIndex]);

  const handleEmojiClick = (emoji: string) => {
    if (!emojiA) {
      setEmojiA(emoji);
    } else if (!emojiB) {
      setEmojiB(emoji);
    } else {
      // Replace the second selection by default for a simple flow.
      setEmojiB(emoji);
    }
  };

  const handleClear = () => {
    setEmojiA(null);
    setEmojiB(null);
  };

  const handleSwap = () => {
    if (!emojiA && !emojiB) return;
    setEmojiA(emojiB);
    setEmojiB(emojiA);
  };

  const computeMix = (): EmojiMix | null => {
    if (!pairData || !emojiA || !emojiB) return null;
    const leftSeq = emojiToCodepointSequence(emojiA);
    const rightSeq = emojiToCodepointSequence(emojiB);
    const key = normalizeCodepointPair(leftSeq, rightSeq);
    const entry = pairData.pairs[key];
    if (!entry) return null;

    return {
      id: entry.key,
      emojiA: entry.leftEmoji ?? emojiA,
      emojiB: entry.rightEmoji ?? emojiB,
      imageUrl: entry.gStaticUrl,
      label: entry.alt ?? "Emoji mix",
    };
  };

  const mix = computeMix();
  const highlightPartners = useMemo(() => {
    if (!emojiA) return undefined;
    const seq = emojiToCodepointSequence(emojiA);
    return partnerIndex[seq];
  }, [emojiA, partnerIndex]);

  const suggestions: MixSuggestion[] = useMemo(() => {
    if (!emojiA || !emojiB || !emojiByCodepoint) return [];
    const seqA = emojiToCodepointSequence(emojiA);
    const seqB = emojiToCodepointSequence(emojiB);
    const partnersA = partnerIndex[seqA];
    const partnersB = partnerIndex[seqB];
    const results: MixSuggestion[] = [];

    if (partnersA) {
      for (const cp of partnersA) {
        if (cp === seqB) continue;
        const key = normalizeCodepointPair(seqA, cp);
        const pair = pairData?.pairs[key];
        const meta = emojiByCodepoint[cp];
        if (pair && meta) {
          results.push({
            id: key,
            emojiA,
            emojiB: meta.emoji,
            label: pair.alt ?? meta.name ?? "Suggested mix",
          });
        }
        if (results.length >= 3) break;
      }
    }

    if (results.length < 3 && partnersB) {
      for (const cp of partnersB) {
        if (cp === seqA) continue;
        const key = normalizeCodepointPair(cp, seqB);
        const pair = pairData?.pairs[key];
        const meta = emojiByCodepoint[cp];
        if (pair && meta) {
          results.push({
            id: key,
            emojiA: meta.emoji,
            emojiB,
            label: pair.alt ?? meta.name ?? "Suggested mix",
          });
        }
        if (results.length >= 5) break;
      }
    }

    return results;
  }, [emojiA, emojiB, emojiByCodepoint, pairData, partnerIndex]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-badge-row">
          <span className="app-badge">Demo</span>
          {isLoadingPairs && (
            <span className="app-loader" aria-live="polite">
              Loading emoji catalog…
            </span>
          )}
        </div>
        <h1>Emoji Mixer</h1>
        <p className="app-subtitle">
          Pick two emojis and see if there&apos;s a fun mashup, powered by a
          large Emoji Kitchen-style catalog. Perfect for exploring fun sticker
          combinations in your browser.
        </p>
      </header>

      {pairsError && (
        <div className="app-alert" role="status">
          <span className="app-alert-text">{pairsError}</span>
          <button
            type="button"
            className="app-alert-button"
            onClick={() => {
              void loadPairs();
            }}
          >
            Retry
          </button>
        </div>
      )}

      <main className="app-layout">
        <section className="app-column app-column-left">
          <SelectionBar
            emojiA={emojiA}
            emojiB={emojiB}
            onClear={handleClear}
            onSwap={handleSwap}
          />
          <EmojiPicker
            emojis={emojiIndex ?? []}
            emojiA={emojiA}
            emojiB={emojiB}
            onEmojiClick={handleEmojiClick}
            highlightCodepoints={highlightPartners}
          />
          {emojiIndexError && (
            <p className="app-footer-hint">{emojiIndexError}</p>
          )}
        </section>
        <section className="app-column app-column-right">
          <MixResult
            mix={mix}
            emojiA={emojiA}
            emojiB={emojiB}
            suggestions={suggestions}
            onApplySuggestion={(a, b) => {
              setEmojiA(a);
              setEmojiB(b);
            }}
          />
        </section>
      </main>
    </div>
  );
}

export default App;

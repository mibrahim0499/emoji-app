import { useEffect, useState } from "react";
import "./App.css";
import {
  baseEmojis,
  emojiToCodepointSequence,
  normalizeCodepointPair,
  type EmojiMix,
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

function App() {
  const [emojiA, setEmojiA] = useState<string | null>(null);
  const [emojiB, setEmojiB] = useState<string | null>(null);
  const [pairData, setPairData] = useState<PairMixesData | null>(null);
  const [pairsError, setPairsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadPairs = async () => {
      try {
        const response = await fetch("/pairMixes.json");
        if (!response.ok) {
          throw new Error(`Failed to load pairMixes.json (${response.status})`);
        }
        const json = (await response.json()) as PairMixesData;
        if (!cancelled) {
          setPairData(json);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(error);
          setPairsError("Could not load emoji mix catalog.");
        }
      }
    };

    loadPairs();

    return () => {
      cancelled = true;
    };
  }, []);

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
  const isLoadingPairs = !pairData && !pairsError;

  return (
    <div className="app">
      <header className="app-header">
        <h1>Emoji Mixer</h1>
        <p className="app-subtitle">
          Pick two emojis and see if there&apos;s a fun mashup powered by a
          large Emoji Kitchen-style catalog.
          {isLoadingPairs && " Loading mix data…"}
          {pairsError && ` ${pairsError}`}
        </p>
      </header>

      <main className="app-layout">
        <section className="app-column app-column-left">
          <SelectionBar
            emojiA={emojiA}
            emojiB={emojiB}
            onClear={handleClear}
            onSwap={handleSwap}
          />
          <EmojiPicker
            emojis={baseEmojis}
            emojiA={emojiA}
            emojiB={emojiB}
            onEmojiClick={handleEmojiClick}
          />
        </section>
        <section className="app-column app-column-right">
          <MixResult mix={mix} emojiA={emojiA} emojiB={emojiB} />
        </section>
      </main>
    </div>
  );
}

export default App;

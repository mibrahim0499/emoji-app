import type { EmojiMix } from "../data/emojiMixes";
import "./MixResult.css";

type MixResultProps = {
  mix: EmojiMix | null;
  emojiA: string | null;
  emojiB: string | null;
};

export const MixResult = ({ mix, emojiA, emojiB }: MixResultProps) => {
  const hasBothSelected = Boolean(emojiA && emojiB);

  let message = "Pick two emojis to see if there is a mix.";
  if (hasBothSelected && !mix) {
    message = "No mix for this pair yet. Try another combo!";
  }
  if (mix) {
    message = mix.label;
  }

  return (
    <div className="mix-result">
      <h2 className="mix-result-title">Your mix</h2>
      <div className="mix-result-card">
        <div className="mix-result-preview">
          {mix ? (
            <div className="mix-art" data-mix-id={mix.id}>
              <img
                src={mix.imageUrl}
                alt={mix.label}
                className="mix-art-image"
              />
            </div>
          ) : (
            <div className="mix-placeholder" aria-hidden="true">
              <span className="mix-placeholder-emoji">{emojiA ?? "❔"}</span>
              <span className="mix-placeholder-plus">+</span>
              <span className="mix-placeholder-emoji">{emojiB ?? "❔"}</span>
            </div>
          )}
        </div>
        <p className="mix-result-message">{message}</p>
      </div>
    </div>
  );
};



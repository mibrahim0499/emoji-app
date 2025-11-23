import type { EmojiMix } from "../data/emojiMixes";
import "./MixResult.css";

type MixResultProps = {
  mix: EmojiMix | null;
  emojiA: string | null;
  emojiB: string | null;
  suggestions: {
    id: string;
    emojiA: string;
    emojiB: string;
    label: string;
  }[];
  onApplySuggestion: (emojiA: string, emojiB: string) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  history: {
    id: string;
    emojiA: string;
    emojiB: string;
    label: string;
  }[];
  favorites: {
    id: string;
    emojiA: string;
    emojiB: string;
    label: string;
  }[];
  onSelectSummary: (summary: {
    id: string;
    emojiA: string;
    emojiB: string;
    label: string;
  }) => void;
  onCopyLink: () => Promise<void> | void;
  onDownload: () => void;
};

export const MixResult = ({
  mix,
  emojiA,
  emojiB,
  suggestions,
  onApplySuggestion,
  isFavorite,
  onToggleFavorite,
  history,
  favorites,
  onSelectSummary,
  onCopyLink,
  onDownload,
}: MixResultProps) => {
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
        {mix && (
          <button
            type="button"
            className="mix-favorite-toggle"
            onClick={onToggleFavorite}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <span aria-hidden="true">{isFavorite ? "❤️" : "🤍"}</span>
          </button>
        )}
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
      {mix && (
        <div className="mix-actions">
          <button
            type="button"
            className="mix-action-button"
            onClick={onDownload}
          >
            Download
          </button>
          <button
            type="button"
            className="mix-action-button mix-action-button--secondary"
            onClick={() => {
              void onCopyLink();
            }}
          >
            Copy link
          </button>
        </div>
      )}
      {!mix && hasBothSelected && suggestions.length > 0 && (
        <div className="mix-suggestions">
          <p className="mix-suggestions-title">Try one of these instead:</p>
          <div className="mix-suggestions-row">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                type="button"
                className="mix-suggestion-chip"
                onClick={() =>
                  onApplySuggestion(suggestion.emojiA, suggestion.emojiB)
                }
                aria-label={suggestion.label}
              >
                <span aria-hidden="true">
                  {suggestion.emojiA} + {suggestion.emojiB}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      {favorites.length > 0 && (
        <div className="mix-list">
          <p className="mix-list-title">Favorites</p>
          <div className="mix-list-row">
            {favorites.map((item) => (
              <button
                key={item.id}
                type="button"
                className="mix-list-chip"
                onClick={() => onSelectSummary(item)}
                aria-label={item.label}
              >
                <span aria-hidden="true">
                  {item.emojiA} + {item.emojiB}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      {history.length > 0 && (
        <div className="mix-list">
          <p className="mix-list-title">Recent mixes</p>
          <div className="mix-list-row">
            {history.map((item) => (
              <button
                key={item.id}
                type="button"
                className="mix-list-chip"
                onClick={() => onSelectSummary(item)}
                aria-label={item.label}
              >
                <span aria-hidden="true">
                  {item.emojiA} + {item.emojiB}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};



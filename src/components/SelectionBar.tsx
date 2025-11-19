import "./SelectionBar.css";

type SelectionBarProps = {
  emojiA: string | null;
  emojiB: string | null;
  onClear: () => void;
  onSwap: () => void;
};

export const SelectionBar = ({
  emojiA,
  emojiB,
  onClear,
  onSwap,
}: SelectionBarProps) => {
  const hasAnySelection = emojiA || emojiB;

  return (
    <div className="selection-bar">
      <div className="selection-emojis">
        <div className="selection-slot">
          <span className="selection-label">First</span>
          <span className="selection-emoji" aria-hidden="true">
            {emojiA ?? "⬜️"}
          </span>
        </div>
        <span className="selection-plus" aria-hidden="true">
          +
        </span>
        <div className="selection-slot">
          <span className="selection-label">Second</span>
          <span className="selection-emoji" aria-hidden="true">
            {emojiB ?? "⬜️"}
          </span>
        </div>
      </div>

      <div className="selection-actions">
        <button
          type="button"
          className="selection-button"
          onClick={onSwap}
          disabled={!emojiA && !emojiB}
        >
          Swap
        </button>
        <button
          type="button"
          className="selection-button selection-button--secondary"
          onClick={onClear}
          disabled={!hasAnySelection}
        >
          Clear
        </button>
      </div>
    </div>
  );
};



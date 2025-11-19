import "./EmojiPicker.css";

type EmojiPickerProps = {
  emojis: string[];
  emojiA: string | null;
  emojiB: string | null;
  onEmojiClick: (emoji: string) => void;
};

export const EmojiPicker = ({
  emojis,
  emojiA,
  emojiB,
  onEmojiClick,
}: EmojiPickerProps) => {
  return (
    <div className="emoji-picker">
      <div className="emoji-picker-header">
        <h2 className="emoji-picker-title">Pick emojis</h2>
        <p className="emoji-picker-hint">
          Tap two emojis to try a mix. Not every pair has a mashup yet.
        </p>
      </div>
      <div className="emoji-grid">
        {emojis.map((emoji) => {
          const isSelected = emoji === emojiA || emoji === emojiB;
          return (
            <button
              key={emoji}
              type="button"
              className={`emoji-button${isSelected ? " emoji-button--selected" : ""}`}
              onClick={() => onEmojiClick(emoji)}
            >
              <span className="emoji-glyph" aria-hidden="true">
                {emoji}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};



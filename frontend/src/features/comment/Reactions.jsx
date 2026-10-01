import EmojiPicker from './EmojiPicker';

// Existing reactions as pills, plus a picker to add one. A user has at most one
// reaction per comment: clicking your own pill removes it, any other replaces it.
export default function Reactions({ comment, myId, onReact }) {
  const mine = comment.reactions.find((r) => r.user_id === myId)?.emoji;
  const counts = {};
  comment.reactions.forEach(({ emoji }) => (counts[emoji] = (counts[emoji] ?? 0) + 1));

  return (
    <>
      {Object.entries(counts).map(([emoji, count]) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onReact(emoji === mine ? null : emoji)}
          className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors ${
            emoji === mine ? 'border-sky-400/30 bg-sky-500/10 text-sky-300' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
          }`}
        >
          <span>{emoji}</span>
          <span>{count}</span>
        </button>
      ))}
      <EmojiPicker closeOnSelect onSelect={onReact} triggerClassName="p-1" />
    </>
  );
}

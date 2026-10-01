import brandMark from '../../assets/brand-mark.svg';

// The brand mark pulsing and three bouncing dots while the AI is answering.
export default function TypingIndicator() {
  return (
    <div className="flex flex-col gap-1">
      <p className="flex items-center gap-2 text-xs text-slate-500">
        <img src={brandMark} alt="" className="h-5 w-5 animate-pulse opacity-70" /> Assistant
      </p>
      <div className="flex w-fit items-center gap-1 rounded-lg bg-black/30 px-3 py-2.5">
        {['[animation-delay:-0.3s]', '[animation-delay:-0.15s]', ''].map((delay) => (
          <span key={delay} className={`h-1.5 w-1.5 animate-bounce rounded-full bg-slate-500 ${delay}`} />
        ))}
      </div>
    </div>
  );
}

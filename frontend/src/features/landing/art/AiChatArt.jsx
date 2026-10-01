import brandMark from '../../../assets/brand-mark.svg';

// The issue chat in miniature: a question, then the assistant's answer arriving under it,
// above the Summarize / Analyze pills. `active` only adds the animation.
export default function AiChatArt({ active }) {
  const step = (i) => ({ className: active ? 'animate-trail-in' : '', style: active ? { animationDelay: `${i * 0.4}s` } : undefined });
  return (
    <div className="flex h-full w-full flex-col justify-center gap-4 px-2">
      <div {...step(0)}>
        <div className="ml-auto flex w-3/5 flex-col gap-1.5 rounded-lg bg-white/10 px-3 py-2.5">
          <div className="h-2 w-full rounded-full bg-white/40" />
          <div className="h-2 w-2/3 rounded-full bg-white/25" />
        </div>
      </div>

      <div {...step(1)}>
        <div className="flex items-start gap-2">
          <img src={brandMark} alt="" className="mt-0.5 h-4 w-4 shrink-0 opacity-60" />
          <div className="flex w-4/5 flex-col gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
            <div className="h-2 w-full rounded-full bg-white/35" />
            <div className="h-2 w-11/12 rounded-full bg-white/25" />
            <div className="h-2 w-1/2 rounded-full bg-white/15" />
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-2">
        {['Summarize', 'Analyze'].map((label) => (
          <span key={label} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">{label}</span>
        ))}
      </div>
    </div>
  );
}

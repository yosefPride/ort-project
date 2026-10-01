// A comment thread filling in, a reaction landing, then the issue's badge flipping to Closed.
// `active` only adds the animation: without it this is the finished, closed thread.
const COMMENTS = [
  { isOwn: false, widths: ['w-full', 'w-3/5'] },
  { isOwn: true, widths: ['w-full'] },
  { isOwn: false, widths: ['w-4/5', 'w-1/2'] },
];

export default function ThreadArt({ active }) {
  const animate = (name, delay) => ({
    className: active ? name : '',
    style: active ? { animationDelay: `${delay}s` } : undefined,
  });
  const closed = animate('animate-node-in', 0.6);
  const reaction = animate('animate-node-in', 0.3);

  return (
    <div className="relative flex h-full w-full flex-col justify-center gap-3 px-2">
      {/* "Closed" sits on top of "Open" and fades in late in the loop. */}
      <div className="absolute right-2 top-2 grid">
        <span className="col-start-1 row-start-1 rounded-full border border-sky-400/30 bg-sky-500/10 px-2.5 py-0.5 text-xs font-medium text-sky-300">Open</span>
        <span style={closed.style} className={`col-start-1 row-start-1 rounded-full border border-white/10 bg-black px-2.5 py-0.5 text-center text-xs font-medium text-slate-500 ${closed.className}`}>
          Closed
        </span>
      </div>

      {COMMENTS.map(({ isOwn, widths }, i) => (
        <div key={i} {...animate('animate-trail-in', i * 0.3)}>
          <div className={`flex w-3/5 flex-col gap-1.5 rounded-2xl px-3 py-2.5 ${isOwn ? 'ml-auto rounded-tr-sm bg-sky-600/30' : 'rounded-tl-sm bg-white/10'}`}>
            {widths.map((width) => <div key={width} className={`h-2 rounded-full bg-white/30 ${width}`} />)}
          </div>
          {i === 0 && (
            <span style={reaction.style} className={`mt-1.5 inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-300 ${reaction.className}`}>
              😬 <span>2</span>
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

import { AlertTriangle, Ticket } from 'lucide-react';

// The dashboard reduced to the counts you check first and bars rising under them.
// `active` only adds the animation: without it this is the finished picture.
const BARS = [40, 68, 52, 88, 60, 34];

export default function TeamGlanceArt({ active }) {
  return (
    <div className="flex h-full w-full flex-col justify-center gap-6 px-2">
      <div className="flex flex-wrap items-center gap-3">
        <Stat icon={Ticket} value="24" label="open" />
        <Stat icon={AlertTriangle} value="3" label="critical/high" accent />
      </div>
      <div className="flex h-20 items-end gap-2">
        {BARS.map((height, i) => (
          <div
            key={i}
            className={`grow origin-bottom rounded-t-sm bg-linear-to-t from-white/10 to-white/40 ${active ? 'animate-bar-rise' : ''}`}
            style={{ height: `${height}%`, animationDelay: active ? `${i * 0.08}s` : undefined }}
          />
        ))}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, value, label, accent = false }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
      <Icon className={`h-3.5 w-3.5 ${accent ? 'text-white/70' : 'text-white/40'}`} />
      <span className="text-sm font-semibold text-white">{value}</span>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}

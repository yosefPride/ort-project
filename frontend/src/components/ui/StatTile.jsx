export default function StatTile({ icon: Icon, label, value }) {
  return (
    <div className="flex h-full flex-col gap-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
      <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
        <Icon className="h-4 w-4" /> {label}
      </span>
      <span className="text-lg font-semibold text-white">{value}</span>
    </div>
  );
}

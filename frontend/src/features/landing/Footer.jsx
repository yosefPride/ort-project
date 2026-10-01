import Badge from '../../components/ui/Badge';
import HexagonBackground from './HexagonBackground';

// Bump by hand on release.
const VERSION = 'v0.1.0';

// Landing-page footer over the honeycomb. The content row ignores the mouse so the cells under it still light up.
export default function Footer() {
  return (
    <footer className="relative isolate overflow-hidden border-t border-white/10 bg-black">
      <HexagonBackground className="absolute inset-0" hexagonSize={60} hexagonMargin={4} />
      {/* Fade the lattice in from the top and out at the bottom, so it doesn't start at a hard edge. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-black to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-black to-transparent" />

      <div className="pointer-events-none relative mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-24 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Resolve</span>
          <span className="text-xs text-slate-500">© {new Date().getFullYear()}</span>
        </div>
        <Badge variant="outline" size="sm">{VERSION}</Badge>
      </div>
    </footer>
  );
}

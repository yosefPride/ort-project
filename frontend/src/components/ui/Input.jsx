import { Search } from 'lucide-react';

// Shared look of text inputs (Textarea uses it too).
export const FIELD = 'rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-sky-400/50 focus:ring-1 focus:ring-sky-400/50';

// type="search" gets a leading search icon.
export default function Input({ className = '', type, ...props }) {
  if (type !== 'search') return <input type={type} className={`${FIELD} ${className}`} {...props} />;
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      <input type="search" className={`${FIELD} w-full pl-9`} {...props} />
    </div>
  );
}

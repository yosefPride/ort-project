import { initials } from '../../utils/labels';

const AVATAR_COLORS = [
  'bg-violet-500/20 text-violet-300', 'bg-sky-500/20 text-sky-300', 'bg-green-500/20 text-green-300',
  'bg-amber-500/20 text-amber-300', 'bg-rose-500/20 text-rose-300', 'bg-teal-500/20 text-teal-300',
  'bg-orange-500/20 text-orange-300', 'bg-fuchsia-500/20 text-fuchsia-300',
];

// Initials in a circle. The color comes from hashing `seed` (the user id), so a user always gets the same one.
export default function Avatar({ name, seed = name, size = 'md' }) {
  let hash = 0;
  for (const char of seed || '?') hash = (hash * 31 + char.codePointAt(0)) >>> 0;
  const sizes = size === 'sm' ? 'h-5 w-5 text-[9px]' : 'h-6 w-6 text-[10px]';
  return (
    <span aria-hidden className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${sizes} ${AVATAR_COLORS[hash % AVATAR_COLORS.length]}`}>
      {initials(name || '?')}
    </span>
  );
}

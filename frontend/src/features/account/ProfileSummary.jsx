import Badge from '../../components/ui/Badge';
import { formatDate } from '../../utils/dates';
import { initials } from '../../utils/labels';

export default function ProfileSummary({ me }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-6">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 text-xl font-semibold text-white">
        {initials(me.name)}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="truncate text-lg font-semibold text-white">{me.name}</h2>
          {me.is_admin && <Badge variant="accent">System Admin</Badge>}
        </div>
        <p className="truncate text-sm text-slate-300">{me.email}</p>
        <p className="mt-1 text-xs text-slate-400">Member since {formatDate(me.created_at)}</p>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import { PRIORITY_VARIANT, STATUS_VARIANT, capitalize } from '../../utils/labels';

// `card` is a standalone bordered row (issues list); `row` has no border of its
// own, for lists whose parent draws the frame and dividers (dashboard).
const WRAPPERS = {
  card: 'rounded-lg border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10',
  row: 'px-4 py-5 hover:bg-white/5',
};

// `meta` is the small text before the badges: the reporter, or the team name on the dashboard.
export default function IssueCard({ issue, meta, variant = 'card' }) {
  return (
    <Link
      to={`/issues/${issue._id}?team=${issue.team_id}`}
      className={`flex items-center justify-between gap-4 transition-colors ${WRAPPERS[variant]}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="shrink-0 text-xs font-medium text-slate-500">#{issue.number}</span>
        <span className="truncate text-sm font-medium text-white">{issue.title}</span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="hidden w-28 truncate text-xs text-slate-400 sm:inline">{meta}</span>
        <div className="flex w-20"><Badge variant={STATUS_VARIANT[issue.status]}>{capitalize(issue.status)}</Badge></div>
        <div className="flex w-20"><Badge variant={PRIORITY_VARIANT[issue.priority]}>{capitalize(issue.priority)}</Badge></div>
      </div>
    </Link>
  );
}

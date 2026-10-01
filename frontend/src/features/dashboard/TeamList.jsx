import { Link } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import { roleLabel } from '../../utils/labels';

export default function TeamList({ teams }) {
  const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-white">Your teams</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {teams.map((team) => (
          <Link key={team._id} to={`/issues?team=${team._id}`} className="flex flex-col gap-2 rounded-lg border border-white/10 bg-white/5 p-4 text-left transition-colors hover:border-white/20 hover:bg-white/10">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate font-semibold text-white">{team.name}</span>
              <Badge size="sm">{roleLabel(team.role)}</Badge>
            </div>
            <p className="text-sm text-slate-400">{plural(team.member_count, 'member')} · {plural(team.open_issues, 'open issue')}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

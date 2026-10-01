import { Link } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { api } from '../../api';
import Loading from '../../components/ui/Loading';
import IssueCard from '../issue/IssueCard';

// The 6 most recently updated issues across all teams, from each team's normal issue list.
export default function RecentActivity({ teams }) {
  const results = useQueries({
    queries: teams.map((team) => ({ queryKey: ['teams', team._id, 'issues'], queryFn: () => api(`/teams/${team._id}/issues`) })),
  });
  if (results.some((result) => result.isPending)) return <Loading text="Loading recent activity…" />;

  const teamName = Object.fromEntries(teams.map((team) => [team._id, team.name]));
  const recent = results
    .flatMap((result) => result.data ?? [])
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 6);
  if (recent.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-white">Recent activity</h2>
      <div className="flex flex-col divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10 bg-white/5">
        {recent.map((issue) => <IssueCard key={issue._id} issue={issue} meta={teamName[issue.team_id]} variant="row" />)}
        <Link to="/issues" className="px-4 py-3 text-center text-sm font-medium text-sky-300 transition-colors hover:bg-white/5 hover:text-sky-200">
          View all issues
        </Link>
      </div>
    </div>
  );
}

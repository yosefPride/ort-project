import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, Plus } from 'lucide-react';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import Menu, { MenuItem } from '../../components/ui/Menu';
import Modal from '../../components/ui/Modal';
import { useGet } from '../../hooks/useGet';
import IssueForm from './IssueForm';
import IssueList from './IssueList';

// One team's issues. The team is in the URL (?team=<id>), so refreshing or sharing the link keeps it.
export default function IssuesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const teamId = searchParams.get('team') ?? '';
  const [isCreating, setIsCreating] = useState(false);
  const { data: teams = [], status } = useGet('/teams');

  // No team picked yet: open the first one.
  useEffect(() => {
    if (!teamId && teams.length > 0) setSearchParams({ team: teams[0]._id }, { replace: true });
  }, [teamId, teams, setSearchParams]);

  if (status === 'pending') return <Loading />;
  if (status === 'error') return <p className="text-sm text-red-500">Couldn't load your teams.</p>;
  if (teams.length === 0) {
    return <p className="text-sm text-slate-400">You're not in any team yet. Create one from the sidebar to start opening issues.</p>;
  }

  const team = teams.find((t) => t._id === teamId);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Menu
          align="start"
          width="w-56"
          trigger={
            <button type="button" className="group flex min-w-0 max-w-full items-center gap-2 text-2xl font-bold text-white outline-none">
              <span className="truncate">{team?.name ?? 'Select a team'}</span>
              <ChevronDown className="h-5 w-5 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
            </button>
          }
        >
          {teams.map((t) => (
            <MenuItem key={t._id} variant="plain" className={t._id === teamId ? 'text-white' : 'text-slate-300'} onSelect={() => setSearchParams({ team: t._id })}>
              {t.name}
            </MenuItem>
          ))}
        </Menu>
        <Button onClick={() => setIsCreating(true)} className="shrink-0">
          <Plus className="mr-1 h-4 w-4" /> New issue
        </Button>
      </div>

      {/* key: switching teams starts with fresh filters */}
      {teamId && <IssueList key={teamId} teamId={teamId} />}

      <Modal isOpen={isCreating} onClose={() => setIsCreating(false)} title="New issue">
        <IssueForm teamId={teamId} onDone={() => setIsCreating(false)} />
      </Modal>
    </section>
  );
}

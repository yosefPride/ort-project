import { useState } from 'react';
import { Plus, UserPlus } from 'lucide-react';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import Modal from '../components/ui/Modal';
import { useGet } from '../hooks/useGet';
import CreateTeamForm from '../features/team/CreateTeamForm';
import DashboardStats from '../features/dashboard/DashboardStats';
import NewIssueForm from '../features/dashboard/NewIssueForm';
import RecentActivity from '../features/dashboard/RecentActivity';
import TeamList from '../features/dashboard/TeamList';

export default function DashboardPage({ me }) {
  const { data: teams = [], status } = useGet('/teams');
  const [modal, setModal] = useState(null); // 'team' | 'issue' | null
  const close = () => setModal(null);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Welcome, {me.name} 👋</h1>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="ghost" onClick={() => setModal('team')}><UserPlus className="mr-1 h-4 w-4" /> New team</Button>
          {teams.length > 0 && <Button onClick={() => setModal('issue')}><Plus className="mr-1 h-4 w-4" /> New issue</Button>}
        </div>
      </div>

      {status === 'pending' && <Loading text="Loading your teams…" />}
      {status === 'error' && <p className="text-sm text-red-500">Couldn't load your teams.</p>}
      {status === 'success' && teams.length === 0 && (
        <div className="flex flex-col items-center gap-3 border-t border-white/10 py-10 text-center">
          <p className="text-sm text-slate-400">You're not part of any team yet.</p>
          <Button onClick={() => setModal('team')}>Create a team</Button>
        </div>
      )}
      {teams.length > 0 && (
        <>
          <DashboardStats teams={teams} />
          <div className="grid grid-cols-1 gap-6 border-t border-white/10 pt-6 lg:grid-cols-[7fr_3fr]">
            <RecentActivity teams={teams} />
            <TeamList teams={teams} />
          </div>
        </>
      )}

      <Modal isOpen={modal === 'team'} onClose={close} title="Create a team"><CreateTeamForm onCreated={close} /></Modal>
      <Modal isOpen={modal === 'issue'} onClose={close} title="New issue"><NewIssueForm teams={teams} onDone={close} /></Modal>
    </section>
  );
}

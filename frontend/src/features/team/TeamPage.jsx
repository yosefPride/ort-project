import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, Pencil, Ticket, User } from 'lucide-react';
import Button from '../../components/ui/Button';
import ConfirmModal from '../../components/ui/ConfirmModal';
import Loading from '../../components/ui/Loading';
import Modal from '../../components/ui/Modal';
import StatTile from '../../components/ui/StatTile';
import { useGet } from '../../hooks/useGet';
import { useRefresh } from '../../hooks/useRefresh';
import { useSend } from '../../hooks/useSend';
import { useTeam } from '../../hooks/useTeam';
import { formatRelativeTime } from '../../utils/dates';
import { roleLabel } from '../../utils/labels';
import MemberList from './MemberList';
import RenameTeamForm from './RenameTeamForm';

export default function TeamPage({ me }) {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const team = useTeam(teamId);
  const { status } = useGet('/teams');
  const { data: issues = [] } = useGet(`/teams/${teamId}/issues`, { enabled: Boolean(team) });
  const [modal, setModal] = useState(null); // 'rename' | 'delete' | 'leave' | null
  const remove = useSend();
  const refresh = useRefresh();

  if (status === 'pending') return <Loading />;
  if (!team) return <p className="text-sm text-red-500">Couldn't load this team. You may not be a member, or it may not exist.</p>;

  const isAdmin = team.role === 'admin';
  const lastActivity = issues.map((issue) => issue.updated_at).sort().at(-1);
  const leaveOrDelete = (path) =>
    remove.mutate({ path, method: 'DELETE' }, { onSuccess: () => { navigate('/dashboard'); refresh('/teams'); } });

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold text-white">{team.name}</h1>
          <p className="text-sm text-slate-400">Your role: {roleLabel(team.role)}</p>
        </div>
        {isAdmin ? (
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={() => setModal('rename')} title="Rename team" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-slate-300 transition-colors hover:bg-white/20 hover:text-white">
              <Pencil className="h-4 w-4" />
            </button>
            <Button variant="dangerOutline" onClick={() => setModal('delete')}>Delete team</Button>
          </div>
        ) : (
          <Button variant="dangerOutline" className="shrink-0" onClick={() => setModal('leave')}>Leave team</Button>
        )}
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-white">Quick Stats</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatTile icon={User} label="Members" value={team.member_count} />
            <StatTile icon={Ticket} label="Open Issues" value={team.open_issues} />
            <StatTile icon={Clock} label="Last Activity" value={formatRelativeTime(lastActivity)} />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-white">Members</h2>
          <MemberList team={team} me={me} />
        </div>
      </div>

      <Modal isOpen={modal === 'rename'} onClose={() => setModal(null)} title="Rename team">
        <RenameTeamForm team={team} onDone={() => setModal(null)} />
      </Modal>
      <ConfirmModal
        isOpen={modal === 'leave'}
        onClose={() => setModal(null)}
        title="Leave team"
        confirmLabel="Leave team"
        pendingLabel="Leaving…"
        action={remove}
        onConfirm={() => leaveOrDelete(`/teams/${teamId}/members/${me._id}`)}
      >
        Are you sure you want to leave <span className="font-semibold text-white">{team.name}</span>? You'll lose access to its issues, and a Team Admin would need to add you back to rejoin.
      </ConfirmModal>
      <ConfirmModal
        isOpen={modal === 'delete'}
        onClose={() => setModal(null)}
        title="Delete team"
        confirmLabel="Delete team"
        pendingLabel="Deleting…"
        action={remove}
        onConfirm={() => leaveOrDelete(`/teams/${teamId}`)}
      >
        Are you sure you want to delete <span className="font-semibold text-white">{team.name}</span>? This cannot be undone.
      </ConfirmModal>
    </section>
  );
}

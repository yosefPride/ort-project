import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, FileText, MessageSquare, MoreVertical, Pencil } from 'lucide-react';
import Markdown from '../components/Markdown';
import Button from '../components/ui/Button';
import ConfirmModal from '../components/ui/ConfirmModal';
import Loading from '../components/ui/Loading';
import Menu, { MenuItem } from '../components/ui/Menu';
import Modal from '../components/ui/Modal';
import { useGet } from '../hooks/useGet';
import { useRefresh } from '../hooks/useRefresh';
import { useSend } from '../hooks/useSend';
import { useTeam } from '../hooks/useTeam';
import { formatDateTime, formatRelativeTime } from '../utils/dates';
import AiChat from '../features/chat/AiChat';
import Comments from '../features/comment/Comments';
import IssueForm from '../features/issue/IssueForm';
import IssueMeta from '../features/issue/IssueMeta';
import IssueTab from '../features/issue/IssueTab';

const PANEL = 'h-128 rounded-xl border border-white/10 bg-white/2 p-6 lg:h-auto lg:min-h-0 lg:flex-1';

export default function IssuePage({ me }) {
  const { issueId } = useParams();
  const teamId = useSearchParams()[0].get('team') ?? '';
  const navigate = useNavigate();
  const path = `/teams/${teamId}/issues/${issueId}`;
  const { data: issue, status } = useGet(path, { enabled: Boolean(teamId) });
  const { data: comments } = useGet(`${path}/comments`, { enabled: Boolean(teamId) });
  const team = useTeam(teamId);
  const [tab, setTab] = useState('details');
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const remove = useSend();
  const refresh = useRefresh();
  const backLink = (
    <Link to={`/issues?team=${teamId}`} className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white">
      <ArrowLeft className="h-4 w-4" /> Back to Issues
    </Link>
  );

  if (!teamId || status === 'error') {
    return (
      <section className="flex flex-col gap-4">
        <p className="text-sm text-red-500">Couldn't load this issue. It may not exist, or you may not have access.</p>
        {backLink}
      </section>
    );
  }
  if (!issue) return <Loading />;

  // Same rules as the backend: team admins and the creator can do everything, the assignee can edit.
  const canDelete = team?.role === 'admin' || issue.creator_id === me._id;
  const canEdit = canDelete || issue.assignee_id === me._id;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        {backLink}
        {canEdit && (
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-1.5 border border-white/10" onClick={() => setIsEditing(true)}>
              <Pencil className="h-3.5 w-3.5" /> Edit Issue
            </Button>
            {canDelete && (
              <Menu
                trigger={
                  <button type="button" aria-label="Issue actions" className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/10 hover:text-white">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                }
              >
                <MenuItem variant="danger" onSelect={() => setIsDeleting(true)}>Delete issue</MenuItem>
              </Menu>
            )}
          </div>
        )}
      </div>

      {/* From lg up the page is pinned to 80vh and long content scrolls inside its card. */}
      <div className="flex flex-col gap-6 lg:grid lg:h-[80vh] lg:grid-cols-[minmax(0,1fr)_320px] lg:items-stretch">
        <div className="flex flex-col gap-6 lg:min-h-0">
          <div className="wrap-break rounded-xl border border-white/10 bg-white/2 p-6 lg:shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm text-slate-500">
              <p>
                <span className="font-medium">#{issue.number}</span> ·{' '}
                <span title={formatDateTime(issue.created_at)}>Created {formatRelativeTime(issue.created_at)}</span>
              </p>
              <p title={formatDateTime(issue.updated_at)}>Updated {formatRelativeTime(issue.updated_at)}</p>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-white">{issue.title}</h1>
          </div>

          <div className="flex flex-col gap-4 lg:min-h-0 lg:flex-1">
            <div className="flex shrink-0 gap-6 overflow-x-auto border-b border-white/10">
              <IssueTab icon={FileText} isActive={tab === 'details'} onClick={() => setTab('details')}>Details</IssueTab>
              <IssueTab icon={MessageSquare} isActive={tab === 'comments'} onClick={() => setTab('comments')}>
                Comments
                {comments && <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-xs text-slate-300">{comments.length}</span>}
              </IssueTab>
            </div>
            {/* Hidden rather than removed, so a half-written comment survives a tab switch. */}
            <div className={tab === 'details' ? `${PANEL} overflow-y-auto wrap-break text-sm text-slate-200` : 'hidden'}>
              <Markdown>{issue.description}</Markdown>
            </div>
            <div className={tab === 'comments' ? `${PANEL} flex flex-col` : 'hidden'}>
              <Comments issue={issue} me={me} isAdmin={team?.role === 'admin'} isVisible={tab === 'comments'} />
            </div>
          </div>
        </div>

        <aside className="flex min-h-0 flex-col gap-6">
          <IssueMeta issue={issue} team={team} canEdit={canEdit} />
          <AiChat key={issue._id} issue={issue} me={me} />
        </aside>
      </div>

      <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title="Edit issue">
        <IssueForm teamId={teamId} issue={issue} onDone={() => setIsEditing(false)} onCancel={() => setIsEditing(false)} />
      </Modal>

      <ConfirmModal
        isOpen={isDeleting}
        onClose={() => setIsDeleting(false)}
        title="Delete issue"
        confirmLabel="Delete issue"
        pendingLabel="Deleting…"
        action={remove}
        onConfirm={() => remove.mutate({ path, method: 'DELETE' }, { onSuccess: () => { navigate(`/issues?team=${teamId}`); refresh('/teams'); } })}
      >
        Are you sure you want to delete <span className="font-semibold text-white">#{issue.number} {issue.title}</span>? This cannot be undone.
      </ConfirmModal>
    </div>
  );
}

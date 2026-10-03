import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import ErrorText from '../../components/ui/ErrorText';
import { useMembers } from '../../hooks/useMembers';
import { useSend } from '../../hooks/useSend';
import { PRIORITY_VARIANT, STATUS_VARIANT, capitalize } from '../../utils/labels';
import MetaPicker from './MetaPicker';
import MetaRow from './MetaRow';

const choices = (values) => values.map((value) => ({ value, label: capitalize(value) }));

// Right-hand summary card of an issue page.
export default function IssueMeta({ issue, team, canEdit }) {
  const { members, nameOf } = useMembers(issue.team_id);
  const send = useSend('/teams');
  const save = (changes) =>
    send.mutate({ path: `/teams/${issue.team_id}/issues/${issue._id}`, method: 'PUT', body: { ...issue, ...changes } });
  const assignees = [{ value: '', label: 'Unassigned' }, ...members.map((m) => ({ value: m._id, label: m.name }))];

  return (
    <div className="rounded-xl border border-white/10 bg-white/2 p-6 lg:shrink-0">
      <dl className="flex flex-col gap-4">
        <MetaRow label="Priority">
          <MetaPicker label="priority" value={issue.priority} options={choices(['low', 'high', 'critical'])} canEdit={canEdit} onSelect={(priority) => save({ priority })}>
            <Badge size="sm" variant={PRIORITY_VARIANT[issue.priority]}>{capitalize(issue.priority)}</Badge>
          </MetaPicker>
        </MetaRow>
        <MetaRow label="Status">
          <MetaPicker label="status" value={issue.status} options={choices(['open', 'closed'])} canEdit={canEdit} onSelect={(status) => save({ status })}>
            <Badge size="sm" variant={STATUS_VARIANT[issue.status]}>{capitalize(issue.status)}</Badge>
          </MetaPicker>
        </MetaRow>
        <MetaRow label="Assignee">
          <MetaPicker label="assignee" value={issue.assignee_id ?? ''} options={assignees} canEdit={canEdit} onSelect={(id) => save({ assignee_id: id || null })}>
            <span className="flex min-w-0 items-center gap-2 hover:text-white">
              {issue.assignee_id ? (
                <>
                  <Avatar name={nameOf(issue.assignee_id)} seed={issue.assignee_id} size="sm" />
                  <span className="truncate">{nameOf(issue.assignee_id)}</span>
                </>
              ) : (
                <span className="text-slate-500">Unassigned</span>
              )}
            </span>
          </MetaPicker>
        </MetaRow>
        <MetaRow label="Reporter">
          <Avatar name={nameOf(issue.creator_id)} seed={issue.creator_id} size="sm" />
          <span className="truncate">{nameOf(issue.creator_id)}</span>
        </MetaRow>
        <MetaRow label="Team">
          <Users className="h-4 w-4 shrink-0 text-slate-400" />
          <Link to={`/teams/${issue.team_id}`} className="truncate hover:text-white hover:underline">{team?.name ?? '—'}</Link>
        </MetaRow>
      </dl>
      <ErrorText error={send.error} className="mt-4" />
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { MoreVertical } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import ErrorText from '../../components/ui/ErrorText';
import Menu, { MenuItem } from '../../components/ui/Menu';
import { useMembers } from '../../hooks/useMembers';
import { useSend } from '../../hooks/useSend';
import { roleLabel } from '../../utils/labels';
import AddMember from './AddMember';

export default function MemberList({ team, me }) {
  const navigate = useNavigate();
  const { members } = useMembers(team._id);
  const change = useSend(`/teams/${team._id}`, '/teams');
  const isAdmin = team.role === 'admin';
  const memberPath = (member) => `/teams/${team._id}/members/${member._id}`;

  return (
    <div className="flex flex-col gap-4">
      <ErrorText error={change.error} />
      <ul className="flex flex-col gap-2">
        {members.map((member) => (
          <li key={member._id} className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{member.name}</p>
              <p className="truncate text-xs text-slate-400">{member.email}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge>{roleLabel(member.role)}</Badge>
              {isAdmin && (
                <Menu
                  trigger={
                    <button type="button" disabled={change.isPending} aria-label="Member actions" className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  }
                >
                  <MenuItem onSelect={() => change.mutate({ path: memberPath(member), method: 'PATCH', body: { role: member.role === 'admin' ? 'contributor' : 'admin' } })}>
                    {member.role === 'admin' ? 'Demote' : 'Promote'}
                  </MenuItem>
                  <MenuItem
                    variant="danger"
                    onSelect={() => change.mutate({ path: memberPath(member), method: 'DELETE' }, { onSuccess: () => member._id === me._id && navigate('/dashboard') })}
                  >
                    {member._id === me._id ? 'Leave' : 'Remove'}
                  </MenuItem>
                </Menu>
              )}
            </div>
          </li>
        ))}
      </ul>
      {isAdmin && (
        <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
          <h3 className="text-sm font-semibold text-white">Add member</h3>
          <AddMember teamId={team._id} />
        </div>
      )}
    </div>
  );
}

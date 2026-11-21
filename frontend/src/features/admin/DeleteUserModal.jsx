import { useState } from 'react';
import ConfirmModal from '../../components/ui/ConfirmModal';
import Field from '../../components/ui/Field';
import Select from '../../components/ui/Select';
import { useGet } from '../../hooks/useGet';
import { useSend } from '../../hooks/useSend';

// Confirms deleting a user. Teams where they're the only member are deleted
// with them; for teams where they're the only admin, a new admin is chosen here.
export default function DeleteUserModal({ user, users, onClose }) {
  const { data: teams = [] } = useGet('/admin/teams');
  const [replacements, setReplacements] = useState({}); // { team_id: user_id }
  const action = useSend('/admin');
  const nameOf = (id) => users.find((u) => u._id === id)?.name ?? 'Unknown user';

  const theirTeams = teams.filter((team) => team.members.some((m) => m.user_id === user._id));
  const deletedTeams = theirTeams.filter((team) => team.members.length === 1);
  const needAdmin = theirTeams.filter((team) => {
    const admins = team.members.filter((m) => m.role === 'admin');
    return team.members.length > 1 && admins.length === 1 && admins[0].user_id === user._id;
  });

  return (
    <ConfirmModal
      isOpen
      onClose={onClose}
      title={`Delete ${user.name}`}
      confirmLabel="Delete user"
      pendingLabel="Working…"
      action={action}
      onConfirm={() => action.mutate(
        { method: 'DELETE', path: `/admin/users/${user._id}`, body: { replacements } },
        { onSuccess: onClose },
      )}
    >
      <p>
        Delete <span className="font-semibold text-white">{user.name}</span> ({user.email})? This removes their account
        and every team membership. This cannot be undone.
      </p>
      {deletedTeams.length > 0 && (
        <p className="mt-3">
          They're the only member of {deletedTeams.map((team) => `"${team.name}"`).join(', ')}, which will be deleted too.
        </p>
      )}
      {needAdmin.length > 0 && (
        <div className="mt-4 flex flex-col gap-3">
          <p>They're the only admin of these teams. Choose who takes over:</p>
          {needAdmin.map((team) => (
            <Field key={team._id} label={team.name}>
              <Select
                value={replacements[team._id] ?? ''}
                onChange={(e) => setReplacements({ ...replacements, [team._id]: e.target.value })}
              >
                <option value="" disabled>Choose a new admin</option>
                {team.members.filter((m) => m.user_id !== user._id).map((m) => (
                  <option key={m.user_id} value={m.user_id}>{nameOf(m.user_id)}</option>
                ))}
              </Select>
            </Field>
          ))}
        </div>
      )}
    </ConfirmModal>
  );
}

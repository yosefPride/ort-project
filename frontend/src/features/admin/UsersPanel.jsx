import { useState } from 'react';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import Table, { Td, Tr } from '../../components/ui/Table';
import { useGet } from '../../hooks/useGet';
import { formatDate } from '../../utils/dates';
import SearchBox from './SearchBox';
import { matches } from './matches';
import { useAdminAction } from './useAdminAction';

export default function UsersPanel({ me }) {
  const [search, setSearch] = useState('');
  const { data: users = [], status } = useGet('/admin/users');
  const [confirm, modal] = useAdminAction();
  const shown = users.filter((user) => matches(search, user.name, user.email));
  const who = (user) => <><span className="font-semibold text-white">{user.name}</span> ({user.email})</>;

  const setAdmin = (user, isAdmin) =>
    confirm({
      title: `${isAdmin ? 'Promote' : 'Demote'} ${user.name}`,
      confirmLabel: isAdmin ? 'Promote to System Admin' : 'Demote',
      variant: isAdmin ? 'primary' : 'danger',
      message: isAdmin
        ? <>Grant {who(user)} the System Admin role? They'll gain access to system-wide user and team metadata.</>
        : <>Revoke {who(user)}'s System Admin role? They'll lose access to system-wide user and team metadata.</>,
      method: 'PATCH',
      path: `/admin/users/${user._id}`,
      body: { is_admin: isAdmin },
    });

  return (
    <>
      <SearchBox value={search} onChange={setSearch} placeholder="Search by name or email" />
      {status === 'pending' && <Loading />}
      {status === 'success' && shown.length === 0 && <p className="text-sm text-slate-400">No users found.</p>}
      {shown.length > 0 && (
        <Table columns={['Name', 'Email', 'Global Role', 'Created', { label: 'Actions', right: true }]}>
          {shown.map((user) => (
            <Tr key={user._id}>
              <Td className="font-medium text-white">{user.name}</Td>
              <Td className="text-slate-300">{user.email}</Td>
              <Td className="text-slate-300">{user.is_admin ? 'System Admin' : 'User'}</Td>
              <Td className="text-slate-400">{formatDate(user.created_at)}</Td>
              <Td className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {user._id === me._id ? (
                    <span className="text-xs text-slate-500">You</span>
                  ) : (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => setAdmin(user, !user.is_admin)}>{user.is_admin ? 'Demote' : 'Promote'}</Button>
                      <Button
                        variant="dangerOutline"
                        size="sm"
                        onClick={() => confirm({
                          title: `Delete ${user.name}`,
                          confirmLabel: 'Delete user',
                          message: <>Delete {who(user)}? This removes their account and every team membership. This cannot be undone.</>,
                          method: 'DELETE',
                          path: `/admin/users/${user._id}`,
                        })}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      )}
      {modal}
    </>
  );
}

import { useState } from 'react';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import Table, { Td, Tr } from '../../components/ui/Table';
import { useGet } from '../../hooks/useGet';
import { formatDate } from '../../utils/dates';
import SearchBox from './SearchBox';
import { matches } from './matches';
import { useAdminAction } from './useAdminAction';

export default function TeamsPanel() {
  const [search, setSearch] = useState('');
  const { data: teams = [], status } = useGet('/admin/teams');
  const [confirm, modal] = useAdminAction();
  const shown = teams.filter((team) => matches(search, team.name));

  return (
    <>
      <SearchBox value={search} onChange={setSearch} placeholder="Search by name" />
      {status === 'pending' && <Loading />}
      {status === 'success' && shown.length === 0 && <p className="text-sm text-slate-400">No teams found.</p>}
      {shown.length > 0 && (
        <Table columns={['Name', 'Members', 'Created', { label: 'Actions', right: true }]}>
          {shown.map((team) => (
            <Tr key={team._id}>
              <Td className="font-medium text-white">{team.name}</Td>
              <Td className="text-slate-400">{team.members.length}</Td>
              <Td className="text-slate-400">{formatDate(team.created_at)}</Td>
              <Td className="text-right">
                <Button
                  variant="dangerOutline"
                  size="sm"
                  onClick={() => confirm({
                    title: 'Delete team',
                    confirmLabel: 'Delete team',
                    message: <>Delete <span className="font-semibold text-white">{team.name}</span> and all of its data? This cannot be undone.</>,
                    method: 'DELETE',
                    path: `/admin/teams/${team._id}`,
                  })}
                >
                  Delete team
                </Button>
              </Td>
            </Tr>
          ))}
        </Table>
      )}
      {modal}
    </>
  );
}

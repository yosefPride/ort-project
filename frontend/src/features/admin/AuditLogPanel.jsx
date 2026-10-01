import { useState } from 'react';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import Select from '../../components/ui/Select';
import Table, { Td, Tr } from '../../components/ui/Table';
import { useGet } from '../../hooks/useGet';
import { formatDateTime } from '../../utils/dates';
import { ACTION_LABELS } from './actionLabels';

// Every deletion in the system, newest first.
export default function AuditLogPanel() {
  const { data: logs = [], status } = useGet('/admin/audit-logs');
  const [action, setAction] = useState('');
  const [actor, setActor] = useState('');
  const actors = [...new Map(logs.map((log) => [log.actor_id, log.actor_name])).entries()];
  const shown = logs.filter((log) => (!action || log.action === action) && (!actor || log.actor_id === actor));

  if (status === 'pending') return <Loading />;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-xs text-slate-400">
          Action
          <Select value={action} onChange={(e) => setAction(e.target.value)}>
            <option value="">All actions</option>
            {Object.entries(ACTION_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </Select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-slate-400">
          Performed by
          <Select value={actor} onChange={(e) => setActor(e.target.value)}>
            <option value="">All users</option>
            {actors.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </Select>
        </label>
      </div>
      {shown.length === 0 ? (
        <p className="text-sm text-slate-400">No audit entries.</p>
      ) : (
        <Table columns={['Action', 'What', 'Performed by', 'When']}>
          {shown.map((log) => (
            <Tr key={log._id}>
              <Td><Badge>{ACTION_LABELS[log.action] ?? log.action}</Badge></Td>
              <Td className="text-slate-300">{log.detail}</Td>
              <Td className="text-slate-300">{log.actor_name}</Td>
              <Td className="text-slate-400">{formatDateTime(log.created_at)}</Td>
            </Tr>
          ))}
        </Table>
      )}
    </div>
  );
}

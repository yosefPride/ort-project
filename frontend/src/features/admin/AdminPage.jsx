import { useState } from 'react';
import AuditLogPanel from './AuditLogPanel';
import TeamsPanel from './TeamsPanel';
import UsersPanel from './UsersPanel';

const TABS = [
  { id: 'users', label: 'Users' },
  { id: 'teams', label: 'Teams' },
  { id: 'audit', label: 'Audit Log' },
];

export default function AdminPage({ me }) {
  const [tab, setTab] = useState('users');
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-white">Admin</h1>
      <div className="flex gap-2 border-b border-white/10">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`-mb-px rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${tab === id ? 'border-b-2 border-white text-white' : 'text-gray-400 hover:text-white'}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div>
        {tab === 'users' && <UsersPanel me={me} />}
        {tab === 'teams' && <TeamsPanel />}
        {tab === 'audit' && <AuditLogPanel />}
      </div>
    </section>
  );
}

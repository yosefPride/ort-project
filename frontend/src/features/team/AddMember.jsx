import { useState } from 'react';
import { api } from '../../api';
import Button from '../../components/ui/Button';
import ErrorText from '../../components/ui/ErrorText';
import Input from '../../components/ui/Input';
import { useSend } from '../../hooks/useSend';
import { roleLabel } from '../../utils/labels';

// Two steps: find the account by its exact email, then add it with a role.
export default function AddMember({ teamId }) {
  const [email, setEmail] = useState('');
  const [found, setFound] = useState(null);
  const [lookupError, setLookupError] = useState(null);
  const add = useSend(`/teams/${teamId}`, '/teams');

  function find(e) {
    e.preventDefault();
    setFound(null);
    setLookupError(null);
    add.reset();
    api(`/teams/${teamId}/users/lookup?email=${encodeURIComponent(email)}`).then(setFound, setLookupError);
  }

  function addAs(role) {
    add.mutate({ path: `/teams/${teamId}/members`, body: { email: found.email, role } }, { onSuccess: () => { setFound(null); setEmail(''); } });
  }

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={find} className="flex gap-2">
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Exact email address" required className="flex-1" />
        <Button type="submit" disabled={add.isPending}>Find</Button>
      </form>
      <ErrorText error={lookupError ?? add.error} />
      {found && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{found.name}</p>
            <p className="truncate text-xs text-slate-400">{found.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['contributor', 'admin'].map((role) => (
              <Button key={role} variant="ghost" size="sm" disabled={add.isPending} onClick={() => addAs(role)} className="border border-white/10">
                Add as {roleLabel(role)}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

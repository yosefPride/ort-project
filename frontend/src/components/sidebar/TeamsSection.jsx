import { useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';
import CreateTeamForm from '../../features/team/CreateTeamForm';
import { useGet } from '../../hooks/useGet';
import Modal from '../ui/Modal';
import Chevron from './Chevron';
import { SidebarContext } from './SidebarContext';
import { rowClasses } from './rowClasses';

export default function TeamsSection() {
  const { collapsed, expand, onNavigate } = useContext(SidebarContext);
  const [isOpen, setIsOpen] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const { data: teams = [], status } = useGet('/teams');

  if (collapsed) {
    return (
      <button type="button" onClick={expand} title="Teams" className={`${rowClasses(true, false)} w-full`}>
        <Users className="h-4 w-4 shrink-0" />
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center">
        <button type="button" onClick={() => setIsOpen(!isOpen)} className={`${rowClasses(false, false)} grow`}>
          <Users className="h-4 w-4 shrink-0" /> Teams <Chevron isOpen={isOpen} />
        </button>
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          title="Create Team"
          aria-label="Create Team"
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/5 hover:text-white"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <Modal isOpen={isCreating} onClose={() => setIsCreating(false)} title="Create a team">
        <CreateTeamForm onCreated={() => { setIsCreating(false); setIsOpen(true); }} />
      </Modal>

      {isOpen && (
        <div className="flex flex-col gap-1 pl-4">
          {status === 'pending' && <p className="px-3 py-2 text-xs text-slate-500">Loading…</p>}
          {status === 'error' && <p className="px-3 py-2 text-xs text-red-500">Couldn't load teams.</p>}
          {status === 'success' && teams.length === 0 && <p className="px-3 py-2 text-xs text-slate-500">No teams yet.</p>}
          {teams.map((team) => (
            <NavLink key={team._id} to={`/teams/${team._id}`} onClick={onNavigate} className={({ isActive }) => rowClasses(false, isActive)}>
              {({ isActive }) => (
                <>
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${isActive ? 'bg-sky-400' : 'bg-white/20'}`} />
                  <span className="truncate">{team.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

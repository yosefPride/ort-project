import { useContext, useState } from 'react';
import { CircleUser, LogOut, Shield, User } from 'lucide-react';
import { api } from '../../api';
import Chevron from './Chevron';
import NavItem from './NavItem';
import { SidebarContext } from './SidebarContext';
import { rowClasses } from './rowClasses';

// The user's name; clicking it opens Account / Admin / Log out right below.
export default function UserSection({ me }) {
  const { collapsed, expand } = useContext(SidebarContext);
  const [isOpen, setIsOpen] = useState(false);

  async function logout() {
    await api('/auth/logout', { method: 'POST' });
    window.location.assign('/login'); // a full reload clears all cached data
  }

  function toggle() {
    if (collapsed) expand();
    setIsOpen(collapsed || !isOpen);
  }

  return (
    <div className="flex flex-col gap-1">
      <button type="button" onClick={toggle} title={collapsed ? me.name : undefined} className={`${rowClasses(collapsed, false)} w-full`}>
        <CircleUser className="h-5 w-5 shrink-0" strokeWidth={1.5} />
        {!collapsed && (
          <>
            <span className="truncate text-white">{me.name}</span>
            <Chevron isOpen={isOpen} />
          </>
        )}
      </button>
      {isOpen && !collapsed && (
        <div className="flex flex-col gap-1 pl-4">
          <NavItem to="/account" label="Account" icon={User} />
          {me.is_admin && <NavItem to="/admin" label="Admin" icon={Shield} />}
          <button type="button" onClick={logout} className={`${rowClasses(false, false)} w-full`}>
            <LogOut className="h-4 w-4 shrink-0" /> Log out
          </button>
        </div>
      )}
    </div>
  );
}

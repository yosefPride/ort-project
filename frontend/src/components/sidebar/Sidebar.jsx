import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, PanelLeftClose, PanelLeftOpen, Ticket } from 'lucide-react';
import logo from '../../assets/brand-mark.svg';
import NavItem from './NavItem';
import { SidebarContext } from './SidebarContext';
import TeamsSection from './TeamsSection';
import UserSection from './UserSection';

const STORAGE_KEY = 'sidebar:collapsed';

// `collapsible` is off in the mobile drawer. The collapsed state is remembered in localStorage.
export default function Sidebar({ me, className = '', collapsible = true, onNavigate = () => {} }) {
  const [stored, setStored] = useState(() => localStorage.getItem(STORAGE_KEY) === 'true');
  const collapsed = collapsible && stored;

  function setCollapsed(next) {
    setStored(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  }

  return (
    <SidebarContext.Provider value={{ collapsed, expand: () => setCollapsed(false), onNavigate }}>
      <aside className={`${className} h-screen shrink-0 flex-col gap-4 border-r border-white/10 bg-black p-3 transition-[width] duration-200 ${collapsed ? 'w-16' : 'w-64'}`}>
        <div className={`flex gap-2 ${collapsed ? 'flex-col items-center' : 'items-center justify-between px-1'}`}>
          <Link to="/dashboard" className="group flex items-center">
            <img src={logo} alt="Resolve" className="h-5 w-auto object-contain transition-all duration-200 group-hover:drop-shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
          </Link>
          {collapsible && (
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/5 hover:text-white"
            >
              {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
            </button>
          )}
        </div>

        <UserSection me={me} />

        <nav className="flex flex-col gap-1">
          <NavItem to="/dashboard" label="Dashboard" icon={LayoutDashboard} />
          <NavItem to="/issues" label="Issues" icon={Ticket} />
          <TeamsSection />
        </nav>
      </aside>
    </SidebarContext.Provider>
  );
}

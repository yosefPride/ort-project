import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import logo from '../assets/brand-logo.svg';
import Sidebar from './sidebar/Sidebar';

// Frame around every signed-in page: the sidebar docked on the left from `md`
// up, and as a slide-in drawer (opened from a top bar) on small screens.
export default function AppLayout({ me, children }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar me={me} className="sticky top-0 hidden md:flex" />

      {isDrawerOpen && (
        <>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close navigation"
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
          />
          <Sidebar me={me} className="fixed inset-y-0 left-0 z-50 flex md:hidden" collapsible={false} onNavigate={closeDrawer} />
        </>
      )}

      <div className="flex min-w-0 grow flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/10 bg-black px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open navigation"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition-all duration-200 hover:border-sky-400/50 hover:text-sky-300 hover:ring-2 hover:ring-sky-500/20"
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link to="/dashboard" className="flex items-center">
            <img src={logo} alt="Resolve" className="h-7 w-auto object-contain" />
          </Link>
        </header>

        {/* Every page renders inside one framed panel; pages only supply their content. */}
        <main className="flex grow flex-col p-0 sm:p-6">
          <div className="flex grow flex-col rounded-2xl border border-white/10 bg-white/2 p-6 sm:p-8">
            {children ?? <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}

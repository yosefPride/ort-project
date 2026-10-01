import { Link } from 'react-router-dom';
import logo from '../../assets/brand-logo.svg';
import Button from '../../components/ui/Button';

// Placeholder landing page: the floating header and the hero text, nothing else yet.
export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-black">
      <header className="fixed inset-x-0 top-4 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 backdrop-blur-xl sm:px-6">
            <Link to="/" className="group flex items-center">
              <img src={logo} alt="Resolve" className="h-6 w-auto object-contain transition-all duration-200 group-hover:drop-shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
            </Link>
            <div className="flex items-center gap-2">
              <Button to="/login" variant="ghost">Log in</Button>
              <Button to="/register">Sign up</Button>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto flex h-screen max-w-3xl items-center px-4 text-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">Built for teams that solve real problems</h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-slate-400 sm:text-lg">
            Resolve brings your team, issues, and work together in one place—with powerful collaboration, streamlined team management, and AI-powered assistance.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button to="/register" size="lg">Get started</Button>
            <Button to="/login" variant="ghost" size="lg" className="border border-white/10">Log in</Button>
          </div>
        </div>
      </section>
    </div>
  );
}

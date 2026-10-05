import { Link } from 'react-router-dom';
import logo from '../../assets/brand-logo.svg';
import Button from '../../components/ui/Button';

export default function Header() {
    {/* Trying a full-width bar with only a bottom border. The floating version was: header `top-4`, no
          bg/blur/border on it, and the inner row `h-14 rounded-lg border border-white/10 bg-white/5 px-4 backdrop-blur-xl sm:px-6`. */}
    return (
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-18 items-center justify-between">
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
    )
}

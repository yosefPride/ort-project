import { Link } from 'react-router-dom';
import logo from '../assets/brand-logo.svg';
import Button from '../components/ui/Button';
import FeatureShowcase from '../features/landing/FeatureShowcase';
import FinalCta from '../features/landing/FinalCta';
import Footer from '../features/landing/Footer';
import WorkflowTimeline from '../features/landing/WorkflowTimeline';

// The public landing page: header, hero with the demo video, feature cards, workflow steps, final call to action, footer.
export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-black">
      {/* Trying a full-width bar with only a bottom border. The floating version was: header `top-4`, no
          bg/blur/border on it, and the inner row `h-14 rounded-lg border border-white/10 bg-white/5 px-4 backdrop-blur-xl sm:px-6`. */}
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

      <section className="mx-auto flex w-full max-w-7xl flex-col items-center px-4 pb-24 pt-36 text-center sm:px-6 sm:pt-44 lg:px-8">
        <div className="max-w-3xl lg:max-w-4xl">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            <span className="md:block md:whitespace-nowrap">The complete workspace for</span> issue management
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-white sm:text-lg lg:max-w-none lg:whitespace-nowrap">
            Track issues, collaborate, and get more done with AI.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button to="/register" size="lg">Get started</Button>
            <Button to="/login" variant="ghost" size="lg" className="border border-white/10">Log in</Button>
          </div>
        </div>

        {/* Silent product demo loop, fading out over its bottom 40%. The poster stands in when motion is reduced. */}
        <div className="relative mt-16 aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-surface shadow-2xl shadow-black/50 mask-b-from-60% sm:mt-20">
          <video src="/hero.mp4" poster="/hero-poster.jpg" autoPlay muted loop playsInline aria-hidden className="h-full w-full motion-reduce:hidden" />
          <img src="/hero-poster.jpg" alt="The Resolve dashboard" className="hidden h-full w-full motion-reduce:block" />
        </div>
      </section>

      <FeatureShowcase />
      <WorkflowTimeline />
      <FinalCta />
      <Footer />
    </div>
  );
}

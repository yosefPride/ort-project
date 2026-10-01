import { useInView } from '../../hooks/useInView';
import AiChatArt from './art/AiChatArt';
import TeamGlanceArt from './art/TeamGlanceArt';
import ThreadArt from './art/ThreadArt';

const ITEMS = [
  {
    Art: TeamGlanceArt,
    title: 'One view of every team',
    description: "Open issues, what's critical, what's assigned to you and what changed recently, across every team you're in.",
  },
  {
    Art: AiChatArt,
    title: 'An AI assistant on every issue',
    description: 'Ask about any issue in a private chat. One click gets a summary, or an analysis of severity and type with a suggested fix.',
  },
  {
    Art: ThreadArt,
    title: 'Talk it through, then close it out',
    description: "A chat-style thread on every issue. Set a priority, pick an owner, discuss it with your team, and close it when it's done.",
  },
];

// The three cards under the hero video. Same look and animations as the original Resolve landing page.
export default function FeatureShowcase() {
  return (
    <section className="border-t border-white/10 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="max-w-3xl text-2xl font-medium tracking-tight text-balance text-white sm:text-3xl">
          Every team's issues, the conversation around them, and an assistant that's read them, in one place.
        </p>
        <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
          {ITEMS.map((item) => <FeatureCard key={item.title} {...item} />)}
        </div>
      </div>
    </section>
  );
}

// The art loops, so it only starts once the card has scrolled into view.
function FeatureCard({ Art, title, description }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} data-showcase-art className="relative flex aspect-square flex-col overflow-hidden p-6 text-white lg:aspect-5/6">
      {/* Open frame: full-width top and bottom rules, short stubs down each corner. */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/25" />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/25" />
      <span className="pointer-events-none absolute left-0 top-0 h-20 w-px bg-white/25" />
      <span className="pointer-events-none absolute right-0 top-0 h-20 w-px bg-white/25" />
      <span className="pointer-events-none absolute bottom-0 left-0 h-20 w-px bg-white/25" />
      <span className="pointer-events-none absolute bottom-0 right-0 h-20 w-px bg-white/25" />

      {/* min-h-0 lets the art shrink to what the text leaves it. */}
      <div className="min-h-0 grow"><Art active={inView} /></div>
      <h3 className="mt-5 text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </div>
  );
}

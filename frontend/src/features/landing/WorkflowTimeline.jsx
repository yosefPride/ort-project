// The life of an issue in four steps, after the feature cards. Same layout as the original Resolve landing page.
const STEPS = [
  {
    title: 'Report',
    description: 'Anyone on the team files an issue with a title, a Markdown description and a priority.',
  },
  {
    title: 'Triage',
    description: "Ask the AI to analyze it: a predicted severity, a category and a suggested fix. It's advice, not a decision.",
  },
  {
    title: 'Discuss & assign',
    description: 'The team comments, reacts, updates the status and assigns the issue to someone.',
  },
  {
    title: 'Resolve',
    description: "The issue closes and stays in the team's list with its whole thread, for future reference.",
  },
];

export default function WorkflowTimeline() {
  return (
    <section className="border-t border-white/10 bg-white/2 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl text-left">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">From issue report to resolution</h2>
          <p className="mt-4 text-base text-slate-400">One workflow, scoped to your team, from the first report to the final fix.</p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative">
              {/* Connector from this circle to the next one, only when the steps sit in one row.
                  It starts after the 2.5rem circle and spans the column plus the 1.5rem gap. */}
              {i < STEPS.length - 1 && (
                <div aria-hidden className="absolute left-10 top-5 hidden h-px w-[calc(100%-1rem)] bg-linear-to-r from-gray-100/40 to-gray-100/10 lg:block" />
              )}
              <div className="relative flex items-center gap-3 lg:flex-col lg:items-start lg:gap-0">
                <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-100/40 bg-neutral-950 text-sm font-semibold text-gray-300 shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)]">
                  {i + 1}
                </span>
                <h3 className="text-base font-semibold text-white lg:mt-4">{step.title}</h3>
              </div>
              <p className="mt-2 text-sm text-slate-400">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

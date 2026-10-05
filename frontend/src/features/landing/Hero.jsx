import Button from '../../components/ui/Button';

export default function Hero() {
    return (
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

        {/* Silent product demo loop. The poster stands in when motion is reduced. */}
        {/* Bottom fade, disabled for now: add `mask-b-from-60%` back to the className below to fade out the bottom 40%. for the border: `border border-white/10` */}
        <div className="relative mt-16 aspect-video w-full overflow-hidden rounded-xl bg-surface shadow-2xl shadow-black/50 sm:mt-20">
          <video src="/hero.mp4" poster="/hero-poster.jpg" autoPlay muted loop playsInline aria-hidden className="h-full w-full motion-reduce:hidden" />
          <img src="/hero-poster.jpg" alt="The Resolve dashboard" className="hidden h-full w-full motion-reduce:block" />
        </div>
      </section>
    )
}
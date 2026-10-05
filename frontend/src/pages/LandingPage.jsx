import Header from '../features/landing/Header';
import Hero from '../features/landing/Hero';
import FeatureShowcase from '../features/landing/FeatureShowcase';
import WorkflowTimeline from '../features/landing/WorkflowTimeline';
import FinalCta from '../features/landing/FinalCta';
import Footer from '../features/landing/Footer';

// The public landing page: header, hero with the demo video, feature cards, workflow steps, final call to action, footer.
export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-black">
      <Header />
      <Hero />
      <FeatureShowcase />
      <WorkflowTimeline />
      <FinalCta />
      <Footer />
    </div>
  );
}

import AppLayout from '../components/AppLayout';
import Button from '../components/ui/Button';

// Signed-in visitors see it inside the normal app frame; everyone else on plain black.
export default function NotFound({ me }) {
  const message = (
    <section className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-20 text-center sm:px-6 lg:px-8">
      <p className="text-[7rem] font-medium text-red-700">404</p>
      <h1 className="text-2xl font-bold text-white">Page not found</h1>
      <p className="text-sm text-slate-400">That page doesn't exist, or it may have moved.</p>
      <Button to={me ? '/dashboard' : '/'} className="mt-2">{me ? 'Go to dashboard' : 'Back home'}</Button>
    </section>
  );
  return me ? <AppLayout me={me}>{message}</AppLayout> : <div className="flex min-h-screen flex-col bg-black">{message}</div>;
}

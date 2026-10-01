import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import Button from '../../components/ui/Button';
import ErrorText from '../../components/ui/ErrorText';
import Field from '../../components/ui/Field';
import Input from '../../components/ui/Input';
import { useForm } from '../../hooks/useForm';
import { useSend } from '../../hooks/useSend';

// "Log in" and "Create your account" share this page; `mode` picks which one.
export default function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const navigate = useNavigate();
  const [form, bind] = useForm({ name: '', email: '', password: '' });
  const queryClient = useQueryClient();
  const send = useSend();

  function submit(e) {
    e.preventDefault();
    // The response is the signed-in user: store it as "/auth/me" so App knows right away.
    send.mutate({ path: `/auth/${mode}`, body: form }, {
      onSuccess: (user) => {
        queryClient.setQueryData(['auth', 'me'], user);
        navigate('/dashboard');
      },
    });
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-black px-4 py-12 sm:px-6 lg:px-8">
      <section className="flex w-full max-w-md flex-col gap-6">
        <h1 className="text-center text-2xl font-bold text-white">{isRegister ? 'Create your account' : 'Log in'}</h1>
        <form onSubmit={submit} className="flex flex-col gap-4">
          {isRegister && <Field label="Name"><Input {...bind('name')} required /></Field>}
          <Field label="Email"><Input type="email" {...bind('email')} required /></Field>
          <Field label="Password"><Input type="password" {...bind('password')} required /></Field>
          <ErrorText error={send.error} />
          <Button type="submit" disabled={send.isPending} className="mt-2">
            {isRegister ? (send.isPending ? 'Creating account…' : 'Sign up') : send.isPending ? 'Logging in…' : 'Log in'}
          </Button>
        </form>
      </section>
    </div>
  );
}

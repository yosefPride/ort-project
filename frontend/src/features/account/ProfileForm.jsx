import Button from '../../components/ui/Button';
import ErrorText from '../../components/ui/ErrorText';
import Field from '../../components/ui/Field';
import Input from '../../components/ui/Input';
import { useForm } from '../../hooks/useForm';
import { useSend } from '../../hooks/useSend';
import AccountCard from './AccountCard';

export default function ProfileForm({ me }) {
  const [form, bind, setForm] = useForm({ name: me.name, email: me.email, current_password: '' });
  const save = useSend('/auth/me');
  const emailChanged = form.email.trim() !== me.email;
  const isDirty = form.name.trim() !== me.name || emailChanged;

  function submit(e) {
    e.preventDefault();
    save.mutate({ path: '/me', method: 'PATCH', body: form }, { onSuccess: (user) => setForm({ ...user, current_password: '' }) });
  }

  return (
    <AccountCard title="Profile" subtitle="Update your name and email address.">
      <form onSubmit={submit} className="mt-4 flex flex-col gap-4">
        <Field label="Name"><Input {...bind('name')} required /></Field>
        <Field label="Email"><Input type="email" {...bind('email')} required /></Field>
        {emailChanged && (
          <Field label="Current password">
            <Input type="password" {...bind('current_password')} required autoComplete="current-password" />
            <span className="text-xs text-slate-400">Required to change your email.</span>
          </Field>
        )}
        <ErrorText error={save.error} />
        {save.isSuccess && !isDirty && <p className="text-sm text-green-400">Profile updated.</p>}
        <Button type="submit" disabled={save.isPending || !isDirty} className="mt-2 self-start">{save.isPending ? 'Saving…' : 'Save changes'}</Button>
      </form>
    </AccountCard>
  );
}

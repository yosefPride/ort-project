import { useState } from 'react';
import Button from '../../components/ui/Button';
import ErrorText from '../../components/ui/ErrorText';
import Field from '../../components/ui/Field';
import Input from '../../components/ui/Input';
import { useForm } from '../../hooks/useForm';
import { useSend } from '../../hooks/useSend';
import AccountCard from './AccountCard';

const EMPTY_PASSWORDS = { current_password: '', new_password: '', confirm: '' };

export default function PasswordForm() {
  const [form, bind, setForm] = useForm(EMPTY_PASSWORDS);
  const [mismatch, setMismatch] = useState(false);
  const save = useSend();

  function submit(e) {
    e.preventDefault();
    setMismatch(form.confirm !== form.new_password);
    if (form.confirm !== form.new_password) return;
    save.mutate({ path: '/me/password', method: 'PUT', body: form }, { onSuccess: () => setForm(EMPTY_PASSWORDS) });
  }

  return (
    <AccountCard title="Password" subtitle="Changing your password signs you out on all other devices.">
      <form onSubmit={submit} className="mt-4 flex flex-col gap-4">
        <Field label="Current password"><Input type="password" {...bind('current_password')} required autoComplete="current-password" /></Field>
        <Field label="New password"><Input type="password" {...bind('new_password')} required minLength={8} autoComplete="new-password" /></Field>
        <Field label="Confirm new password" error={mismatch && 'Passwords do not match.'}>
          <Input type="password" {...bind('confirm')} required autoComplete="new-password" />
        </Field>
        <ErrorText error={save.error} />
        {save.isSuccess && <p className="text-sm text-green-400">Password changed. Other devices have been signed out.</p>}
        <Button type="submit" disabled={save.isPending} className="mt-2 self-start">{save.isPending ? 'Changing…' : 'Change password'}</Button>
      </form>
    </AccountCard>
  );
}

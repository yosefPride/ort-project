import Button from '../../components/ui/Button';
import ErrorText from '../../components/ui/ErrorText';
import Field from '../../components/ui/Field';
import Input from '../../components/ui/Input';
import { useForm } from '../../hooks/useForm';
import { useSend } from '../../hooks/useSend';

export default function CreateTeamForm({ onCreated }) {
  const [form, bind] = useForm({ name: '' });
  const send = useSend('/teams');

  function submit(e) {
    e.preventDefault();
    send.mutate({ path: '/teams', body: form }, { onSuccess: onCreated });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field label="Team name"><Input {...bind('name')} required /></Field>
      <ErrorText error={send.error} />
      <Button type="submit" disabled={send.isPending} className="mt-2">{send.isPending ? 'Creating…' : 'Create team'}</Button>
    </form>
  );
}

import Button from '../../components/ui/Button';
import ErrorText from '../../components/ui/ErrorText';
import Field from '../../components/ui/Field';
import Input from '../../components/ui/Input';
import { useForm } from '../../hooks/useForm';
import { useSend } from '../../hooks/useSend';

export default function RenameTeamForm({ team, onDone }) {
  const [form, bind] = useForm({ name: team.name });
  const rename = useSend('/teams');
  const unchanged = !form.name.trim() || form.name.trim() === team.name;

  function submit(e) {
    e.preventDefault();
    rename.mutate({ path: `/teams/${team._id}`, method: 'PATCH', body: form }, { onSuccess: onDone });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field label="Team name"><Input {...bind('name')} required autoFocus /></Field>
      <ErrorText error={rename.error} />
      <Button type="submit" disabled={rename.isPending || unchanged} className="mt-2">{rename.isPending ? 'Saving…' : 'Save'}</Button>
    </form>
  );
}

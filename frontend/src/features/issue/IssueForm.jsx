import Button from '../../components/ui/Button';
import ErrorText from '../../components/ui/ErrorText';
import Field from '../../components/ui/Field';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import { useForm } from '../../hooks/useForm';
import { useMembers } from '../../hooks/useMembers';
import { useSend } from '../../hooks/useSend';

// Creates an issue, or edits `issue` when one is given (then Status and Cancel appear too).
export default function IssueForm({ teamId, issue, onDone, onCancel }) {
  const { members } = useMembers(teamId);
  const [form, bind] = useForm({
    title: issue?.title ?? '',
    description: issue?.description ?? '',
    priority: issue?.priority ?? 'low',
    status: issue?.status ?? 'open',
    assignee_id: issue?.assignee_id ?? '',
  });
  const send = useSend('/teams');

  function submit(e) {
    e.preventDefault();
    const path = issue ? `/teams/${teamId}/issues/${issue._id}` : `/teams/${teamId}/issues`;
    const body = { ...form, assignee_id: form.assignee_id || null };
    send.mutate({ path, method: issue ? 'PUT' : 'POST', body }, { onSuccess: onDone });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field label="Title"><Input {...bind('title')} required maxLength={200} /></Field>
      <Field label="Description">
        {!issue && <span className="text-xs text-slate-500">Markdown is supported.</span>}
        <Textarea {...bind('description')} required rows={4} />
      </Field>
      <Field label="Priority">
        <Select {...bind('priority')}>
          <option value="low">Low</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </Select>
      </Field>
      {issue && (
        <Field label="Status">
          <Select {...bind('status')}>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </Select>
        </Field>
      )}
      <Field label="Assignee">
        <Select {...bind('assignee_id')}>
          <option value="">Unassigned</option>
          {members.map((member) => <option key={member._id} value={member._id}>{member.name}</option>)}
        </Select>
      </Field>
      <ErrorText error={send.error} />
      {issue ? (
        <div className="mt-2 flex justify-end gap-3">
          <Button variant="ghost" disabled={send.isPending} onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={send.isPending}>{send.isPending ? 'Saving…' : 'Save changes'}</Button>
        </div>
      ) : (
        <Button type="submit" disabled={send.isPending} className="mt-2">{send.isPending ? 'Creating…' : 'Create issue'}</Button>
      )}
    </form>
  );
}

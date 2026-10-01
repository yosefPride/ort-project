import Input from '../../components/ui/Input';
import Loading from '../../components/ui/Loading';
import Select from '../../components/ui/Select';
import { useForm } from '../../hooks/useForm';
import { useGet } from '../../hooks/useGet';
import { useMembers } from '../../hooks/useMembers';
import IssueCard from './IssueCard';

// The backend sends all of the team's issues (oldest first); filtering happens here.
export default function IssueList({ teamId }) {
  const { data: issues = [], status } = useGet(`/teams/${teamId}/issues`);
  const { members, nameOf } = useMembers(teamId);
  const [filters, bind] = useForm({ search: '', status: '', priority: '', creator: '' });

  const shown = issues.filter(
    (issue) =>
      issue.title.toLowerCase().includes(filters.search.trim().toLowerCase()) &&
      (!filters.status || issue.status === filters.status) &&
      (!filters.priority || issue.priority === filters.priority) &&
      (!filters.creator || issue.creator_id === filters.creator),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <Input type="search" {...bind('search')} placeholder="Search by title" aria-label="Search issues" className="flex-1 text-sm sm:max-w-xs" />
        <Select {...bind('status')} aria-label="Filter by status">
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </Select>
        <Select {...bind('priority')} aria-label="Filter by priority">
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </Select>
        <Select {...bind('creator')} aria-label="Filter by creator">
          <option value="">Everyone</option>
          {members.map((member) => <option key={member._id} value={member._id}>{member.name}</option>)}
        </Select>
      </div>

      {status === 'pending' && <Loading />}
      {status === 'error' && <p className="text-sm text-red-500">Failed to load issues.</p>}
      {status === 'success' && shown.length === 0 && <p className="text-sm text-slate-400">No issues match these filters.</p>}
      <div className="flex flex-col gap-2">
        {shown.map((issue) => <IssueCard key={issue._id} issue={issue} meta={nameOf(issue.creator_id)} />)}
      </div>
    </div>
  );
}

import { useState } from 'react';
import Field from '../../components/ui/Field';
import Select from '../../components/ui/Select';
import IssueForm from '../issue/IssueForm';

// "New issue" from the dashboard first asks which team it's for.
export default function NewIssueForm({ teams, onDone }) {
  const [teamId, setTeamId] = useState(teams.length === 1 ? teams[0]._id : '');
  return (
    <div className="flex flex-col gap-4">
      <Field label="Team">
        <Select value={teamId} onChange={(e) => setTeamId(e.target.value)}>
          <option value="" disabled>Select a team</option>
          {teams.map((team) => <option key={team._id} value={team._id}>{team.name}</option>)}
        </Select>
      </Field>
      {teamId && <IssueForm key={teamId} teamId={teamId} onDone={onDone} />}
    </div>
  );
}

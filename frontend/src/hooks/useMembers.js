import { useGet } from './useGet';

export function useMembers(teamId) {
  const { data: members = [] } = useGet(`/teams/${teamId}/members`);
  const nameOf = (userId) => members.find((member) => member._id === userId)?.name ?? 'Former member';
  return { members, nameOf };
}

import { useGet } from './useGet';

// A team from the GET /teams list (which also includes the user's role in it).
export const useTeam = (teamId) => useGet('/teams').data?.find((team) => team._id === teamId);

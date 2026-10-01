import { useMutation } from '@tanstack/react-query';
import { api } from '../api';
import { useRefresh } from './useRefresh';

// Changes data: send.mutate({ path, method, body }). When it succeeds, the
// `refresh` paths are loaded again so the page shows the new state. (Returning
// that promise makes mutate()'s own onSuccess wait for the fresh data.)
export function useSend(...refresh) {
  const reload = useRefresh();
  return useMutation({
    mutationFn: ({ path, method = 'POST', body }) => api(path, { method, body }),
    onSuccess: () => reload(...refresh),
  });
}

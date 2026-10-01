import { useQueryClient } from '@tanstack/react-query';
import { keyOf } from '../api';

// Loads the given paths again (and everything nested under them).
export function useRefresh() {
  const queryClient = useQueryClient();
  return (...paths) => Promise.all(paths.map((path) => queryClient.invalidateQueries({ queryKey: keyOf(path) })));
}

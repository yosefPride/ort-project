import { useQuery } from '@tanstack/react-query';
import { api, keyOf } from '../api';

// Loads data from a GET endpoint (cached and shared between components).
export const useGet = (path, options) => useQuery({ queryKey: keyOf(path), queryFn: () => api(path), ...options });

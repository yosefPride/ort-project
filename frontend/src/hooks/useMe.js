import { useGet } from './useGet';

// The signed-in user (null when signed out).
export const useMe = () => useGet('/auth/me').data;

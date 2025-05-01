import type { UserState } from './types';

export const state = (): UserState => ({
  currentUser: null,
  isAuthenticated: false,
  token: null,
  loading: false,
  error: null
});
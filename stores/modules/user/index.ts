import { defineStore } from 'pinia';
import { actions } from './actions';
import type { UserState } from './types';

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    currentUser: null,
    isAuthenticated: false,
    token: null,
    loading: false,
    error: null
  }),

  actions,

  getters: {
    // Add any getters you might need
    isAdmin: (state) => state.currentUser?.role === 'admin',
    userName: (state) => state.currentUser?.name || '',
    userEmail: (state) => state.currentUser?.email || '',
    userAvatar: (state) => state.currentUser?.avatar || '',
  },

  persist: {
    key: 'user',
    paths: ['currentUser', 'isAuthenticated', 'token'],
  }
});
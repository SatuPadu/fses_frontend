// composables/auth.ts
import { defineStore } from 'pinia';
import { useStorage } from '@vueuse/core';
import type { User, Role, LoginResponse, FetchUserResponse, Permissions } from '~/types/auth';
import { useRouter } from 'vue-router'; // Import useRouter

const API_BASE_URL = import.meta.env.API_BASE_URL || '';

export const useAuthStore = defineStore('auth', () => {
  // State
  const authToken = useStorage<string | null>('authToken', null);
  const user = useStorage<User | null>('user', null); // Persist the user
  const roles = useStorage<Role[]>('roles', []);    // Persist the roles
  const isAuthenticated = computed<boolean>(() => !!authToken.value);
  const router = useRouter(); // Get the router instance

  // Custom $fetch instance with automatic token injection
  const apiFetch = $fetch.create({
    baseURL: API_BASE_URL,
    onRequest({ options }) {
      const token = authToken.value;
      if (token) {
        const authHeader = `Bearer ${token}`;
        if (options.headers instanceof Headers) {
          options.headers.set('Authorization', authHeader);
        } else {
          const headers = new Headers(options.headers);
          headers.set('Authorization', authHeader);
        }
      }
    },
  });

  // Actions
  async function login(credentials: Record<string, string>): Promise<boolean> {
    try {
      const response = await apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        body: credentials,
      });

      if (response.success) {
        authToken.value = response.data.access_token;
        user.value = response.data.user;
        roles.value = response.data.roles.map(role => ({
          ...role,
          permissions: role.permissions as Permissions,
        }));
        return true;
      } else {
        console.error('Login failed:', response.message);
        authToken.value = null;
        user.value = null;
        roles.value = [];
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      authToken.value = null;
      user.value = null;
      roles.value = [];
      return false;
    }
  }

  async function logout(): Promise<void> {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } finally {
      authToken.value = null;
      user.value = null;
      roles.value = [];
      router.push('/auth/login'); // Use router.push
    }
  }

  async function fetchUser(): Promise<void> {
    if (authToken.value) {
      try {
        const response = await apiFetch<FetchUserResponse>('/auth/auth-user');

        if (response.success && response.data) {
          user.value = response.data;
        } else {
          console.error('Failed to fetch user:', response.message);
          authToken.value = null;
          user.value = null;
          roles.value = [];
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        authToken.value = null;
        user.value = null;
        roles.value = [];
      }
    }
  }

  // Initialization:  Call this in a plugin or middleware, before the app renders.
  const initializeAuth = async () => {
    if (authToken.value) {
      await fetchUser();
    }
  };

  return {
    authToken,
    user,
    roles,
    isAuthenticated,
    login,
    logout,
    fetchUser,
    initializeAuth
  };
});

export const useAuth = () => useAuthStore();

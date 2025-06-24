import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { usePermissionsStore } from './permissions';

export interface User {
  id: number;
  name: string;
  email: string;
  roles: any[];
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const isAuthenticated = ref(false);
  const loading = ref(false);

  // Getters
  const getUser = computed(() => user.value);
  const getToken = computed(() => token.value);
  const getIsAuthenticated = computed(() => isAuthenticated.value);
  const getIsLoading = computed(() => loading.value);

  // Actions
  const setUser = (userData: User) => {
    user.value = userData;
    isAuthenticated.value = true;
    
    // Initialize permissions
    const permissionsStore = usePermissionsStore();
    permissionsStore.initializeFromLoginData({ user: userData });
  };

  const setToken = (authToken: string) => {
    token.value = authToken;
  };

  const login = (loginData: { user: User; token: string }) => {
    setUser(loginData.user);
    setToken(loginData.token);
    
    // Store token in localStorage
    if (process.client) {
      localStorage.setItem('auth_token', loginData.token);
    }
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    isAuthenticated.value = false;
    
    // Clear permissions
    const permissionsStore = usePermissionsStore();
    permissionsStore.clearPermissions();
    
    // Remove token from localStorage
    if (process.client) {
      localStorage.removeItem('auth_token');
    }
  };

  const initializeAuth = () => {
    if (process.client) {
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken) {
        token.value = storedToken;
        // You might want to validate the token here
        // For now, we'll assume it's valid
        isAuthenticated.value = true;
      }
    }
  };

  return {
    // State
    user,
    token,
    isAuthenticated,
    loading,

    // Getters
    getUser,
    getToken,
    getIsAuthenticated,
    getIsLoading,

    // Actions
    setUser,
    setToken,
    login,
    logout,
    initializeAuth,
  };
}); 
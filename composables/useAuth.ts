import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  User,
  Role,
  LoginCredentials,
  PasswordChangePayload,
  LoginResponse,
  FetchUserResponse,
  ApiResponse,
  TokenResponse,
  Permissions,
  AuthState,
} from '@/types/auth';

// Create a persistent storage composable
const useAuthStorage = () => {
  const storageAvailable = process.client && typeof localStorage !== 'undefined';

  const getStoredAuth = (): AuthState => {
    if (!storageAvailable) return { token: null, user: null, roles: [] };

    try {
      const authData = localStorage.getItem('auth_state');
      if (authData) {
        return JSON.parse(authData);
      }
    } catch (e) {
      console.error('Error reading auth state from localStorage:', e);
    }

    return { token: null, user: null, roles: [] };
  };

  const setStoredAuth = (authState: AuthState): void => {
    if (!storageAvailable) return;

    try {
      localStorage.setItem('auth_state', JSON.stringify(authState));
    } catch (e) {
      console.error('Error writing auth state to localStorage:', e);
    }
  };

  const clearStoredAuth = (): void => {
    if (!storageAvailable) return;

    try {
      localStorage.removeItem('auth_state');
    } catch (e) {
      console.error('Error clearing auth state from localStorage:', e);
    }
  };

  return {
    getStoredAuth,
    setStoredAuth,
    clearStoredAuth,
  };
};

export const useAuthStore = defineStore('auth', () => {
  const authStorage = useAuthStorage();
  const initialState = authStorage.getStoredAuth();

  // State
  const token = ref<string | null>(initialState.token);
  const user = ref<User | null>(initialState.user);
  const roles = ref<Role[]>(initialState.roles || []);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Helper function to persist auth state
  const persistAuthState = () => {
    authStorage.setStoredAuth({
      token: token.value,
      user: user.value,
      roles: roles.value,
    });
  };

  // Computed properties
  const isAuthenticated = computed(() => !!token.value);
  const isPasswordUpdated = computed(() => user.value?.is_password_updated ?? false);
  const needsPasswordChange = computed(() => isAuthenticated.value && !isPasswordUpdated.value);

  const userPermissions = computed(() => {
    const permissions = new Set<string>();

    if (roles.value && roles.value.length > 0) {
      roles.value.forEach((role) => {
        let parsedPermissions: Permissions;

        // Handle permissions that might be stored as a JSON string
        if (typeof role.permissions === 'string') {
          try {
            parsedPermissions = JSON.parse(role.permissions);
          } catch (e) {
            console.error('Error parsing permissions:', e);
            return;
          }
        } else {
          parsedPermissions = role.permissions as Permissions;
        }

        // Extract all permissions into a flat set
        Object.entries(parsedPermissions).forEach(([resource, actions]) => {
          if (Array.isArray(actions)) {
            actions.forEach((action) => {
              permissions.add(`${resource}:${action}`);
            });
          }
        });
      });
    }

    return Array.from(permissions);
  });

  // Actions
  const login = async (credentials: LoginCredentials) => {
    loading.value = true;
    error.value = null;

    try {
      const { data: response } = await useFetch<ApiResponse<LoginResponse['data']>>(
        `${import.meta.env.API_BASE_URL}/auth/login`,
        {
          method: 'POST',
          body: credentials,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.value && response.value.success) {
        const responseData = response.value.data;

        token.value = responseData.access_token;
        user.value = responseData.user;

        // Parse and store roles
        roles.value = responseData?.roles?.map((role: any) => {
          // Ensure role permissions are correctly handled whether they're a string or object
          if (typeof role.permissions === 'string' && role.permissions) {
            try {
              // Try to parse the permissions JSON string
              const parsedPermissions = JSON.parse(role.permissions);
              return { ...role, permissions: parsedPermissions };
            } catch (e) {
              console.error('Error parsing role permissions:', e);
              return role;
            }
          }
          return role;
        });

        // Persist auth state to localStorage
        persistAuthState();

        return {
          success: true,
          needsPasswordChange: !responseData.user.is_password_updated,
        };
      }

      return { success: false, error: response.value?.message || 'Login failed' };
    } catch (err: any) {
      error.value = err.message || 'Login failed';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    loading.value = true;

    try {
      if (token.value) {
        await useFetch(`${import.meta.env.API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token.value}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear state regardless of API response
      token.value = null;
      user.value = null;
      roles.value = [];
      authStorage.clearStoredAuth();
      loading.value = false;
    }
  };

  const fetchUserProfile = async () => {
    if (!token.value) return null;

    loading.value = true;

    try {
      const { data, error: apiError } = await useFetch<ApiResponse<FetchUserResponse['data']>>(
        `${import.meta.env.API_BASE_URL}/auth/auth-user`,
        {
          headers: {
            Authorization: `Bearer ${token.value}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (apiError.value) {
        throw new Error(apiError.value.message || 'Failed to fetch user profile');
      }

      if (data.value && data.value.success && data.value.data.user) {
        user.value = data.value.data.user;

        // Update roles if included in response
        if (data.value.data.roles) {
          roles.value = data.value.data.roles.map((role) => {
            // Handle parsing permissions if they're a string
            if (typeof role.permissions === 'string' && role.permissions) {
              try {
                const parsedPermissions = JSON.parse(role.permissions);
                return { ...role, permissions: parsedPermissions };
              } catch (e) {
                console.error('Error parsing role permissions:', e);
                return role;
              }
            }
            return role;
          });
        }

        // Persist updated state
        persistAuthState();

        return data.value.data.user;
      }

      return null;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch user profile';

      // If unauthorized (401), clear auth state
      if (err.status === 401) {
        token.value = null;
        user.value = null;
        roles.value = [];
        authStorage.clearStoredAuth();
      }

      return null;
    } finally {
      loading.value = false;
    }
  };

  const changePassword = async (payload: PasswordChangePayload) => {
    if (!token.value) return { success: false, error: 'Not authenticated' };

    loading.value = true;
    error.value = null;

    try {
      const { data, error: apiError } = await useFetch<ApiResponse<TokenResponse>>(
        `${import.meta.env.API_BASE_URL}/auth/set-new-password`,
        {
          method: 'POST',
          body: payload,
          headers: {
            Authorization: `Bearer ${token.value}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (apiError.value) {
        throw new Error(apiError.value.message || 'Failed to change password');
      }

      if (data.value && data.value.success && data.value.data.access_token) {
        // Update token with new one from response
        token.value = data.value.data.access_token;

        // Update user object
        if (user.value) {
          user.value = {
            ...user.value,
            is_password_updated: true,
          };
        }

        // Persist updated state
        persistAuthState();

        return { success: true };
      }

      return {
        success: false,
        error: data.value?.message || 'Invalid response from server',
      };
    } catch (err: any) {
      error.value = err.message || 'Failed to change password';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  };

  const refreshToken = async () => {
    if (!token.value) return false;

    loading.value = true;

    try {
      const { data, error: apiError } = await useFetch<ApiResponse<TokenResponse>>(
        `${import.meta.env.API_BASE_URL}/auth/refresh`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token.value}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (apiError.value) {
        throw new Error(apiError.value.message || 'Failed to refresh token');
      }

      if (data.value && data.value.success && data.value.data.access_token) {
        token.value = data.value.data.access_token;
        persistAuthState();
        return true;
      }

      return false;
    } catch (err) {
      console.error('Token refresh failed:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const resetPassword = async (payload: PasswordChangePayload) => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: apiError } = await useFetch<ApiResponse<{ message: string }>>(
        `${import.meta.env.API_BASE_URL}/password/reset`,
        {
          method: 'POST',
          body: payload,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (apiError.value) {
        throw new Error(apiError.value.message || 'Failed to reset password');
      }

      if (data.value && data.value.success) {
        return { success: true, message: data.value.message };
      }

      return {
        success: false,
        error: data.value?.message || 'Failed to reset password',
      };
    } catch (err: any) {
      error.value = err.message || 'Failed to reset password';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  };

  const sendResetLink = async (email: string) => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: apiError } = await useFetch<ApiResponse<{ message: string }>>(
        `${import.meta.env.API_BASE_URL}/password/reset-link`,
        {
          method: 'POST',
          body: { email },
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (apiError.value) {
        throw new Error(apiError.value.message || 'Failed to send reset link');
      }

      if (data.value && data.value.success) {
        return { success: true, message: data.value.message };
      }

      return {
        success: false,
        error: data.value?.message || 'Failed to send reset link',
      };
    } catch (err: any) {
      error.value = err.message || 'Failed to send reset link';
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  };

  const initAuth = async () => {
    // State is already initialized from localStorage via initialState
    // Just verify the token is still valid by fetching the user profile
    if (token.value) {
      await fetchUserProfile();
    }
  };

  const hasPermission = (permission: string) => {
    const [resource, action] = permission.split(':');

    for (const role of roles.value) {
      let permissions: Permissions;

      // Handle permissions that might be stored as a JSON string
      if (typeof role.permissions === 'string') {
        try {
          permissions = JSON.parse(role.permissions);
        } catch (e) {
          console.error('Error parsing permissions:', e);
          continue;
        }
      } else {
        permissions = role.permissions as Permissions;
      }

      // Check if the role has the requested permission
      if (permissions[resource] && permissions[resource]?.includes(action)) {
        return true;
      }
    }

    return false;
  };

  const hasAnyPermission = (permissions: string[]) => {
    return permissions.some((p) => hasPermission(p));
  };

  const hasAllPermissions = (permissions: string[]) => {
    return permissions.every((p) => hasPermission(p));
  };

  // Auto-initialize on client side
  if (process.client) {
    // Trigger initialization but don't wait for it
    initAuth();
  }

  return {
    // State
    token,
    user,
    roles,
    loading,
    error,

    // Computed
    isAuthenticated,
    isPasswordUpdated,
    needsPasswordChange,
    userPermissions,

    // Actions
    login,
    logout,
    fetchUserProfile,
    changePassword,
    refreshToken,
    resetPassword,
    sendResetLink,
    initAuth,

    // Permission helpers
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
});

// Composable wrapper for the store
export function useAuth() {
  const authStore = useAuthStore();
  const router = useRouter();

  const loginAndRedirect = async (credentials: LoginCredentials) => {
    const result = await authStore.login(credentials);
    console.log(result);

    if (result.success) {
      if (authStore.needsPasswordChange) {
        // Redirect to password change page
        router.push('/auth/set-new-password');
      } else {
        // Redirect to  or home
        router.push('/');
      }
      return true;
    }

    return false;
  };

  const logoutAndRedirect = async () => {
    await authStore.logout();
    router.push('/auth/login');
  };

  const changePasswordAndRedirect = async (payload: PasswordChangePayload) => {
    const result = await authStore.changePassword(payload);

    if (result.success) {
      router.push('/');
      return true;
    }

    return false;
  };

  return {
    ...authStore,
    loginAndRedirect,
    logoutAndRedirect,
    changePasswordAndRedirect,
  };
}
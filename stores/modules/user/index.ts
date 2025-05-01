// stores/modules/user/index.ts
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import type { User, LoginResponse, LogoutResponse, FetchUserProfileResponse } from './types'
import { actions as userActions } from './actions'

export const useUserStore = defineStore('user', () => {
  // Initialize with persisted values
  const currentUser = useStorage<User | null>('user-current-user', null)
  const isAuthenticated = useStorage('user-is-authenticated', false)
  const token = useStorage<string | null>('user-token', null)
  const loading = ref(false)
  const error = ref(null)

  // Bind actions to the store context
  const login = async (email: string, password: string): Promise<LoginResponse> => {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await userActions.login.call({ 
        currentUser, 
        isAuthenticated, 
        token, 
        loading, 
        error 
      }, email, password);
      
      if (result.success) {
        currentUser.value = result.user;
        isAuthenticated.value = true;
        token.value = result.token || null;
      }
      
      return result;
    } finally {
      loading.value = false;
    }
  }

  const logout = async (): Promise<LogoutResponse> => {
    try {
      const result = await userActions.logout.call({ 
        currentUser, 
        isAuthenticated, 
        token 
      });
      
      if (result.success) {
        currentUser.value = null;
        isAuthenticated.value = false;
        token.value = null;
      }
      
      return result;
    } catch (err) {
      console.error('Logout error:', err);
      return { success: false, error: err };
    }
  }

  const fetchUserProfile = async (): Promise<FetchUserProfileResponse> => {
    if (!token.value) return { success: false, error: 'Not authenticated' };
    
    loading.value = true;
    
    try {
      const result = await userActions.fetchUserProfile.call({ 
        currentUser, 
        loading, 
        error,
        token 
      });
      
      if (result.success) {
        currentUser.value = result.user;
      }
      
      return result;
    } finally {
      loading.value = false;
    }
  }

  // Existing computed properties and methods
  const isAdmin = computed(() => currentUser.value?.role === 'admin')
  const userName = computed(() => currentUser.value?.name || '')
  const userEmail = computed(() => currentUser.value?.email || '')
  const userAvatar = computed(() => currentUser.value?.avatar || '')

  function setUser(user: User) {
    currentUser.value = user
    isAuthenticated.value = true
  }

  function clearUser() {
    currentUser.value = null
    isAuthenticated.value = false
    token.value = null
  }

  function updateToken(newToken: string | null) {
    token.value = newToken
  }

  return {
    // State
    currentUser,
    isAuthenticated,
    token,
    loading,
    error,

    // Computed
    isAdmin,
    userName,
    userEmail,
    userAvatar,

    // Actions
    login,
    logout,
    fetchUserProfile,
    setUser,
    clearUser,
    updateToken
  }
})
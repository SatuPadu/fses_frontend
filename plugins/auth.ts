import { watch, ref, onUnmounted } from 'vue';
import { useAuthStore, useAuth } from '@/composables/useAuth';
import { useNuxtApp, defineNuxtPlugin } from 'nuxt/app';
import type { $Fetch } from 'nitropack';


export default defineNuxtPlugin(async (nuxtApp) => {
  // Only run this on the client side
  if (process.client) {
    const authStore = useAuthStore();

    // Make auth store available globally (using provide)
    nuxtApp.provide('auth', useAuth()); // Provide the composable wrapper

    // Register auth state refreshing
    nuxtApp.hook('app:mounted', () => {
      const refreshInterval = ref<ReturnType<typeof setInterval> | null>(null);
      const isAppMounted = ref(true); // Track if the app is still mounted

      // Watch for authentication state changes
      const stopWatcher = watch(
        () => authStore.isAuthenticated,
        (isAuthenticated) => {
          // Clear existing interval
          if (refreshInterval.value) {
            clearInterval(refreshInterval.value);
            refreshInterval.value = null;
          }

          // If authenticated and app is mounted, set up token refresh
          if (isAuthenticated && isAppMounted.value) {
            // Refresh token every 10 minutes (adjust as needed)
            refreshInterval.value = setInterval(async () => {
              await authStore.refreshToken();
            }, 10 * 60 * 1000); // 10 minutes
          }
        },
        { immediate: true }
      );

      // Use Vue's onUnmounted hook for cleanup
      onUnmounted(() => {
        stopWatcher();
        isAppMounted.value = false;
        if (refreshInterval.value) {
          clearInterval(refreshInterval.value);
          refreshInterval.value = null;
        }
      });
    });

    // Create a custom fetch function
    const authFetch = async (url: string, options: any = {}) => {
      const nuxtApp = useNuxtApp();
      const $fetch = nuxtApp.$fetch as $Fetch;
    
      // Add auth header if a token exists
      if (authStore.token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${authStore.token}`,
        };
      }

      try {
        return await $fetch(url, options);
      } catch (error: any) {
        // Handle 401 Unauthorized errors
        if (error.response?.status === 401 && authStore.isAuthenticated) {
          console.log('AuthFetch: Unauthorized - Attempting token refresh');
          const refreshed = await authStore.refreshToken();

          if (refreshed) {
            console.log('AuthFetch: Token refreshed successfully - Retrying request');
            // Retry with new token
            options.headers = {
              ...options.headers,
              Authorization: `Bearer ${authStore.token}`,
            };
            return await $fetch(url, options);
          } else {
            console.log('AuthFetch: Token refresh failed - Logging out');
            const auth = useAuth();
            await auth.logoutAndRedirect();
          }
        }

        // Re-throw other errors
        throw error;
      }
    };

    // Make the auth fetch available globally (using provide)
    nuxtApp.provide('authFetch', authFetch);
  }
});
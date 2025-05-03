// plugins/auth.client.ts
export default defineNuxtPlugin(async () => {
    const authStore = useAuthStore();
    await authStore.initializeAuth();
  });
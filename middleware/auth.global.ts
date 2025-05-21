// middleware/auth.global.ts
import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app';
import { useAuthStore } from '@/composables/useAuth';

export default defineNuxtRouteMiddleware((to) => {
  // Skip middleware in server-side rendering
  if (process.server) return;
  
  const authStore = useAuthStore();
  
  // Public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/forgot-password', '/auth/reset-password', '/auth/forgot-password-email-sent'];
  
  // If route is public, allow access without auth
  if (publicRoutes.includes(to.path)) {
    // But if user is already authenticated, redirect to home or password change page
    if (authStore.isAuthenticated) {
      if (authStore.needsPasswordChange) {
        return navigateTo('/auth/set-new-password');
      } else {
        return navigateTo('/');
      }
    }
    return; // Allow access to public route for unauthenticated users
  }
  
  // Special handling for set-new-password route
  if (to.path === '/auth/set-new-password') {
    // Must be authenticated to access this route
    if (!authStore.isAuthenticated) {
      return navigateTo('/auth/login');
    }
    // If password is already updated and trying to access set-new-password,
    // redirect to home (this is for voluntary password changes)
    return;
  }
  
  // For all other routes, require authentication
  if (!authStore.isAuthenticated) {
    return navigateTo('/auth/login');
  }
  
  // If authenticated but password needs to be changed, redirect to set-new-password
  if (authStore.needsPasswordChange && to.path !== '/auth/set-new-password') {
    return navigateTo('/auth/set-new-password');
  }
});
// middleware/auth.global.ts
import { useAuth } from '~/composables/auth';

export default defineNuxtRouteMiddleware(async (to, from) => {
  const auth = useAuth();
  const publicRoutes = ['/auth/login', '/auth/forgot-password', '/auth/register'];
  const isPublicRoute = publicRoutes.includes(to.path);

  // Redirect to login if not authenticated and trying to access protected route
  if (!isPublicRoute && !auth.isAuthenticated) {
    return navigateTo('/auth/login');
  }

  // Role-based access control
  if (to.meta.roles && auth.user) {
    const requiredRoles = Array.isArray(to.meta.roles) ? to.meta.roles : [to.meta.roles];
    const userRoles = auth.roles.map(role => role.role_name);
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      return navigateTo('/unauthorized');
    }
  }

  // Permission-based access control
  if (to.meta.permissions && auth.user) {
    const requiredPermissions = Array.isArray(to.meta.permissions) ? to.meta.permissions : [to.meta.permissions];
    const userPermissions = auth.roles.reduce((acc: string[], role) => {
      Object.values(role.permissions).forEach(perms => {
        acc.push(...perms);
      });
      return acc;
    }, []);

    const hasRequiredPermission = requiredPermissions.some(permission => userPermissions.includes(permission));
    
    if (!hasRequiredPermission) {
      return navigateTo('/unauthorized');
    }
  }
});
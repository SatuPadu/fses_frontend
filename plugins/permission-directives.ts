import { usePermissionsStore } from '~/stores/permissions';

export default defineNuxtPlugin((nuxtApp) => {
  // v-permission directive
  nuxtApp.vueApp.directive('permission', {
    mounted(el, binding) {
      const permissionsStore = usePermissionsStore();
      const [module, action] = binding.value.split(':');
      
      if (!permissionsStore.hasPermission(module, action)) {
        el.style.display = 'none';
      }
    },
    updated(el, binding) {
      const permissionsStore = usePermissionsStore();
      const [module, action] = binding.value.split(':');
      
      if (permissionsStore.hasPermission(module, action)) {
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    }
  });

  // v-permission-any directive
  nuxtApp.vueApp.directive('permission-any', {
    mounted(el, binding) {
      const permissionsStore = usePermissionsStore();
      const permissions = binding.value;
      
      let hasAny = false;
      for (const permission of permissions) {
        const [module, action] = permission.split(':');
        if (permissionsStore.hasPermission(module, action)) {
          hasAny = true;
          break;
        }
      }
      
      if (!hasAny) {
        el.style.display = 'none';
      }
    },
    updated(el, binding) {
      const permissionsStore = usePermissionsStore();
      const permissions = binding.value;
      
      let hasAny = false;
      for (const permission of permissions) {
        const [module, action] = permission.split(':');
        if (permissionsStore.hasPermission(module, action)) {
          hasAny = true;
          break;
        }
      }
      
      if (hasAny) {
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    }
  });

  // v-permission-all directive
  nuxtApp.vueApp.directive('permission-all', {
    mounted(el, binding) {
      const permissionsStore = usePermissionsStore();
      const permissions = binding.value;
      
      let hasAll = true;
      for (const permission of permissions) {
        const [module, action] = permission.split(':');
        if (!permissionsStore.hasPermission(module, action)) {
          hasAll = false;
          break;
        }
      }
      
      if (!hasAll) {
        el.style.display = 'none';
      }
    },
    updated(el, binding) {
      const permissionsStore = usePermissionsStore();
      const permissions = binding.value;
      
      let hasAll = true;
      for (const permission of permissions) {
        const [module, action] = permission.split(':');
        if (!permissionsStore.hasPermission(module, action)) {
          hasAll = false;
          break;
        }
      }
      
      if (hasAll) {
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    }
  });

  // v-can-access directive
  nuxtApp.vueApp.directive('can-access', {
    mounted(el, binding) {
      const permissionsStore = usePermissionsStore();
      const module = binding.value;
      
      if (!permissionsStore.canAccess(module)) {
        el.style.display = 'none';
      }
    },
    updated(el, binding) {
      const permissionsStore = usePermissionsStore();
      const module = binding.value;
      
      if (permissionsStore.canAccess(module)) {
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    }
  });

  // v-role directive
  nuxtApp.vueApp.directive('role', {
    mounted(el, binding) {
      const permissionsStore = usePermissionsStore();
      const requiredRole = binding.value;
      
      const hasRole = permissionsStore.getUserRoles.some(role => 
        role.role_name === requiredRole
      );
      
      if (!hasRole) {
        el.style.display = 'none';
      }
    },
    updated(el, binding) {
      const permissionsStore = usePermissionsStore();
      const requiredRole = binding.value;
      
      const hasRole = permissionsStore.getUserRoles.some(role => 
        role.role_name === requiredRole
      );
      
      if (hasRole) {
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    }
  });

  // v-role-any directive
  nuxtApp.vueApp.directive('role-any', {
    mounted(el, binding) {
      const permissionsStore = usePermissionsStore();
      const requiredRoles = binding.value;
      
      const hasAnyRole = permissionsStore.getUserRoles.some(role => 
        requiredRoles.includes(role.role_name)
      );
      
      if (!hasAnyRole) {
        el.style.display = 'none';
      }
    },
    updated(el, binding) {
      const permissionsStore = usePermissionsStore();
      const requiredRoles = binding.value;
      
      const hasAnyRole = permissionsStore.getUserRoles.some(role => 
        requiredRoles.includes(role.role_name)
      );
      
      if (hasAnyRole) {
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    }
  });
}); 
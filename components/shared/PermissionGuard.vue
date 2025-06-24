<template>
  <div v-if="hasAccess">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePermissions } from '~/composables/usePermissions';

interface Props {
  module?: string;
  action?: string;
  permissions?: string[];
  requireAll?: boolean;
  role?: string;
  roles?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  requireAll: false
});

const { hasPermission, hasAnyPermission, hasAllPermissions, canAccess } = usePermissions();

const hasAccess = computed(() => {
  // Role-based access
  if (props.role) {
    return hasRole(props.role);
  }
  
  if (props.roles) {
    return hasAnyRole(props.roles);
  }
  
  // Permission-based access
  if (props.module && props.action) {
    return hasPermission(props.module, props.action);
  }
  
  if (props.module && props.permissions) {
    if (props.requireAll) {
      return hasAllPermissions(props.module, props.permissions);
    } else {
      return hasAnyPermission(props.module, props.permissions);
    }
  }
  
  if (props.module) {
    return canAccess(props.module);
  }
  
  return false;
});

const hasRole = (role: string): boolean => {
  const { userRoles } = usePermissions();
  return userRoles.value.some(userRole => userRole.role_name === role);
};

const hasAnyRole = (roles: string[]): boolean => {
  const { userRoles } = usePermissions();
  return userRoles.value.some(userRole => roles.includes(userRole.role_name));
};
</script> 
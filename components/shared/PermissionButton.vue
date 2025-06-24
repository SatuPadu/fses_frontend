<template>
  <v-btn
    v-if="hasAccess"
    v-bind="$attrs"
    :disabled="disabled || !hasAccess"
    @click="handleClick"
  >
    <slot />
  </v-btn>
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
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  requireAll: false,
  disabled: false
});

const emit = defineEmits<{
  click: [event: MouseEvent]
}>();

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

const handleClick = (event: MouseEvent) => {
  if (hasAccess.value && !props.disabled) {
    emit('click', event);
  }
};
</script> 
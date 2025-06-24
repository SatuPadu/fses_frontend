import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Role as AuthRole } from '~/types/auth';

export interface Permission {
  module: string;
  actions: string[];
}

export interface Role {
  id: number;
  role_name: string;
  description: string;
  permissions: {
    [module: string]: string[];
  };
  created_at: string;
  updated_at: string;
  pivot?: {
    user_id: number;
    role_id: number;
    created_at: string;
    updated_at: string;
  };
}

export interface UserPermissions {
  roles: Role[];
}

export const usePermissionsStore = defineStore('permissions', () => {
  // State
  const userRoles = ref<Role[]>([]);
  const isInitialized = ref(false);

  // Convert auth role to permissions role
  const convertAuthRoleToPermissionsRole = (authRole: AuthRole): Role => {
    let permissions: { [module: string]: string[] } = {};
    
    // Handle permissions that might be stored as a JSON string
    if (typeof authRole.permissions === 'string') {
      try {
        permissions = JSON.parse(authRole.permissions);
      } catch (e) {
        console.error('Error parsing permissions:', e);
        permissions = {};
      }
    } else {
      permissions = authRole.permissions as { [module: string]: string[] };
    }

    return {
      id: authRole.id,
      role_name: authRole.role_name,
      description: authRole.description,
      permissions,
      created_at: authRole.created_at,
      updated_at: authRole.updated_at,
    };
  };

  // Getters
  const getUserRoles = computed(() => userRoles.value);
  
  const getHighestRole = computed(() => {
    if (userRoles.value.length === 0) return null;
    
    const hierarchyLevels = {
      'OfficeAssistant': 1,
      'Supervisor': 2,
      'CoSupervisor': 2,
      'ProgramCoordinator': 4,
      'Chairperson': 5,
      'PGAM': 6
    };
    
    return userRoles.value.reduce((highest, current) => {
      const currentLevel = hierarchyLevels[current.role_name as keyof typeof hierarchyLevels] || 0;
      const highestLevel = hierarchyLevels[highest.role_name as keyof typeof hierarchyLevels] || 0;
      return currentLevel > highestLevel ? current : highest;
    });
  });

  const getAllPermissions = computed(() => {
    const allPermissions: { [module: string]: Set<string> } = {};
    
    userRoles.value.forEach(role => {
      Object.entries(role.permissions).forEach(([module, actions]) => {
        if (!allPermissions[module]) {
          allPermissions[module] = new Set();
        }
        actions.forEach(action => allPermissions[module].add(action));
      });
    });
    
    // Convert Sets back to arrays
    const result: { [module: string]: string[] } = {};
    Object.entries(allPermissions).forEach(([module, actions]) => {
      result[module] = Array.from(actions);
    });
    
    return result;
  });

  const hasPermission = (module: string, action: string): boolean => {
    const permissions = getAllPermissions.value;
    return permissions[module]?.includes(action) || false;
  };

  const hasAnyPermission = (module: string, actions: string[]): boolean => {
    const permissions = getAllPermissions.value;
    return actions.some(action => permissions[module]?.includes(action) || false);
  };

  const hasAllPermissions = (module: string, actions: string[]): boolean => {
    const permissions = getAllPermissions.value;
    return actions.every(action => permissions[module]?.includes(action) || false);
  };

  const canAccess = (module: string): boolean => {
    const permissions = getAllPermissions.value;
    return permissions[module] && permissions[module].length > 0;
  };

  const getModulePermissions = (module: string): string[] => {
    const permissions = getAllPermissions.value;
    return permissions[module] || [];
  };

  // Actions
  const setUserRoles = (roles: Role[]) => {
    userRoles.value = roles;
    isInitialized.value = true;
  };

  const clearPermissions = () => {
    userRoles.value = [];
    isInitialized.value = false;
  };

  const initializeFromLoginData = (loginData: any) => {
    if (loginData?.user?.roles) {
      const convertedRoles = loginData.user.roles.map(convertAuthRoleToPermissionsRole);
      setUserRoles(convertedRoles);
    }
  };

  // Initialize from auth store roles
  const initializeFromAuthStore = (authRoles: AuthRole[]) => {
    if (authRoles && authRoles.length > 0) {
      const convertedRoles = authRoles.map(convertAuthRoleToPermissionsRole);
      setUserRoles(convertedRoles);
    } else {
      clearPermissions();
    }
  };

  return {
    // State
    userRoles,
    isInitialized,
    
    // Getters
    getUserRoles,
    getHighestRole,
    getAllPermissions,
    
    // Methods
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccess,
    getModulePermissions,
    setUserRoles,
    clearPermissions,
    initializeFromLoginData,
    initializeFromAuthStore
  };
}); 
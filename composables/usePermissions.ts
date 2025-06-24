import { computed } from 'vue';
import { usePermissionsStore } from '~/stores/permissions';
import { useAuthStore } from '~/composables/useAuth';

export const usePermissions = () => {
  const permissionsStore = usePermissionsStore();
  const authStore = useAuthStore();

  // Initialize permissions from auth store if not already initialized
  if (authStore.isAuthenticated && authStore.roles && authStore.roles.length > 0 && !permissionsStore.isInitialized) {
    permissionsStore.initializeFromAuthStore(authStore.roles);
  }

  // Permission checking functions
  const hasPermission = (module: string, action: string): boolean => {
    return permissionsStore.hasPermission(module, action);
  };

  const hasAnyPermission = (module: string, actions: string[]): boolean => {
    return permissionsStore.hasAnyPermission(module, actions);
  };

  const hasAllPermissions = (module: string, actions: string[]): boolean => {
    return permissionsStore.hasAllPermissions(module, actions);
  };

  const canAccess = (module: string): boolean => {
    return permissionsStore.canAccess(module);
  };

  const getModulePermissions = (module: string): string[] => {
    return permissionsStore.getModulePermissions(module);
  };

  // Computed properties for reactive permission checks
  const userRoles = computed(() => permissionsStore.getUserRoles);
  const highestRole = computed(() => permissionsStore.getHighestRole);
  const allPermissions = computed(() => permissionsStore.getAllPermissions);
  const isInitialized = computed(() => permissionsStore.isInitialized);

  // Common permission checks
  const canViewStudents = computed(() => hasPermission('students', 'view'));
  const canCreateStudents = computed(() => hasPermission('students', 'create'));
  const canEditStudents = computed(() => hasPermission('students', 'edit'));
  const canDeleteStudents = computed(() => hasPermission('students', 'delete'));
  const canImportStudents = computed(() => hasPermission('students', 'import'));
  const canExportStudents = computed(() => hasPermission('students', 'export'));

  const canViewUsers = computed(() => hasPermission('users', 'view'));
  const canCreateUsers = computed(() => hasPermission('users', 'create'));
  const canEditUsers = computed(() => hasPermission('users', 'edit'));
  const canDeleteUsers = computed(() => hasPermission('users', 'delete'));

  const canViewLecturers = computed(() => hasPermission('lecturers', 'view'));
  const canCreateLecturers = computed(() => hasPermission('lecturers', 'create'));
  const canEditLecturers = computed(() => hasPermission('lecturers', 'edit'));
  const canDeleteLecturers = computed(() => hasPermission('lecturers', 'delete'));

  const canViewPrograms = computed(() => hasPermission('programs', 'view'));
  const canCreatePrograms = computed(() => hasPermission('programs', 'create'));
  const canEditPrograms = computed(() => hasPermission('programs', 'edit'));
  const canDeletePrograms = computed(() => hasPermission('programs', 'delete'));

  const canViewEvaluations = computed(() => hasPermission('evaluations', 'view'));
  const canNominateEvaluations = computed(() => hasPermission('evaluations', 'nominate'));
  const canModifyEvaluations = computed(() => hasPermission('evaluations', 'modify'));
  const canAssignEvaluations = computed(() => hasPermission('evaluations', 'assign'));
  const canLockEvaluations = computed(() => hasPermission('evaluations', 'lock'));
  const canConductEvaluations = computed(() => hasPermission('evaluations', 'conduct'));

  const canViewNominations = computed(() => hasPermission('nominations', 'view'));
  const canCreateNominations = computed(() => hasPermission('nominations', 'create'));
  const canEditNominations = computed(() => hasPermission('nominations', 'edit'));
  const canPostponeNominations = computed(() => hasPermission('nominations', 'postpone'));
  const canLockNominations = computed(() => hasPermission('nominations', 'lock'));

  const canViewChairpersons = computed(() => hasPermission('chairpersons', 'view'));
  const canAssignChairpersons = computed(() => hasPermission('chairpersons', 'assign'));
  const canModifyChairpersons = computed(() => hasPermission('chairpersons', 'modify'));

  const canViewReports = computed(() => hasPermission('reports', 'view'));
  const canGenerateReports = computed(() => hasPermission('reports', 'generate'));
  const canDownloadReports = computed(() => hasPermission('reports', 'download'));
  const canPublishReports = computed(() => hasPermission('reports', 'publish'));

  const canViewSettings = computed(() => hasPermission('settings', 'view'));
  const canEditSettings = computed(() => hasPermission('settings', 'edit'));

  // Role-based checks
  const isOfficeAssistant = computed(() => 
    userRoles.value.some(role => role.role_name === 'OfficeAssistant')
  );

  const isSupervisor = computed(() => 
    userRoles.value.some(role => role.role_name === 'Supervisor')
  );

  const isCoSupervisor = computed(() => 
    userRoles.value.some(role => role.role_name === 'CoSupervisor')
  );

  const isProgramCoordinator = computed(() => 
    userRoles.value.some(role => role.role_name === 'ProgramCoordinator')
  );

  const isChairperson = computed(() => 
    userRoles.value.some(role => role.role_name === 'Chairperson')
  );

  const isPGAM = computed(() => 
    userRoles.value.some(role => role.role_name === 'PGAM')
  );

  // Helper functions for common permission patterns
  const canManageStudents = computed(() => 
    hasAnyPermission('students', ['create', 'edit', 'delete'])
  );

  const canManageUsers = computed(() => 
    hasAnyPermission('users', ['create', 'edit', 'delete'])
  );

  const canManageLecturers = computed(() => 
    hasAnyPermission('lecturers', ['create', 'edit', 'delete'])
  );

  const canManagePrograms = computed(() => 
    hasAnyPermission('programs', ['create', 'edit', 'delete'])
  );

  const canManageEvaluations = computed(() => 
    hasAnyPermission('evaluations', ['nominate', 'modify', 'assign', 'lock'])
  );

  const canManageNominations = computed(() => 
    hasAnyPermission('nominations', ['create', 'edit', 'postpone', 'lock'])
  );

  const canManageReports = computed(() => 
    hasAnyPermission('reports', ['generate', 'download', 'publish'])
  );

  return {
    // Basic permission functions
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccess,
    getModulePermissions,

    // Computed properties
    userRoles,
    highestRole,
    allPermissions,
    isInitialized,

    // Module-specific permission checks
    canViewStudents,
    canCreateStudents,
    canEditStudents,
    canDeleteStudents,
    canImportStudents,
    canExportStudents,

    canViewUsers,
    canCreateUsers,
    canEditUsers,
    canDeleteUsers,

    canViewLecturers,
    canCreateLecturers,
    canEditLecturers,
    canDeleteLecturers,

    canViewPrograms,
    canCreatePrograms,
    canEditPrograms,
    canDeletePrograms,

    canViewEvaluations,
    canNominateEvaluations,
    canModifyEvaluations,
    canAssignEvaluations,
    canLockEvaluations,
    canConductEvaluations,

    canViewNominations,
    canCreateNominations,
    canEditNominations,
    canPostponeNominations,
    canLockNominations,

    canViewChairpersons,
    canAssignChairpersons,
    canModifyChairpersons,

    canViewReports,
    canGenerateReports,
    canDownloadReports,
    canPublishReports,

    canViewSettings,
    canEditSettings,

    // Role-based checks
    isOfficeAssistant,
    isSupervisor,
    isCoSupervisor,
    isProgramCoordinator,
    isChairperson,
    isPGAM,

    // Management permission checks
    canManageStudents,
    canManageUsers,
    canManageLecturers,
    canManagePrograms,
    canManageEvaluations,
    canManageNominations,
    canManageReports,
  };
}; 
import { ref, computed, readonly } from 'vue';
import { useAuthStore } from './useAuth';
import type {
  OfficeAssistantDashboard,
  ResearchSupervisorDashboard,
  ProgramCoordinatorDashboard,
  PGAMDashboard,
  DashboardApiResponse
} from '@/types/dashboard';

export const useDashboard = () => {
  const authStore = useAuthStore();
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Dashboard data for different roles
  const officeAssistantData = ref<OfficeAssistantDashboard | null>(null);
  const researchSupervisorData = ref<ResearchSupervisorDashboard | null>(null);
  const programCoordinatorData = ref<ProgramCoordinatorDashboard | null>(null);
  const pgamData = ref<PGAMDashboard | null>(null);

  // Helper function to make API calls
  const fetchDashboardData = async <T>(endpoint: string): Promise<T | null> => {
    if (!authStore.token) {
      error.value = 'Authentication required';
      return null;
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${import.meta.env.API_BASE_URL}/dashboard/${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json',
        },
      });

      const data: DashboardApiResponse<T> = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch dashboard data');
      }

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch dashboard data');
      }

      return data.data;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch dashboard data';
      console.error('Dashboard fetch error:', err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Fetch functions for each role
  const fetchOfficeAssistantData = async () => {
    const data = await fetchDashboardData<OfficeAssistantDashboard>('office-assistant');
    if (data) {
      officeAssistantData.value = data;
    }
    return data;
  };

  const fetchResearchSupervisorData = async () => {
    const data = await fetchDashboardData<ResearchSupervisorDashboard>('research-supervisor');
    if (data) {
      researchSupervisorData.value = data;
    }
    return data;
  };

  const fetchProgramCoordinatorData = async () => {
    const data = await fetchDashboardData<ProgramCoordinatorDashboard>('program-coordinator');
    if (data) {
      programCoordinatorData.value = data;
    }
    return data;
  };

  const fetchPGAMData = async () => {
    const data = await fetchDashboardData<PGAMDashboard>('pgam');
    if (data) {
      pgamData.value = data;
    }
    return data;
  };

  // Computed properties to get current user's dashboard data
  const currentDashboardData = computed(() => {
    const userRoles = authStore.roles.map(role => role.role_name);
    
    if (userRoles.includes('OfficeAssistant')) {
      return officeAssistantData.value;
    } else if (userRoles.includes('ResearchSupervisor')) {
      return researchSupervisorData.value;
    } else if (userRoles.includes('ProgramCoordinator')) {
      return programCoordinatorData.value;
    } else if (userRoles.includes('PGAM')) {
      return pgamData.value;
    }
    
    return null;
  });

  const currentUserRole = computed(() => {
    const userRoles = authStore.roles.map(role => role.role_name);
    
    if (userRoles.includes('OfficeAssistant')) {
      return 'OfficeAssistant';
    } else if (userRoles.includes('ResearchSupervisor')) {
      return 'ResearchSupervisor';
    } else if (userRoles.includes('ProgramCoordinator')) {
      return 'ProgramCoordinator';
    } else if (userRoles.includes('PGAM')) {
      return 'PGAM';
    }
    
    return null;
  });

  // Auto-fetch dashboard data based on user role
  const fetchCurrentUserDashboard = async () => {
    const role = currentUserRole.value;
    
    switch (role) {
      case 'OfficeAssistant':
        return await fetchOfficeAssistantData();
      case 'ResearchSupervisor':
        return await fetchResearchSupervisorData();
      case 'ProgramCoordinator':
        return await fetchProgramCoordinatorData();
      case 'PGAM':
        return await fetchPGAMData();
      default:
        error.value = 'No dashboard available for current user role';
        return null;
    }
  };

  return {
    // State
    loading: readonly(loading),
    error: readonly(error),
    
    // Data
    officeAssistantData: readonly(officeAssistantData),
    researchSupervisorData: readonly(researchSupervisorData),
    programCoordinatorData: readonly(programCoordinatorData),
    pgamData: readonly(pgamData),
    
    // Computed
    currentDashboardData,
    currentUserRole,
    
    // Actions
    fetchOfficeAssistantData,
    fetchResearchSupervisorData,
    fetchProgramCoordinatorData,
    fetchPGAMData,
    fetchCurrentUserDashboard,
  };
}; 
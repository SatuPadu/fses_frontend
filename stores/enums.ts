import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { EnumsData, EnumsResponse } from '~/types/global';
import { useAuthStore } from '~/composables/useAuth';
import { usePermissions } from '~/composables/usePermissions';

export const useEnumsStore = defineStore('enums', () => {
  const enumsData = ref<EnumsData | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const getHeaders = () => {
    const authStore = useAuthStore();
    const token = authStore.token;
    if (!token) {
      throw new Error('Authentication token is not available.');
    }
    return {
      Authorization: `Bearer ${token}`
    };
  };

  const fetchEnums = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${import.meta.env.API_BASE_URL}/enums`, {
        method: 'GET',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json',
        },
      });

      const data: EnumsResponse = await response.json();

      if (data.error) {
        throw new Error(data.error || 'Failed to fetch enums');
      }

      if (data.success) {
        enumsData.value = data.data;
        return data.data;
      }

      throw new Error(data.message || 'Failed to fetch enums');
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch enums';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const getDepartmentOptions = () => {
    if (!enumsData.value?.departments) return [];
    return Object.entries(enumsData.value.departments).map(([value, title]) => ({
      title,
      value
    }));
  };

  const getTitleOptions = () => {
    if (!enumsData.value?.titles) return [];
    return Object.entries(enumsData.value.titles).map(([value, title]) => ({
      title,
      value
    }));
  };

  const getRoleOptions = () => {
    if (!enumsData.value?.roles) return [];
    return Object.entries(enumsData.value.roles).map(([value, title]) => ({
      title,
      value
    }));
  };

  const getMyRoleOptions = () => {
    if (!enumsData.value?.roles) return [];
    
    const { userRoles } = usePermissions();
    const userRoleNames = userRoles.value.map(role => role.role_name);
    
    return Object.entries(enumsData.value.roles)
      .filter(([value, title]) => userRoleNames.includes(value))
      .map(([value, title]) => ({
        title,
        value
      }));
  };

  const getNominationStatusOptions = () => {
    if (!enumsData.value?.nominationStatus) return [];
    return Object.entries(enumsData.value.nominationStatus).map(([value, title]) => ({
      title,
      value
    }));
  };

  const getEvaluationTypeOptions = () => {
    if (!enumsData.value?.evaluationTypes) return [];
    return Object.entries(enumsData.value.evaluationTypes).map(([value, title]) => ({
      title,
      value
    }));
  };

  const getProgramOptions = () => {
    if (!enumsData.value?.programs) return [];
    return Object.entries(enumsData.value.programs).map(([value, title]) => ({
      title,
      value: parseInt(value)
    }));
  };

  const getLecturerOptions = () => {
    if (!enumsData.value?.lecturers) return [];
    return Object.entries(enumsData.value.lecturers).map(([value, title]) => ({
      title,
      value: parseInt(value)
    }));
  };

  return {
    enumsData,
    loading,
    error,
    fetchEnums,
    getDepartmentOptions,
    getTitleOptions,
    getRoleOptions,
    getMyRoleOptions,
    getNominationStatusOptions,
    getEvaluationTypeOptions,
    getProgramOptions,
    getLecturerOptions,
  };
}); 
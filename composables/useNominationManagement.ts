import { ref } from 'vue';
import { useAuth, useAuthStore } from '~/composables/useAuth';
import type { 
  Evaluation, 
  Lecturer, 
  NominationListResponse, 
  ExaminerListResponse,
  CreateNominationRequest,
  UpdateNominationRequest,
  PostponeNominationRequest,
  NominationResponse,
  PostponeResponse
} from '~/types/global';

export const useNominationManagement = () => {
  const authStore = useAuthStore();
  const loading = ref(false);
  const error = ref<string | null>(null);

  const getHeaders = () => {
    const token = authStore.token;
    if (!token) {
      throw new Error('Authentication token is not available.');
    }
    return {
      Authorization: `Bearer ${token}`
    };
  };

  const getNominations = async (options: { 
    page: number, 
    perPage: number, 
    sortBy: string, 
    sortOrder: string, 
    filters: Record<string, any> 
  }) => {
    loading.value = true;
    error.value = null;
    try {
      // Build query parameters
      const queryParams: Record<string, string> = {
        page: options.page.toString(),
        per_page: options.perPage.toString(),
        sortBy: options.sortBy,
        sortOrder: options.sortOrder,
      };

      for (const key in options.filters) {
        if (Object.prototype.hasOwnProperty.call(options.filters, key)) {
          let value = options.filters[key];
          if (value !== null && value !== undefined && value !== '') {
            queryParams[key] = String(value);
          }
        }
      }

      const params = new URLSearchParams(queryParams);

      const response = await fetch(`${import.meta.env.API_BASE_URL}/evaluations/nominations?${params.toString()}`, {
        method: 'GET',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Failed to fetch nominations');
      }

      if (data.success) {
        return data;
      }

      throw new Error(data.message || 'Failed to fetch nominations');
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch nominations';
      throw e;
    } finally {
      loading.value = false;
    }
  };



  const createNomination = async (nominationData: CreateNominationRequest): Promise<NominationResponse> => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${import.meta.env.API_BASE_URL}/evaluations/nominations`, {
        method: 'POST',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nominationData),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Failed to create nomination');
      }

      if (data.success) {
        return data;
      }

      throw new Error(data.message || 'Failed to create nomination');
    } catch (e: any) {
      error.value = e.message || 'Failed to create nomination';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const updateNomination = async (nominationId: string, nominationData: UpdateNominationRequest): Promise<NominationResponse> => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${import.meta.env.API_BASE_URL}/evaluations/nominations/${nominationId}`, {
        method: 'PUT',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nominationData),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Failed to update nomination');
      }

      if (data.success) {
        return data;
      }

      throw new Error(data.message || 'Failed to update nomination');
    } catch (e: any) {
      error.value = e.message || 'Failed to update nomination';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const postponeNomination = async (nominationId: string, postponeData: PostponeNominationRequest): Promise<PostponeResponse> => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${import.meta.env.API_BASE_URL}/evaluations/nominations/${nominationId}/postpone`, {
        method: 'POST',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postponeData),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Failed to postpone nomination');
      }

      if (data.success) {
        return data;
      }

      throw new Error(data.message || 'Failed to postpone nomination');
    } catch (e: any) {
      error.value = e.message || 'Failed to postpone nomination';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const lockNomination = async (nominationId: string): Promise<NominationResponse> => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${import.meta.env.API_BASE_URL}/evaluations/nominations/${nominationId}/lock`, {
        method: 'POST',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Failed to lock nomination');
      }

      if (data.success) {
        return data;
      }

      throw new Error(data.message || 'Failed to lock nomination');
    } catch (e: any) {
      error.value = e.message || 'Failed to lock nomination';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const lockNominations = async (evaluationIds: number[]): Promise<NominationResponse> => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${import.meta.env.API_BASE_URL}/evaluations/nominations/lock`, {
        method: 'POST',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          evaluation_ids: evaluationIds
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Failed to lock nominations');
      }

      if (data.success) {
        return data;
      }

      throw new Error(data.message || 'Failed to lock nominations');
    } catch (e: any) {
      error.value = e.message || 'Failed to lock nominations';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const getExaminer1Suggestions = async (studentId: number): Promise<ExaminerListResponse> => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${import.meta.env.API_BASE_URL}/examiner-suggestions/examiner1/${studentId}`, {
        method: 'GET',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Failed to fetch examiner 1 suggestions');
      }

      if (data.success) {
        return data;
      }

      throw new Error(data.message || 'Failed to fetch examiner 1 suggestions');
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch examiner 1 suggestions';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const getExaminer2Suggestions = async (studentId: number): Promise<ExaminerListResponse> => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${import.meta.env.API_BASE_URL}/examiner-suggestions/examiner2/${studentId}`, {
        method: 'GET',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Failed to fetch examiner 2 suggestions');
      }

      if (data.success) {
        return data;
      }

      throw new Error(data.message || 'Failed to fetch examiner 2 suggestions');
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch examiner 2 suggestions';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const getExaminer3Suggestions = async (studentId: number): Promise<ExaminerListResponse> => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${import.meta.env.API_BASE_URL}/examiner-suggestions/examiner3/${studentId}`, {
        method: 'GET',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Failed to fetch examiner 3 suggestions');
      }

      if (data.success) {
        return data;
      }

      throw new Error(data.message || 'Failed to fetch examiner 3 suggestions');
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch examiner 3 suggestions';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const getAcademicYears = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${import.meta.env.API_BASE_URL}/academic-years`, {
        method: 'GET',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Failed to fetch academic years');
      }

      if (data.success) {
        return data;
      }

      throw new Error(data.message || 'Failed to fetch academic years');
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch academic years';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const getChairpersonSuggestions = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${import.meta.env.API_BASE_URL}/evaluations/assignments/chairperson-suggestions`, {
        method: 'GET',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Failed to fetch chairperson suggestions');
      }

      if (data.success) {
        return data;
      }

      throw new Error(data.message || 'Failed to fetch chairperson suggestions');
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch chairperson suggestions';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const saveChairpersonAssignments = async (assignments: Array<{
    evaluation_id: number;
    chairperson_id: number;
    is_auto_assigned: boolean;
  }>) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${import.meta.env.API_BASE_URL}/evaluations/assignments`, {
        method: 'POST',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignments: assignments
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Failed to save chairperson assignments');
      }

      if (data.success) {
        return data;
      }

      throw new Error(data.message || 'Failed to save chairperson assignments');
    } catch (e: any) {
      error.value = e.message || 'Failed to save chairperson assignments';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    getNominations,
    createNomination,
    updateNomination,
    postponeNomination,
    lockNomination,
    lockNominations,
    getExaminer1Suggestions,
    getExaminer2Suggestions,
    getExaminer3Suggestions,
    getAcademicYears,
    getChairpersonSuggestions,
    saveChairpersonAssignments,
  };
}; 
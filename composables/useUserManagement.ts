import { ref } from 'vue';
import { useAuth, useAuthStore } from '~/composables/useAuth';
import type { User, Lecturer, Role, ImportStatus, ImportResponse } from '~/types/global';

export const useUserManagement = () => {
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

  const getUsers = async (options: { page: number, perPage: number, sortBy: string, sortOrder: string, filters: Record<string, any> }) => {
    loading.value = true;
    error.value = null;
    try {
      // Build query parameters
      const queryParams: Record<string, string> = {
        page: options.page.toString(),
        perPage: options.perPage.toString(),
        sortBy: options.sortBy,
        sortOrder: options.sortOrder,
      };

      for (const key in options.filters) {
        if (Object.prototype.hasOwnProperty.call(options.filters, key)) {
          let value = options.filters[key];
          if (value !== null && value !== undefined && value !== '') {
            if (key === 'is_active' && typeof value === 'boolean') {
              value = value ? '1' : '0';
            }
            queryParams[key] = String(value);
          }
        }
      }

      const params = new URLSearchParams(queryParams);

      const response = await fetch(`${import.meta.env.API_BASE_URL}/users?${params.toString()}`, {
        method: 'GET',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Failed to fetch lecturers');
      }

      if (data.success) {
        return data;
      }

      throw new Error(data.message || 'Failed to fetch lecturers');
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch lecturers';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const getLecturers = async (options: { page: number, perPage: number, sortBy: string, sortOrder: string, filters: Record<string, any> }) => {
    loading.value = true;
    error.value = null;
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: options.page.toString(),
        perPage: options.perPage.toString(),
        sortBy: options.sortBy,
        sortOrder: options.sortOrder,
        ...options.filters,
      });

      const response = await fetch(`${import.meta.env.API_BASE_URL}/lecturers?${params.toString()}`, {
        method: 'GET',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Failed to fetch lecturers');
      }

      if (data.success) {
        return data;
      }

      throw new Error(data.message || 'Failed to fetch lecturers');
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch lecturers';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const getStudents = async (options: { page: number, perPage: number, sortBy: string, sortOrder: string, filters: Record<string, any> }) => {
    loading.value = true;
    error.value = null;
    try {
      // Build query parameters
      const queryParams: Record<string, string> = {
        page: options.page.toString(),
        perPage: options.perPage.toString(),
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
      
      const response = await fetch(`${import.meta.env.API_BASE_URL}/students?${params.toString()}`, {
        method: 'GET',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Failed to fetch students');
      }

      if (data.success) {
        return data;
      }

      throw new Error(data.message || 'Failed to fetch students');
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch students';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const getPrograms = async (options: { page: number, perPage: number, sortBy: string, sortOrder: string, filters: Record<string, any> }) => {
    loading.value = true;
    error.value = null;
    try {
      // Build query parameters
      const queryParams: Record<string, string> = {
        page: options.page.toString(),
        perPage: options.perPage.toString(),
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

      const response = await fetch(`${import.meta.env.API_BASE_URL}/programs?${params.toString()}`, {
        method: 'GET',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Failed to fetch programs');
      }

      if (data.success) {
        return data;
      }

      throw new Error(data.message || 'Failed to fetch programs');
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch programs';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const createUser = async (userData: any) => {
    loading.value = true;
    error.value = null;
    try {
      // Transform role field to single string format for backend
      const transformedData = { ...userData };
      if (userData.role) {
        transformedData.role = userData.role; // Keep as single string
      }

      const response = await fetch(`${import.meta.env.API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedData)
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Failed to create user');
      }

      if (data.success) {
        return data;
      }

      throw new Error(data.message || 'Failed to create user');
    } catch (e: any) {
      error.value = e.message || 'Failed to create user';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const updateUser = async (userId: string, userData: any) => {
    loading.value = true;
    error.value = null;
    try {
      // Transform roles field to backend format
      const transformedData = { ...userData };
      if (userData.roles && Array.isArray(userData.roles)) {
        transformedData.roles = userData.roles; // Keep as array for backend
      }

      const response = await fetch(`${import.meta.env.API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedData)
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || `Failed to update user ${userId}`);
      }

      if (data.success) {
        return data;
      }

      throw new Error(data.message || `Failed to update user ${userId}`);
    } catch (e: any) {
      error.value = e.message || `Failed to update user ${userId}`;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const createLecturer = async (lecturerData: any) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${import.meta.env.API_BASE_URL}/lecturers`, {
        method: 'POST',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lecturerData)
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Failed to create lecturer');
      }

      if (data.success) {
        return data;
      }

      throw new Error(data.message || 'Failed to create lecturer');
    } catch (e: any) {
      error.value = e.message || 'Failed to create lecturer';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const updateLecturer = async (lecturerId: string, lecturerData: any) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${import.meta.env.API_BASE_URL}/lecturers/${lecturerId}`, {
        method: 'PUT',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lecturerData)
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || `Failed to update lecturer ${lecturerId}`);
      }

      if (data.success) {
        return data;
      }

      throw new Error(data.message || `Failed to update lecturer ${lecturerId}`);
    } catch (e: any) {
      error.value = e.message || `Failed to update lecturer ${lecturerId}`;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const createStudent = async (studentData: any) => {
    loading.value = true;
    error.value = null;
    try {
      const headers = getHeaders();      
      const response = await fetch(`${import.meta.env.API_BASE_URL}/students`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData)
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Failed to create student');
      }

      if (data.success) {
        return data;
      }

      throw new Error(data.message || 'Failed to create student');
    } catch (e: any) {
      console.error('Create student error:', e);
      console.error('Error details:', {
        message: e.message,
        stack: e.stack,
        name: e.name
      });
      error.value = e.message || 'Failed to create student';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const updateStudent = async (studentId: string, studentData: any) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${import.meta.env.API_BASE_URL}/students/${studentId}`, {
        method: 'PUT',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData)
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || `Failed to update student ${studentId}`);
      }

      if (data.success) {
        return data;
      }

      throw new Error(data.message || `Failed to update student ${studentId}`);
    } catch (e: any) {
      error.value = e.message || `Failed to update student ${studentId}`;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const createProgram = async (programData: any) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${import.meta.env.API_BASE_URL}/programs`, {
        method: 'POST',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(programData)
      });
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message || 'Failed to create program');
      }
      if (data.success) {
        return data;
      }
      throw new Error(data.message || 'Failed to create program');
    } catch (e: any) {
      error.value = e.message || 'Failed to create program';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const updateProgram = async (programId: string, programData: any) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${import.meta.env.API_BASE_URL}/programs/${programId}`, {
        method: 'PUT',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(programData)
      });
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message || `Failed to update program ${programId}`);
      }
      if (data.success) {
        return data;
      }
      throw new Error(data.message || `Failed to update program ${programId}`);
    } catch (e: any) {
      error.value = e.message || `Failed to update program ${programId}`;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const deleteUser = async (userId: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${import.meta.env.API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Failed to delete user');
      }

      if (data.success) {
        return data;
      }

      throw new Error(data.message || 'Failed to delete user');
    } catch (e: any) {
      error.value = e.message || 'Failed to delete user';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const reactivateUser = async (userId: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${import.meta.env.API_BASE_URL}/auth/reactivate/${userId}`, {
        method: 'GET',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Failed to reactivate user');
      }

      if (data.success) {
        return data;
      }

      throw new Error(data.message || 'Failed to reactivate user');
    } catch (e: any) {
      error.value = e.message || 'Failed to reactivate user';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const uploadUsersFile = async (file: File): Promise<ImportResponse> => {
    loading.value = true;
    error.value = null;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch(`${import.meta.env.API_BASE_URL}/students/import`, {
        method: 'POST',
        headers: getHeaders(),
        body: formData
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Failed to upload file');
      }

      if (data.success) {
        return data;
      }

      throw new Error(data.message || 'Failed to upload file');
    } catch (e: any) {
      error.value = e.message || 'Failed to upload file';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const getImportStatus = async (importId: string): Promise<ImportStatus> => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${import.meta.env.API_BASE_URL}/imports/${importId}/status`, {
        method: 'GET',
        headers: getHeaders(),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Failed to get import status');
      }

      if (data.success) {
        return data.data;
      }

      throw new Error(data.message || 'Failed to get import status');
    } catch (e: any) {
      error.value = e.message || 'Failed to get import status';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const downloadImportTemplate = async (): Promise<Blob> => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${import.meta.env.API_BASE_URL}/imports/template`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to download template');
      }

      return await response.blob();
    } catch (e: any) {
      error.value = e.message || 'Failed to download template';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const downloadImportErrors = async (importId: string): Promise<Blob> => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${import.meta.env.API_BASE_URL}/imports/${importId}/errors`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to download error file');
      }

      return await response.blob();
    } catch (e: any) {
      error.value = e.message || 'Failed to download error file';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const getAllPrograms = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${import.meta.env.API_BASE_URL}/programs?all=true`, {
        method: 'GET',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Failed to fetch programs');
      }

      if (data.success) {
        return data.data;
      }

      throw new Error(data.message || 'Failed to fetch programs');
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch programs';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const getAllLecturers = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${import.meta.env.API_BASE_URL}/lecturers?all=true`, {
        method: 'GET',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Failed to fetch lecturers');
      }

      if (data.success) {
        return data.data;
      }

      throw new Error(data.message || 'Failed to fetch lecturers');
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch lecturers';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const deleteLecturer = async (lecturerId: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${import.meta.env.API_BASE_URL}/lecturers/${lecturerId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message || `Failed to delete lecturer ${lecturerId}`);
      if (!data.success) throw new Error(data.message || `Failed to delete lecturer ${lecturerId}`);
    } catch (e: any) {
      error.value = e.message || `Failed to delete lecturer ${lecturerId}`;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const deleteStudent = async (studentId: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${import.meta.env.API_BASE_URL}/students/${studentId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message || `Failed to delete student ${studentId}`);
      if (!data.success) throw new Error(data.message || `Failed to delete student ${studentId}`);
    } catch (e: any) {
      error.value = e.message || `Failed to delete student ${studentId}`;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const deleteProgram = async (programId: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${import.meta.env.API_BASE_URL}/programs/${programId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message || `Failed to delete program ${programId}`);
      if (!data.success) throw new Error(data.message || `Failed to delete program ${programId}`);
    } catch (e: any) {
      error.value = e.message || `Failed to delete program ${programId}`;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const importData = async (file: File) => {
    loading.value = true;
    error.value = null;
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${import.meta.env.API_BASE_URL}/imports/upload`, {
        method: 'POST',
        headers: {
          ...getHeaders(),
        },
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Failed to import data');
      }

      if (!data.success) {
        throw new Error(data.message || 'Failed to import data');
      }

      return data;
    } catch (e: any) {
      error.value = e.message || 'Failed to import data';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const getImportStream = (importId: string, onMessage: (data: any) => void, onError?: (error: any) => void) => {
    const token = authStore.token;
    if (!token) {
      throw new Error('Authentication token is not available.');
    }
    const streamUrl = `${import.meta.env.API_BASE_URL}/imports/${importId}/stream?token=${token}`;
    
    const eventSource = new EventSource(streamUrl);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Error parsing stream data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      if (onError) {
        onError(error);
      }
      eventSource.close();
    };

    return eventSource;
  };

  const getSupervisors = async (department: string) => {
    try {
      const response = await fetch(`${import.meta.env.API_BASE_URL}/lecturers/supervisor-suggestions?department=${encodeURIComponent(department)}`, {
        method: 'GET',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Failed to fetch supervisors');
      }

      if (data.success) {
        return data.data;
      }

      throw new Error(data.message || 'Failed to fetch supervisors');
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch supervisors';
      throw e;
    }
  };

  const getCoSupervisors = async (supervisorId: number) => {
    try {
      const response = await fetch(`${import.meta.env.API_BASE_URL}/lecturers/co-supervisor-suggestions?supervisor_id=${supervisorId}`, {
        method: 'GET',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Failed to fetch co-supervisors');
      }

      if (data.success) {
        return data.data;
      }

      throw new Error(data.message || 'Failed to fetch co-supervisors');
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch co-supervisors';
      throw e;
    }
  };

  const getProgramsByDepartment = async (department: string) => {
    try {
      const response = await fetch(`${import.meta.env.API_BASE_URL}/programs?all=true&department=${encodeURIComponent(department)}`, {
        method: 'GET',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Failed to fetch programs');
      }

      if (data.success) {
        return data.data;
      }

      throw new Error(data.message || 'Failed to fetch programs');
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch programs';
      throw e;
    }
  };

  const getStudentDetail = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${import.meta.env.API_BASE_URL}/students/${id}`, {
        method: 'GET',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Failed to fetch student');
      return data.data;
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch student';
      throw e;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    getUsers,
    getLecturers,
    getStudents,
    getPrograms,
    createUser,
    updateUser,
    createLecturer,
    updateLecturer,
    createStudent,
    updateStudent,
    createProgram,
    updateProgram,
    deleteUser,
    deleteLecturer,
    deleteStudent,
    deleteProgram,
    uploadUsersFile,
    getImportStatus,
    downloadImportTemplate,
    downloadImportErrors,
    getAllPrograms,
    getAllLecturers,
    importData,
    getImportStream,
    reactivateUser,
    getSupervisors,
    getCoSupervisors,
    getProgramsByDepartment,
    getStudentDetail,
  };
}; 
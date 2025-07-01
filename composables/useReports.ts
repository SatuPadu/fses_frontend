import { useAuthStore } from '~/composables/useAuth';

export const useReports = () => {
  const authStore = useAuthStore();

  const getHeaders = () => {
    const token = authStore.token;
    if (!token) {
      throw new Error('Authentication token is not available.');
    }
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const getUniqueExaminers = async () => {
    const response = await fetch(`${import.meta.env.API_BASE_URL}/reports/unique-examiners`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message || 'Failed to fetch unique examiners');
    if (data.success) return data;
    throw new Error(data.message || 'Failed to fetch unique examiners');
  };

  const getExaminerSessions = async (lecturerId: string, academicYear?: string | null) => {
    const params = new URLSearchParams({ lecturer_id: lecturerId });
    if (academicYear) params.append('academic_year', academicYear);
    const response = await fetch(`${import.meta.env.API_BASE_URL}/reports/examiner-sessions?${params.toString()}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message || 'Failed to fetch examiner sessions');
    if (data.success) return data;
    throw new Error(data.message || 'Failed to fetch examiner sessions');
  };

  const getUniqueChairpersons = async () => {
    const response = await fetch(`${import.meta.env.API_BASE_URL}/reports/unique-chairpersons`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message || 'Failed to fetch unique chairpersons');
    if (data.success) return data;
    throw new Error(data.message || 'Failed to fetch unique chairpersons');
  };

  const getChairpersonSessions = async (lecturerId: string, academicYear?: string | null) => {
    const params = new URLSearchParams({ lecturer_id: lecturerId });
    if (academicYear) params.append('academic_year', academicYear);
    const response = await fetch(`${import.meta.env.API_BASE_URL}/reports/chairperson-sessions?${params.toString()}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message || 'Failed to fetch chairperson sessions');
    if (data.success) return data;
    throw new Error(data.message || 'Failed to fetch chairperson sessions');
  };

  const getEvaluationChartData = async (academicYear?: string | null) => {
    const params = academicYear ? `?academic_year=${encodeURIComponent(academicYear)}` : '';
    const response = await fetch(`${import.meta.env.API_BASE_URL}/reports/chart-data${params}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message || 'Failed to fetch chart data');
    if (data.success) return data;
    throw new Error(data.message || 'Failed to fetch chart data');
  };

  return {
    getUniqueExaminers,
    getExaminerSessions,
    getUniqueChairpersons,
    getChairpersonSessions,
    getEvaluationChartData,
  };
}; 
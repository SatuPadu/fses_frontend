export interface Lecturer {
  id: number;
  name: string;
  email: string;
  title: string;
  phone: string | null;
  department: string;
  is_from_fai: boolean;
  external_institution: string | null;
  specialization: string | null;
  user_id: number | null;
  staff_number: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface User {
  id: number;
  staff_number: string;
  name: string;
  email: string;
  department: string;
  lecturer_id: number | null;
  last_login: string | null;
  password_reset_token: string | null;
  password_reset_expiry: string | null;
  is_active: boolean;
  is_password_updated: boolean;
  failed_login_attempts: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  roles?: Role[];
  lecturer?: Lecturer;
}

export interface Role {
  id: number;
  role_name: string;
  description: string;
  permissions: Record<string, string[]> | null;
  created_at: string;
  updated_at: string;
  pivot?: {
    user_id: number;
    role_id: number;
    created_at: string;
    updated_at: string;
  };
}

export interface ImportStatus {
  import_id: string;
  status: 'queued' | 'processing' | 'completed' | 'completed_with_errors' | 'failed';
  message: string;
  errors: Array<{
    row: number;
    error: string;
    data: Record<string, any>;
  }>;
  summary?: {
    programs_created: number;
    programs_updated: number;
    lecturers_created: number;
    lecturers_updated: number;
    users_created: number;
    users_updated: number;
    students_created: number;
    students_updated: number;
    evaluations_created: number;
    evaluations_updated: number;
    co_supervisors_created: number;
    co_supervisors_updated: number;
  };
  updated_at: string;
}

export interface ImportProgress {
  current: number;
  total: number;
  progress: number;
  message: string;
  updated_at: string;
}

export interface ImportDetailedProgress {
  title: string;
  data: Record<string, any>;
  timestamp: string;
}

export interface ImportResponse {
  success: boolean;
  import_id: string;
  status: ImportStatus;
  progress: ImportProgress;
  detailed_progress: ImportDetailedProgress[];
  message?: string;
  error?: string;
}

export interface ImportUploadResponse {
  success: boolean;
  message: string;
  import_id: string;
  data: {
    import_id: string;
    filename: string;
    file_size: number;
    uploaded_at: string;
  };
}

export interface EnumsData {
  departments: Record<string, string>;
  titles: Record<string, string>;
  roles: Record<string, string>;
  nominationStatus: Record<string, string>;
  evaluationTypes: Record<string, string>;
}

export interface EnumsResponse {
  success: boolean;
  data: EnumsData;
  message: string;
}

export interface Program {
  id: number;
  program_name: string;
  program_code: string;
  department: string;
  total_semesters: number;
  evaluation_semester: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface Student {
  id: number;
  name: string;
  email: string;
  matric_number: string;
  program_id: number;
  current_semester: string;
  department: string;
  country: string | null;
  main_supervisor_id: number;
  co_supervisor_id: number | null;
  evaluation_type: string;
  research_title: string | null;
  is_postponed: boolean;
  postponement_reason: string | null;
  status_re_pd: string | null;
  pd: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  program?: Program;
  main_supervisor?: Lecturer;
}

// Additional interfaces for API responses
export interface StudentListResponse {
  success: boolean;
  data: {
    current_page: number;
    data: Student[];
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
  };
  message: string;
}

export interface StudentDetailResponse {
  success: boolean;
  data: Student;
  message: string;
}

export interface LecturerListResponse {
  success: boolean;
  data: {
    current_page: number;
    data: Lecturer[];
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
  };
  message: string;
}

export interface UserListResponse {
  success: boolean;
  data: {
    current_page: number;
    data: User[];
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
  };
  message: string;
}

export interface ProgramListResponse {
  success: boolean;
  data: {
    current_page: number;
    data: Program[];
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
  };
  message: string;
}
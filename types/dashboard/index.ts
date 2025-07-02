/*Recent Transaction*/
type recentTrans = {
    title: string;
    subtitle: string;
    textcolor: string;
    boldtext: boolean;
    line: boolean;
    link: string;
    url: string;
};

/*product performance*/
type productPerformanceType = {
    id: number;
    name: string;
    post: string;
    pname: string;
    status: string;
    statuscolor: string;
    budget: string;
};

/*Products card types*/
type productsCards = {
    title: string;
    link: string;
    photo: string;
    salesPrice: number;
    price: number;
    rating: number;
};

export type { recentTrans, productPerformanceType, productsCards }

// Dashboard API Response Types

export interface StudentManagement {
  total_students: number;
  by_program: Record<string, number>;
  by_department: Record<string, number>;
  by_evaluation_type: Record<string, number>;
  by_semester: Record<string, number>;
}

export interface QuickActions {
  add_student: boolean;
  import_student_data: boolean;
  export_student_lists: boolean;
}

export interface OfficeAssistantDashboard {
  student_management: StudentManagement;
  quick_actions: QuickActions;
}

export interface Program {
  id: number;
  program_name: string;
  program_code: string;
  department: string;
  total_semesters: number;
  evaluation_semester: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PendingNomination {
  name: string;
  matric_number: string;
  current_semester: string;
  program_id: number;
  program: Program;
}

export interface MyStudents {
  total_students: number;
  eligible_for_evaluation: number;
  pending_nominations: number;
  completed_nominations: number;
  postponed_evaluations: number;
}

export interface ResearchSupervisorDashboard {
  my_students: MyStudents;
  recent_nominations: any[];
  pending_nominations_list: PendingNomination[];
  locked_nominations_list: any[];
}

export interface DepartmentOverview {
  total_students: number;
  by_program: Record<string, number>;
  by_evaluation_status: Record<string, number>;
}

export interface EvaluationManagement {
  awaiting_chairperson_assignment: number;
  completed_assignments: number;
  postponed_evaluations: number;
  locked_nominations_count: number;
}

export interface WorkloadMember {
  name: string;
  staff_number: string;
  session_count: number;
}

export interface WorkloadDistribution {
  examiners: WorkloadMember[];
  chairpersons: WorkloadMember[];
}

export interface ProgramCoordinatorDashboard {
  department_overview: DepartmentOverview;
  evaluation_management: EvaluationManagement;
  workload_distribution: WorkloadDistribution;
}

export interface FacultyWideOverview {
  total_students: number;
  by_program: Record<string, number>;
  by_evaluation_type: Record<string, number>;
  by_nomination_status: Record<string, number>;
}

export interface DepartmentComparison {
  student_counts: Record<string, number>;
  evaluation_progress: Record<string, {
    total: number;
    completed: number;
    percentage: number;
  }>;
  workload_distribution: Record<string, {
    examiner_sessions: number;
    chairperson_sessions: number;
  }>;
}

export interface SystemStatistics {
  total_lecturers: number;
  total_evaluations_this_semester: number;
  average_workload_per_examiner: number;
  average_workload_per_chairperson: number;
  system_usage_statistics: {
    total_logins_last_30_days: number;
    total_actions_last_30_days: number;
    successful_actions_last_30_days: number;
    failed_actions_last_30_days: number;
  };
}

export interface PGAMDashboard {
  faculty_wide_overview: FacultyWideOverview;
  department_comparison: DepartmentComparison;
  system_statistics: SystemStatistics;
}

export interface DashboardApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}
// types/auth.ts
export interface User {
  id: number;
  staff_number: string;
  name: string;
  email: string;
  department: string;
  lecturer_id: number | null;
  last_login: string | null;
  password_reset_expiry: string | null;
  is_active: boolean;
  is_password_updated: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  view?: boolean;
  create?: boolean;
  edit?: boolean;
  delete?: boolean;
  upload?: boolean;
  [key: string]: boolean | undefined;
}

export interface Permissions {
  users?: string[];
  students?: string[];
  documents?: string[];
  [key: string]: string[] | undefined;
}

export interface Role {
  id: number;
  role_name: string;
  description: string;
  permissions: string | Permissions;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  identity: string;
  password: string;
}

export interface PasswordChangePayload {
  password: string;
  password_confirmation: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    access_token: string;
    token_type: string;
    expires_in: number;
    user: User;
    roles: Role[];
  };
  message: string;
}

export interface FetchUserResponse {
  success: boolean;
  data: {
    user: User;
    roles?: Role[];
  };
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error_code?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// Auth state for persistent storage
export interface AuthState {
  token: string | null;
  user: User | null;
  roles: Role[];
}
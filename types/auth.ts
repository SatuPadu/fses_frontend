// types/auth.ts

export interface User {
    id: number;
    staff_number: string;
    name: string;
    email: string;
    department: string | null;
    lecturer_id: number | null;
    last_login: string | null;
    password_reset_expiry: string | null;
    is_active: boolean;
    is_password_updated: boolean;
    created_at: string;
    updated_at: string;
  }

  export interface Permissions {
    [resource: string]: string[];
  }
  
  
  export interface Role {
    id: number;
    role_name: string;
    description: string;
    permissions: Permissions;
    created_at: string;
    updated_at: string;
  }
  
  export interface LoginResponseData {
    access_token: string;
    token_type: string;
    expires_in: number;
    user: User;
    roles: Role[];
  }
  
  export interface LoginResponse {
    success: boolean;
    data: LoginResponseData;
    message: string;
  }
  
  export interface FetchUserResponse {
    success: boolean;
    data: User;
    message?: string;
  }
export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  }
  
  export interface UserState {
    currentUser: User | null;
    isAuthenticated: boolean;
    token: string | null;
    loading: boolean;
    error: string | null;
  }
  
  export interface LoginResponse {
    success: boolean;
    user?: User;
    error?: string;
    token?: string;
  }
  
  export interface LogoutResponse {
    success: boolean;
    error?: unknown;
  }
  
  export interface FetchUserProfileResponse {
    success: boolean;
    user?: User;
    error?: string;
  }
  
  // Define the shape of the actions
  export interface UserActions {
    login(email: string, password: string): Promise<LoginResponse>;
    logout(): Promise<LogoutResponse>;
    fetchUserProfile(): Promise<FetchUserProfileResponse>;
  }
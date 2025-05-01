// stores/modules/user/actions.ts
import type { UserState, User, LoginResponse, LogoutResponse, FetchUserProfileResponse, UserActions } from './types';

export const actions: UserActions = {
  async login(this: any, email: string, password: string): Promise<LoginResponse> {
    this.loading = true;
    this.error = null;
    
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock API response
      const user: User = {
        id: 1,
        name: 'John Doe',
        email: email,
        role: email.includes('admin') ? 'admin' : 'user',
        avatar: undefined
      };
      
      const token = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
      
      // Update state
      this.currentUser = user;
      this.isAuthenticated = true;
      this.token = token;
      
      return { success: true, user, token };
    } catch (error) {
      this.error = 'Failed to login. Please check your credentials.';
      console.error(error);
      return { success: false, error: this.error };
    } finally {
      this.loading = false;
    }
  },
  
  async logout(this: any): Promise<LogoutResponse> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Reset state
      this.currentUser = null;
      this.isAuthenticated = false;
      this.token = null;
      
      return { success: true };
    } catch (error) {
      console.error('Error during logout:', error);
      return { success: false, error };
    }
  },
  
  async fetchUserProfile(this: any): Promise<FetchUserProfileResponse> {
    if (!this.token) return { success: false, error: 'Not authenticated' };
    
    this.loading = true;
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const userData: User = {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'user',
        avatar: '/images/john-avatar.jpg'
      };
      
      this.currentUser = userData;
      
      return { success: true, user: userData };
    } catch (error) {
      this.error = 'Failed to fetch user profile';
      console.error(error);
      return { success: false, error: this.error };
    } finally {
      this.loading = false;
    }
  },
};
import { type UserState } from './types';

export const getters = {
  isAdmin: (state: UserState): boolean => 
    state.currentUser?.role === 'admin',
  
  userName: (state: UserState): string => 
    state.currentUser?.name || 'Guest',
  
  userInitials: (state: UserState): string => {
    if (!state.currentUser?.name) return 'G';
    
    const nameParts = state.currentUser.name.split(' ');
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    
    return nameParts[0][0].toUpperCase();
  },
  
  avatarUrl: (state: UserState): string => {
    if (state.currentUser?.avatar) return state.currentUser.avatar;
    
    // Return default avatar URL
    return '/images/users/avatar-1.jpg';
  },
  
  hasPermission: (state: UserState) => (permission: string): boolean => {
    // This is a more complex getter that returns a function
    // Implementation would depend on your permission system
    if (state.currentUser?.role === 'admin') return true;
    
    // Example implementation - in real app, you'd have a more complex permission system
    const userPermissions: Record<'user' | 'guest', string[]> = {
      'user': ['read:profile', 'edit:profile'],
      'guest': ['read:public']
    };

    const role = state.currentUser?.role as 'user' | 'guest' || 'guest';
    return userPermissions[role]?.includes(permission) || false;
  }
};
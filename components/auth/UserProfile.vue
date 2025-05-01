<template>
    <v-card class="mx-auto profile-card" elevation="0">
      <v-card-text class="pa-6">
        <div class="d-flex flex-column align-center mb-4">
          <v-avatar 
            color="primary" 
            size="120" 
            class="mb-4 elevation-3"
          >
            <img v-if="userStore.currentUser?.avatar" :src="avatarUrl" alt="User avatar" />
            <span v-else class="text-h5 font-weight-bold text-white">{{ userInitials }}</span>
          </v-avatar>
  
          <div class="text-center">
            <h2 class="text-h5 font-weight-bold mb-1">{{ userStore.userName }}</h2>
            <div class="d-flex justify-center align-center">
              <v-chip 
                :color="userStore.isAdmin ? 'error' : 'primary'"
                label
                size="small"
                class="px-3"
              >
                {{ userStore.currentUser?.role }}
              </v-chip>
            </div>
          </div>
        </div>
  
        <v-divider class="mb-4"></v-divider>
  
        <v-list class="bg-transparent pa-0">
          <v-list-item class="px-0">
            <v-list-item-title class="text-subtitle-1 font-weight-bold mb-1">User ID</v-list-item-title>
            <v-list-item-subtitle class="text-body-2">
              {{ userStore.currentUser?.id }}
            </v-list-item-subtitle>
          </v-list-item>
  
          <v-list-item class="px-0">
            <v-list-item-title class="text-subtitle-1 font-weight-bold mb-1">Account Type</v-list-item-title>
            <v-list-item-subtitle class="text-body-2">
              {{ userStore.isAdmin ? 'Administrator' : 'Standard User' }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </template>
    
  <script setup lang="ts">
  import { computed, onMounted } from 'vue';
  import { useUserStore } from '~/stores/modules/user';
  import { useRouter } from 'vue-router';
  
  // Get store and router
  const userStore = useUserStore();
  const router = useRouter();
  
  // Computed properties
  const userInitials = computed(() => {
    const name = userStore.userName;
    if (!name) return '';
    
    // Get initials from the name (first letter of first name and first letter of last name if available)
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  });
  
  const avatarUrl = computed(() => {
    return userStore.currentUser?.avatar || '';
  });
  
  // Fetch user data when component is mounted if authenticated
  onMounted(async (): Promise<void> => {
    // Fetch user profile if authenticated but no current user
    if (userStore.isAuthenticated && !userStore.currentUser) {
      const result = await userStore.fetchUserProfile();
      if (!result.success) {
        console.error('Failed to fetch user profile:', result.error);
      }
    } else if (!userStore.isAuthenticated) {
      // Redirect to login if not authenticated
      router.push('/auth/login');
    }
  });
  </script>
  
  <style scoped>
  .profile-card {
    border-radius: 16px;
    overflow: hidden;
  }
  </style>
<template>
  <v-card class="mx-auto rounded-lg" elevation="0">
    <v-card-text class="p-6">
      <div class="flex flex-col mb-4">
        <v-avatar
          color="primary"
          size="120"
          class="mb-4 shadow-md"
        >
          <span class="text-4xl font-bold text-white">{{ userInitials }}</span>
        </v-avatar>

        <div class="">
          <h2 class="text-xl font-bold mb-4">{{ userName }}</h2>
          <div class="flex flex-wrap gap-2">
            <v-chip
              v-for="role in userRoleOptions"
              :key="role.value"
              label
              :color="'primary'"
              size="small"
              class="px-3"
            >
              {{ role.title }}
            </v-chip>
          </div>
        </div>
      </div>

      <v-divider class="mb-4"></v-divider>
      
      <div class="space-y-2 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-4">
        <div class="flex items-center space-x-2 pa-4">
          <div class="font-semibold text-gray-600 mr-4">User ID:</div>
          <div class="text-gray-900">{{ user?.staff_number || '' }}</div>
        </div>
        <div class="flex items-center space-x-2 pa-4">
          <div class="font-semibold text-gray-600 mr-4">Department:</div>
          <div class="text-gray-900">{{ user?.department || 'Not specified' }}</div>
        </div>
        <div class="flex items-center space-x-2 pa-4">
          <div class="font-semibold text-gray-600 mr-4">Email:</div>
          <div class="text-gray-900">{{ user?.email || '' }}</div>
        </div>
        <div class="flex items-center space-x-2 pa-4">
          <div class="font-semibold text-gray-600 mr-4">Last Login:</div>
          <div class="text-gray-900">{{ formatDate(user?.last_login) }}</div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEnumsStore } from '~/stores/enums';
import type { User } from '@/types/auth';

// Define props with TypeScript interface
const props = defineProps({
  user: {
    type: Object as PropType<User | null>,
    default: null,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  roleName: {
    type: String,
    default: 'Standard User',
  },
  userInitials: {
    type: String,
    default: '',
  },
});

// Get enums store and permissions
const enumsStore = useEnumsStore();

// Computed properties
const userName = computed(() => props.user?.lecturer?.title ? `${props.user.lecturer.title} ${props.user.lecturer.name}` : props.user?.name || '');
const userRoleOptions = computed(() => enumsStore.getMyRoleOptions());

// Helper function to format date
const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return 'Never';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (e) {
    return 'Invalid date';
  }
};
</script>
<template>
  <v-card elevation="2" class="pa-4">
    <v-card-title class="text-h6 mb-4">
      Student Management Actions
    </v-card-title>
    
    <v-row>
      <v-col
        v-for="action in quickActions"
        :key="action.title"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card
          :elevation="action.enabled ? 4 : 1"
          :class="action.enabled ? 'cursor-pointer' : 'opacity-50'"
          @click="handleAction(action)"
        >
          <v-card-item class="text-center pa-6">
            <v-icon
              :color="action.color"
              size="48"
              class="mb-3"
            >
              {{ action.icon }}
            </v-icon>
            
            <v-card-title class="text-h6 mb-2">
              {{ action.title }}
            </v-card-title>
            
            <v-card-text class="text-body-2 text-medium-emphasis">
              {{ action.description }}
            </v-card-text>
            
            <v-btn
              :color="action.color"
              :disabled="!action.enabled"
              variant="outlined"
              class="mt-3"
            >
              {{ action.enabled ? 'Go to' : 'Disabled' }}
            </v-btn>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { QuickActions } from '@/types/dashboard';

const props = defineProps<{
  actions: QuickActions;
}>();

const router = useRouter();

const quickActions = [
  {
    title: 'Add New Student',
    icon: 'mdi-account-plus',
    color: 'primary',
    route: '/students',
    enabled: props.actions.add_student,
    description: 'Register a new student in the system',
  },
  {
    title: 'Import Student Data',
    icon: 'mdi-upload',
    color: 'success',
    route: '/import',
    enabled: props.actions.import_student_data,
    description: 'Bulk import student data from Excel/CSV files',
  },
  {
    title: 'View All Students',
    icon: 'mdi-account-group',
    color: 'secondary',
    route: '/students',
    enabled: true,
    description: 'Browse and manage all student records',
  },
];

const handleAction = (action: typeof quickActions[0]) => {
  if (action.enabled) {
    if (action.title === 'Add New Student') {
      // Navigate to students page with query parameter to open add modal
      router.push({ path: action.route, query: { action: 'add' } });
    } else {
      router.push(action.route);
    }
  }
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.cursor-pointer:hover {
  transform: translateY(-2px);
}
</style> 
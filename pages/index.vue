<template>
  <OfficeAssistantDashboard v-if="hasOfficeAssistantRole" />
  <UnifiedDashboard v-else />
</template>
  
<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/composables/useAuth';
import OfficeAssistantDashboard from '@/components/dashboard/OfficeAssistantDashboard.vue';
import UnifiedDashboard from '@/components/dashboard/UnifiedDashboard.vue';

const authStore = useAuthStore();

// Check if user has Office Assistant role
const hasOfficeAssistantRole = computed(() => 
  authStore.roles.some(role => role.role_name === 'OfficeAssistant')
);
</script>

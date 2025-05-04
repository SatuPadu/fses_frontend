<template>
  <v-row>
    <v-col cols="12" sm="12" lg="12">
      <UiChildCard title="User Profile">
        <UserProfile
          :user="auth.user"
          :isAdmin="isAdmin"
          :roleName="roleName"
          :userInitials="userInitials"
        />
      </UiChildCard>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuth } from '@/composables/useAuth';
import UiChildCard from '@/components/shared/UiChildCard.vue';
import UserProfile from '@/components/auth/UserProfile.vue';

// Get auth store from composable
const auth = useAuth();

// Computed properties
const isAdmin = computed(() => {
  return auth.roles.some(role => role.role_name === 'Administrator');
});

const roleName = computed(() => {
  let role = 'Standard User';
  if (auth.roles && auth.roles.length > 0) {
    role = auth.roles[0].role_name;
  }
  return role;
});

const userInitials = computed(() => {
  const name = auth.user?.name;
  if (!name) return '';
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
});
</script>
<template>
  <v-row>
    <v-col cols="12" sm="12" lg="12">
      <UiChildCard title="User Profile">
        <UserProfile
          :user="authStore.user"
          :isAdmin="isAdmin"
          :roleName="roleName"
          :userInitials="userInitials"
        />
      </UiChildCard>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { useAuthStore } from '~/composables/auth';
import UiChildCard from '@/components/shared/UiChildCard.vue';
import UserProfile from '@/components/auth/UserProfile.vue';

export default {
  name: 'UserProfileParent',

  components: {
    UiChildCard,
    UserProfile,
  },

  setup() {
    const authStore = useAuthStore();
    return { authStore };
  },

  computed: {
    isAdmin() {
      return this.authStore.roles.some(role => role.role_name === 'Administrator');
    },

    roleName() {
      let role = 'Standard User';
      if (this.authStore.roles && this.authStore.roles.length > 0) {
        role = this.authStore.roles[0].role_name;
      }
      return role;
    },

    userInitials() {
      const name = this.authStore.user?.name;
      if (!name) return '';
      return name
        .split(' ')
        .map(part => part.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
    },
  },
};
</script>
<template>
  <v-card class="mx-auto rounded-4 hidden" elevation="0">
    <v-card-text class="pa-6">
      <div class="d-flex flex-column align-center mb-4">
        <v-avatar
          color="primary"
          size="120"
          class="mb-4 elevation-3"
        >
          <img v-if="user?.avatar" :src="user.avatar" alt="User avatar" />
          <span v-else class="text-h1 font-weight-bold text-white">{{ userInitials }}</span>
        </v-avatar>

        <div class="text-center">
          <h2 class="text-h5 font-weight-bold mb-1">{{ userName }}</h2>
          <div class="d-flex justify-center align-center">
            <v-chip
              :color="chipColor"
              label
              size="small"
              class="px-3"
            >
              {{ roleName }}
            </v-chip>
          </div>
        </div>
      </div>

      <v-divider class="mb-4"></v-divider>

      <v-list class="bg-transparent pa-0">
        <v-list-item>
          <v-list-item-title class="text-subtitle-1 font-weight-bold mb-1">User ID</v-list-item-title>
          <v-list-item-subtitle class="text-body-2">{{ user?.staff_number || '' }}</v-list-item-subtitle>
        </v-list-item>
        <v-list-item>
          <v-list-item-title class="text-subtitle-1 font-weight-bold mb-1">Account Type</v-list-item-title>
          <v-list-item-subtitle class="text-body-2">{{ isAdmin ? 'Administrator' : 'Standard User' }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import type { User } from '~/types/auth';

export default {
  name: 'UserProfile',

  props: {
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
  },

  computed: {
    userName(): string {
      return this.user?.name || '';
    },

    chipColor(): string {
      return this.isAdmin ? 'error' : 'primary';
    },
  },
};
</script>

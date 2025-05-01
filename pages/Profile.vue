<script setup lang="ts">

import UiChildCard from '@/components/shared/UiChildCard.vue';
import UserProfile from '@/components/auth/UserProfile.vue';
</script>

<template>
  <v-row>
    <v-col cols="12" sm="12" lg="12">
      <UiChildCard title="User Profile">
        <UserProfile />
      </UiChildCard>
    </v-col>
  </v-row>
</template>
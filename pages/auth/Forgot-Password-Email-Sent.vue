<template>
  <div class="authentication">
    <v-container fluid class="pa-3">
      <v-row class="h-100vh d-flex justify-center align-center">
        <v-col cols="12" lg="4" xl="3" class="d-flex align-center">
          <v-card rounded="md" elevation="10" class="px-sm-1 px-0 withbg mx-auto" max-width="500">
            <v-card-item class="pa-sm-8">
              <div class="d-flex justify-center py-4">
                <LayoutFullLogoDark />
              </div>
              <v-card-title class="text-h5 text-center mb-4">
                Check Your Email
              </v-card-title>
              <v-card-text class="text-center">
                <v-icon
                  color="success"
                  size="64"
                  class="mb-4"
                >
                  mdi-email-check
                </v-icon>
                <p class="text-body-1 mb-4">
                  Please check your email and follow the instructions to reset your password.
                </p>
                <v-btn
                  color="primary"
                  block
                  to="/auth/login"
                  class="mt-4"
                >
                  Back to Login
                </v-btn>
              </v-card-text>
            </v-card-item>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "blank",
});
</script> 
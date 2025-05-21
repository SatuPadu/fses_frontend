<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="pa-4">
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
              We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.
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
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
// No additional logic needed for this page
</script> 
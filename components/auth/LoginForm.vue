<template>
  <v-row class="d-flex mb-3">
    <v-col cols="12">
      <v-label class="font-weight-bold mb-1">Username</v-label>
      <v-text-field
        v-model="formData.identity"
        variant="outlined"
        hide-details
        color="primary"
        :disabled="loading"
        placeholder="Enter your staff number"
      ></v-text-field>
    </v-col>
    <v-col cols="12">
      <v-label class="font-weight-bold mb-1">Password</v-label>
      <v-text-field
        v-model="formData.password"
        variant="outlined"
        type="password"
        hide-details
        color="primary"
        :disabled="loading"
        @keyup.enter="handleLogin"
        placeholder="Enter your password"
      ></v-text-field>
    </v-col>

    <v-col v-if="error" cols="12" class="pt-0">
      <v-alert
        type="error"
        variant="tonal"
        density="compact"
        class="mb-2"
      >
        {{ error }}
      </v-alert>
    </v-col>

    <v-col cols="12" class="pt-0">
      <v-btn
        color="primary"
        size="large"
        block
        flat
        :loading="loading"
        @click="handleLogin"
      >
        Sign in
      </v-btn>
    </v-col>
    <v-col cols="12" class="pt-2">
      <div class="d-flex justify-end">
        <NuxtLink
          to="/auth/forgot-password"
          class="text-primary text-decoration-none text-body-2"
        >
          Forgot Password?
        </NuxtLink>
      </div>
    </v-col>
  </v-row>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useAuth } from '~/composables/useAuth'
import type { LoginCredentials } from '~/types/auth'

const auth = useAuth()

const formData = reactive<LoginCredentials>({
  identity: '',
  password: '',
});

const error = ref('');
const loading = ref(false);

const handleLogin = async () => {
  // Form validation
  if (!formData.identity || !formData.password) {
    error.value = 'Please enter both username and password';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    // Use the loginAndRedirect method which handles all redirection logic
    const success = await auth.loginAndRedirect(formData);
    
    if (!success) {
      error.value = 'Invalid credentials. Please check your username and password.';
    }
    // No need for manual redirection as it's handled in loginAndRedirect
  } catch (err: any) {
    console.error('Login error:', err);
    error.value = err?.message || 'An unexpected error occurred. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>
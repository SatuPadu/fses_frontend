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
        :type="accountLocked ? 'warning' : 'error'"
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
const accountLocked = ref(false);

const handleLogin = async () => {
  // Form validation
  if (!formData.identity || !formData.password) {
    error.value = 'Please enter both username and password';
    accountLocked.value = false;
    return;
  }

  loading.value = true;
  error.value = '';
  accountLocked.value = false;

  try {
    // Use the loginAndRedirect method which handles all redirection logic
    const result = await auth.login(formData);
        
    if (!result.success) {
      error.value = result.error || 'Invalid credentials. Please check your username and password.';
      accountLocked.value = result.accountLocked || false;
    } else {
      // Handle successful login and redirection
      if (auth.needsPasswordChange) {
        // Redirect to password change page
        await navigateTo('/auth/set-new-password');
      } else {
        // Redirect to home
        await navigateTo('/');
      }
    }
  } catch (err: any) {
    console.error('Login error:', err);
    error.value = err?.message || 'An unexpected error occurred. Please try again.';
    accountLocked.value = false;
  } finally {
    loading.value = false;
  }
};
</script>
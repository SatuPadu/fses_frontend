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
            </v-card-item>
            <v-card-text>
              <v-row class="d-flex mb-3">
                <v-col cols="12" class="mb-4">
                  <h2 class="text-h4 text-center font-weight-bold">Reset Password</h2>

                  <div class="mt-4">
                    <v-alert
                      type="info"
                      variant="tonal"
                      density="compact"
                      class="mb-4"
                    >
                      Please enter your new password below
                    </v-alert>
                  </div>
                </v-col>

                <v-col cols="12">
                  <v-label class="font-weight-bold mb-1">New Password</v-label>
                  <v-text-field
                    v-model.trim="formData.password"
                    variant="outlined"
                    type="password"
                    hide-details
                    color="primary"
                    :disabled="state.loading"
                    :rules="[rules.required, rules.min, rules.alphanumeric]"
                    placeholder="Enter new password"
                  ></v-text-field>
                  <div class="text-caption text-grey mt-1">
                    Password must be at least 8 characters long and contain only letters and numbers.
                  </div>
                </v-col>

                <v-col cols="12">
                  <v-label class="font-weight-bold mb-1">Confirm Password</v-label>
                  <v-text-field
                    v-model.trim="formData.password_confirmation"
                    variant="outlined"
                    type="password"
                    hide-details
                    color="primary"
                    :disabled="state.loading"
                    :rules="[rules.required, rules.min, rules.alphanumeric, rules.match]"
                    @keyup.enter="handleSetPassword"
                    placeholder="Confirm new password"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" class="pt-0">
                  <v-btn
                    color="primary"
                    size="large"
                    block
                    flat
                    :loading="state.loading"
                    :disabled="!isFormValid"
                    @click="handleSetPassword"
                  >
                    Reset Password
                  </v-btn>
                </v-col>

                <v-col cols="12" class="pt-3" v-if="!auth.needsPasswordChange">
                  <v-btn
                    variant="text"
                    color="primary"
                    block
                    @click="router.push('/auth/login')"
                  >
                    Cancel
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'blank',
});

import { reactive, computed, onMounted } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { useToast } from '@/composables/useToast';
import type { PasswordChangePayload } from '@/types/auth';

const auth = useAuth();
const toast = useToast();
const router = useRouter();
const route = useRoute();

// Get token from route query
const token = computed(() => route.query.token as string);

// Form data with reactive object
const formData = reactive<PasswordChangePayload>({
  password: '',
  password_confirmation: '',
  token: '',
});

// State management for UI
const state = reactive({
  errorMessage: '',
  successMessage: '',
  loading: false,
  tokenValid: true,
});

// Check token validity on mount
onMounted(() => {
  if (!token.value) {
    state.tokenValid = false;
    state.errorMessage = 'Invalid or missing reset token. Please request a new password reset link.';
  }
  formData.token = token.value;
});

// Alphanumeric password validation regex
const ALPHANUMERIC_REGEX = /^[a-zA-Z0-9]+$/;

// Comprehensive validation rules
const rules = {
  required: (v: string) => !!v || 'This field is required',
  min: (v: string) => v.length >= 8 || 'Password must be at least 8 characters',
  alphanumeric: (v: string) => ALPHANUMERIC_REGEX.test(v) || 'Password must contain only letters and numbers',
  match: (v: string) => v === formData.password || 'Passwords do not match'
};

// Enhanced password validation function
const validatePassword = (password: string, confirmation: string) => {
  if (!password) {
    return { valid: false, message: 'Password is required' };
  }

  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }

  if (!ALPHANUMERIC_REGEX.test(password)) {
    return { valid: false, message: 'Password must contain only letters and numbers' };
  }

  if (password !== confirmation) {
    return { valid: false, message: 'Passwords do not match' };
  }

  return { valid: true, message: '' };
};

// Computed property for form validation
const isFormValid = computed(() => {
  const validation = validatePassword(formData.password, formData.password_confirmation);
  return validation.valid;
});

// Single method to handle password reset
const handleSetPassword = async () => {
  if (!state.tokenValid) {
    state.errorMessage = 'Invalid or missing reset token. Please request a new password reset link.';
    return;
  }

  // Comprehensive validation
  const validation = validatePassword(
    formData.password,
    formData.password_confirmation
  );

  // If validation fails, set error and return
  if (!validation.valid) {
    state.errorMessage = validation.message;
    return;
  }

  // Reset messages and set loading state
  state.errorMessage = '';
  state.successMessage = '';
  state.loading = true;

  try {
    // Use composable method for password reset
    const result = await auth.resetPassword(formData);

    if (result.success) {
      // Success scenario
      state.successMessage = 'Password reset successfully! Redirecting to login...';
      toast.success('Password Reset Successful', 'Your password has been reset successfully');
      
      // Optional: Clear sensitive data
      formData.password = '';
      formData.password_confirmation = '';
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } else {
      // Failed scenario
      state.errorMessage = 'Failed to reset password. Please try again.';
      toast.error('Password Reset Failed', 'Failed to reset password. Please try again');
    }
  } catch (err: any) {
    // Error handling
    console.error('Password reset error:', err);
    state.errorMessage = err?.message || 'An unexpected error occurred.';
    toast.error('Reset Error', 'An unexpected error occurred during password reset');
    
    // Handle specific token-related errors
    if (err?.message?.toLowerCase().includes('token')) {
      state.tokenValid = false;
    }
  } finally {
    // Always reset loading state
    state.loading = false;
  }
};
</script>
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
                  <h2 class="text-h4 text-center font-weight-bold">Set New Password</h2>

                  <div v-if="auth.needsPasswordChange" class="mt-4">
                    <v-alert
                      type="info"
                      variant="tonal"
                      density="compact"
                      class="mb-4"
                    >
                      You need to set a new password before continuing
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
                    :rules="[rules.required, rules.min, rules.max, rules.alphanumeric]"
                    placeholder="Enter new password"
                    maxlength="16"
                  ></v-text-field>
                  <div class="text-caption text-grey mt-1">
                    Password must be between 8 and 16 characters long and contain only letters and numbers.
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
                    :rules="[rules.required, rules.min, rules.max, rules.alphanumeric, rules.match]"
                    @keyup.enter="handleSetPassword"
                    placeholder="Confirm new password"
                    maxlength="16"
                  ></v-text-field>
                </v-col>

                <v-col v-if="state.errorMessage" cols="12" class="pt-0">
                  <v-alert
                    type="error"
                    variant="tonal"
                    density="compact"
                    class="mb-2"
                  >
                    {{ state.errorMessage }}
                  </v-alert>
                </v-col>

                <v-col v-if="state.successMessage" cols="12" class="pt-0">
                  <v-alert
                    type="success"
                    variant="tonal"
                    density="compact"
                    class="mb-2"
                  >
                    {{ state.successMessage }}
                  </v-alert>
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
                    Set New Password
                  </v-btn>
                </v-col>

                <v-col cols="12" class="pt-3" v-if="!auth.needsPasswordChange">
                  <v-btn
                    variant="text"
                    color="primary"
                    block
                    @click="router.back()"
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

import { reactive, computed } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { useToast } from '@/composables/useToast';
import type { PasswordChangePayload } from '@/types/auth';

const auth = useAuth();
const toast = useToast();
const router = useRouter();

// Form data with reactive object
const formData = reactive<PasswordChangePayload>({
  password: '',
  password_confirmation: '',
});

// State management for UI
const state = reactive({
  errorMessage: '',
  successMessage: '',
  loading: false,
});

// Alphanumeric password validation regex
const ALPHANUMERIC_REGEX = /^[a-zA-Z0-9]+$/;

// Comprehensive validation rules
const rules = {
  required: (v: string) => !!v || 'This field is required',
  min: (v: string) => v.length >= 8 || 'Password must be at least 8 characters',
  max: (v: string) => v.length <= 16 || 'Password must be at most 16 characters',
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
  if (password.length > 16) {
    return { valid: false, message: 'Password must be at most 16 characters long' };
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

// Single method to handle password change
const handleSetPassword = async () => {
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
    // Use composable method for password change
    const result = await auth.changePasswordAndRedirect(formData);

    if (!result) {
      state.errorMessage = 'Failed to set new password. Please try again.';
      toast.error('Password Change Failed', 'Failed to set new password. Please try again.');
    } else {
      toast.success('Password Set Successfully', 'Your new password has been set successfully');
    }
  } catch (err: any) {
    // Error handling
    console.error('Password change error:', err);
    state.errorMessage = err?.message || 'An unexpected error occurred.';
    toast.error('Password Change Error', 'An unexpected error occurred while setting your password');
  } finally {
    // Always reset loading state
    state.loading = false;
  }
};
</script>
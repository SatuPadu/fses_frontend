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
      <div class="d-flex flex-wrap align-center ml-n2">
        <div class="ml-sm-auto">
          <NuxtLink
            to="/forgot-password"
            class="text-primary text-decoration-none text-body-1 opacity-1 font-weight-medium"
          >
            Forgot Password ?
          </NuxtLink>
        </div>
      </div>
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
  </v-row>
</template>

<script lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '~/composables/auth';

export default {
  name: 'LoginForm',

  setup() {
    const auth = useAuth();
    const router = useRouter();

    const formData = reactive({
      identity: '',
      password: '',
    });

    const error = ref('');
    const loading = ref(false);

    const handleLogin = async () => {
      if (!formData.identity || !formData.password) {
        error.value = 'Please enter both username and password';
        return;
      }

      loading.value = true;

      try {
        const success = await auth.login(formData);

        if (success) {
          // Navigate to dashboard or home
          router.push('/');
        } else {
          error.value = 'Invalid username or password';
        }
      } catch (err) {
        console.error('Login error:', err);
        error.value = 'An unexpected error occurred. Please try again.';
      } finally {
        loading.value = false;
      }
    };

    return {
      auth,
      router,
      formData,
      error,
      loading,
      handleLogin,
    };
  },
};
</script>
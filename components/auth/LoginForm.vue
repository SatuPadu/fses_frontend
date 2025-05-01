<template>
    <v-row class="d-flex mb-3">
        <v-col cols="12">
            <v-label class="font-weight-bold mb-1">Username</v-label>
            <v-text-field 
              v-model="formData.email"
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
                    <NuxtLink to="/forgot-password"
                        class="text-primary text-decoration-none text-body-1 opacity-1 font-weight-medium">Forgot
                        Password ?</NuxtLink>
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


<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';

// Import user store (adjust import path as needed for your project structure)
import { useUserStore } from '~/stores/modules/user';

const userStore = useUserStore();
const router = useRouter();

const formData = reactive({
  email: '',
  password: ''
});

const error = ref('');
const loading = ref(false);

const handleLogin = async () => {
  if (!formData.email || !formData.password) {
    error.value = 'Please enter both email and password';
    return;
  }
  
  loading.value = true;
  
  try {
    const response = await userStore.login(formData.email, formData.password);
    
    if (response.success) {
      // Redirect to dashboard or home page after successful login
      router.push('/');
    } else {
      error.value = response.error || 'Login failed';
    }
  } catch (err) {
    console.error('Login error:', err);
    error.value = 'An unexpected error occurred';
  } finally {
    loading.value = false;
  }
};
</script>
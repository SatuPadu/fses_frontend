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
                Forgot Password
              </v-card-title>
              <v-form
                ref="form"
                v-model="isFormValid"
                @submit.prevent="handleSubmit"
              >
                <v-row class="d-flex mb-3">
                  <v-col cols="12">
                    <v-label class="font-weight-bold mb-1">Email</v-label>
                    <v-text-field
                      v-model="email"
                      variant="outlined"
                      :rules="emailRules"
                      color="primary"
                      :disabled="loading"
                      placeholder="Enter your email"
                      :error-messages="error"
                      @keyup.enter="handleSubmit"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" class="pt-0">
                    <v-btn
                      color="primary"
                      size="large"
                      block
                      flat
                      :loading="loading"
                      :disabled="!isFormValid"
                      @click="handleSubmit"
                    >
                      Send Reset Link
                    </v-btn>
                  </v-col>

                  <v-col cols="12" class="pt-2">
                    <div class="d-flex justify-end">
                      <NuxtLink
                        to="/auth/login"
                        class="text-primary text-decoration-none text-body-2"
                      >
                        Back to Login
                      </NuxtLink>
                    </div>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-item>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'

definePageMeta({
  layout: "blank",
});

const router = useRouter()
const auth = useAuth()
const toast = useToast()
const form = ref()
const email = ref('')
const error = ref('')
const loading = ref(false)
const isFormValid = ref(false)

const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid'
]

const handleSubmit = async () => {
  const { valid } = await form.value.validate()
  
  if (!valid) return

  loading.value = true
  error.value = ''

  try {
    const result = await auth.sendResetLink(email.value)
    
    if (result.success) {
      toast.success('Reset Link Sent', 'Password reset link has been sent to your email')
      router.push('/auth/forgot-password-email-sent')
    } else {
      error.value = result.error || 'Failed to send reset link. Please try again.'
      toast.error('Failed to Send', 'Failed to send reset link. Please try again.')
    }
  } catch (err: any) {
    error.value = err?.message || 'An error occurred. Please try again.'
    toast.error('Error', 'An error occurred. Please try again.')
  } finally {
    loading.value = false
  }
}
</script> 
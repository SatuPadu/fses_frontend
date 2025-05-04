// plugins/pinia-persistence.ts
import { defineNuxtPlugin } from 'nuxt/app'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import type { Pinia } from 'pinia'

export default defineNuxtPlugin((nuxtApp) => {
  // Get the Pinia instance with proper typing
  const pinia = nuxtApp.$pinia as Pinia
  
  if (process.client && pinia) {
    // Only run on client side and when pinia is available
    pinia.use(
      createPersistedState({
        storage: localStorage,
        key: (id) => `utm-fses-${id}`,
      })
    )
  }
})
import { createPinia } from 'pinia';

// Re-export all module stores for easier imports
export * from './modules/user';

// Create and configure pinia
export const pinia = createPinia();
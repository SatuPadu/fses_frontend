<template>
  <div class="toast-container">
    <v-snackbar
      v-for="toast in toasts"
      :key="toast.id"
      :model-value="true"
      :color="getToastColor(toast.type)"
      :timeout="toast.persistent ? -1 : (toast.timeout || 2000)"
      location="top right"
      :multi-line="!!toast.message"
      class="toast-item"
      @update:model-value="(value) => !value && removeToast(toast.id)"
    >
      <div class="d-flex align-center">
        <v-icon 
          :icon="getToastIcon(toast.type)" 
          class="mr-3"
          size="24"
        />
        <div class="flex-grow-1">
          <div class="font-weight-medium">{{ toast.title }}</div>
          <div v-if="toast.message" class="text-body-2 mt-1 opacity-90">
            {{ toast.message }}
          </div>
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          class="ml-2"
          @click="removeToast(toast.id)"
        />
      </div>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast';

const { toasts, removeToast } = useToast();

const getToastColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'success';
    case 'error':
      return 'error';
    case 'warning':
      return 'warning';
    case 'info':
      return 'info';
    default:
      return 'primary';
  }
};

const getToastIcon = (type: string) => {
  switch (type) {
    case 'success':
      return 'mdi-check-circle';
    case 'error':
      return 'mdi-alert-circle';
    case 'warning':
      return 'mdi-alert';
    case 'info':
      return 'mdi-information';
    default:
      return 'mdi-bell';
  }
};
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
}

.toast-item {
  margin-bottom: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.toast-item:not(:last-child) {
  position: relative;
  transform: translateY(0);
}

:deep(.v-snackbar__content) {
  pointer-events: auto;
}

:deep(.v-btn) {
  pointer-events: auto;
}
</style> 
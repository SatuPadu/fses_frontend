import { ref, readonly } from 'vue';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  timeout?: number;
  persistent?: boolean;
}

const toasts = ref<ToastMessage[]>([]);

export const useToast = () => {
  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = {
      id,
      timeout: 5000, // Default 5 seconds
      ...toast,
    };
    
    toasts.value.push(newToast);
    
    // Auto remove toast after timeout (unless persistent)
    if (!newToast.persistent && newToast.timeout) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.timeout);
    }
    
    return id;
  };

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex(toast => toast.id === id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  };

  const clearAllToasts = () => {
    toasts.value = [];
  };

  // Convenience methods
  const success = (title: string, message?: string, options?: Partial<ToastMessage>) => {
    return addToast({ type: 'success', title, message, ...options });
  };

  const error = (title: string, message?: string, options?: Partial<ToastMessage>) => {
    return addToast({ type: 'error', title, message, ...options });
  };

  const warning = (title: string, message?: string, options?: Partial<ToastMessage>) => {
    return addToast({ type: 'warning', title, message, ...options });
  };

  const info = (title: string, message?: string, options?: Partial<ToastMessage>) => {
    return addToast({ type: 'info', title, message, ...options });
  };

  // API error handler - updated to match backend response structure
  const handleApiError = (error: any, defaultMessage = 'An error occurred') => {
    let errorMessage = defaultMessage;
    let errorTitle = 'Error';

    if (error?.response?.data) {
      const data = error.response.data;
      
      // Handle backend error response structure
      if (data.success === false) {
        // Use the message from backend
        if (data.message) {
          errorTitle = data.message;
        }
        
        // Handle validation errors in data field
        if (data.data && typeof data.data === 'object') {
          // For validation errors, show the first validation message
          const firstField = Object.keys(data.data)[0];
          if (firstField && Array.isArray(data.data[firstField])) {
            errorMessage = data.data[firstField][0];
          } else if (firstField) {
            errorMessage = data.data[firstField];
          }
        } else if (data.message) {
          // If no specific validation errors, use the main message
          errorMessage = data.message;
        }
      }
      // Legacy error handling for other formats
      else if (data.errors && typeof data.errors === 'object') {
        const firstError = Object.values(data.errors)[0];
        if (Array.isArray(firstError) && firstError.length > 0) {
          errorMessage = firstError[0] as string;
        }
        errorTitle = 'Validation Error';
      }
      else if (data.message) {
        errorMessage = data.message;
      }
      else if (typeof data === 'string') {
        errorMessage = data;
      }
    }
    // Handle network errors
    else if (error?.message) {
      errorMessage = error.message;
      errorTitle = 'Network Error';
    }

    // Set appropriate error title based on status code
    if (error?.response?.status) {
      switch (error.response.status) {
        case 401:
          errorTitle = 'Unauthorized';
          break;
        case 403:
          errorTitle = 'Forbidden';
          break;
        case 404:
          errorTitle = 'Not Found';
          break;
        case 422:
          errorTitle = 'Validation Error';
          break;
        case 500:
          errorTitle = 'Server Error';
          break;
      }
    }

    return addToast({
      type: 'error',
      title: errorTitle,
      message: errorMessage,
      timeout: 7000, // Longer timeout for errors
    });
  };

  // API success handler - for backend success responses
  const handleApiSuccess = (response: any, defaultMessage = 'Operation successful') => {
    let successMessage = defaultMessage;
    let successTitle = 'Success';

    if (response?.data) {
      const data = response.data;
      
      // Handle backend success response structure
      if (data.success === true && data.message) {
        successMessage = data.message;
      }
    }

    return addToast({
      type: 'success',
      title: successTitle,
      message: successMessage,
      timeout: 5000,
    });
  };

  return {
    toasts: readonly(toasts),
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info,
    handleApiError,
    handleApiSuccess,
  };
}; 
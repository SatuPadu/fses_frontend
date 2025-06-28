// Email validation regex pattern - more comprehensive
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const useValidation = () => {
  /**
   * Validates email format
   * @param email - The email string to validate
   * @returns Object with valid boolean and error message
   */
  const validateEmail = (email: string): { valid: boolean; message: string } => {
    if (!email) {
      return { valid: false, message: 'Email is required' };
    }
    
    // Trim whitespace
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) {
      return { valid: false, message: 'Email is required' };
    }
    
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return { valid: false, message: 'Please enter a valid email address' };
    }
    
    // Additional checks for common email issues
    if (trimmedEmail.length > 254) {
      return { valid: false, message: 'Email address is too long' };
    }
    
    if (trimmedEmail.includes('..')) {
      return { valid: false, message: 'Email address cannot contain consecutive dots' };
    }
    
    if (trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.')) {
      return { valid: false, message: 'Email address cannot start or end with a dot' };
    }
    
    return { valid: true, message: '' };
  };

  /**
   * Validates required field
   * @param value - The value to validate
   * @param fieldName - The name of the field for error message
   * @returns Object with valid boolean and error message
   */
  const validateRequired = (value: any, fieldName: string): { valid: boolean; message: string } => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return { valid: false, message: `${fieldName} is required` };
    }
    return { valid: true, message: '' };
  };

  return {
    validateEmail,
    validateRequired,
    EMAIL_REGEX
  };
}; 
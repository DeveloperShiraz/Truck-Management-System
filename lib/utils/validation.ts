export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule[];
}

export interface ValidationErrors {
  [key: string]: string;
}

export const validateField = (value: any, rules: ValidationRule[]): string | null => {
  for (const rule of rules) {
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return rule.message;
    }

    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      return rule.message;
    }

    if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
      return rule.message;
    }

    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return rule.message;
    }

    if (rule.custom && !rule.custom(value)) {
      return rule.message;
    }
  }

  return null;
};

export const validateForm = (data: Record<string, any>, rules: ValidationRules): ValidationErrors => {
  const errors: ValidationErrors = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    const error = validateField(data[field], fieldRules);
    if (error) {
      errors[field] = error;
    }
  }

  return errors;
};

// Common validation patterns
export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  phone: /^\+?[\d\s\-()]+$/,
  url: /^https?:\/\/.+/,
};

// Common validation rules
export const commonRules = {
  email: [
    { required: true, message: 'Email is required' },
    { pattern: patterns.email, message: 'Invalid email format' },
  ],
  password: [
    { required: true, message: 'Password is required' },
    { minLength: 8, message: 'Password must be at least 8 characters' },
  ],
  strongPassword: [
    { required: true, message: 'Password is required' },
    { minLength: 8, message: 'Password must be at least 8 characters' },
    { 
      pattern: patterns.password, 
      message: 'Password must contain uppercase, lowercase, and number' 
    },
  ],
  name: [
    { required: true, message: 'Name is required' },
    { minLength: 2, message: 'Name must be at least 2 characters' },
  ],
  fleetCode: [
    { required: true, message: 'Fleet code is required' },
    { minLength: 8, message: 'Fleet code must be 8 characters' },
    { maxLength: 8, message: 'Fleet code must be 8 characters' },
    { pattern: patterns.alphanumeric, message: 'Fleet code must be alphanumeric' },
  ],
};

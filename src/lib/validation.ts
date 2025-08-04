// Comprehensive validation utilities for authentication and forms

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Email validation with comprehensive checks
export const validateEmail = (email: string): string | null => {
  if (!email) {
    return 'Email is required';
  }
  
  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  
  // Check for common email issues
  if (email.length > 254) {
    return 'Email address is too long';
  }
  
  if (email.includes('..') || email.includes('--')) {
    return 'Email address contains invalid characters';
  }
  
  // Check for disposable email domains (optional)
  const disposableDomains = [
    'tempmail.org', '10minutemail.com', 'guerrillamail.com',
    'mailinator.com', 'yopmail.com', 'throwaway.email'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  if (domain && disposableDomains.includes(domain)) {
    return 'Please use a valid email address';
  }
  
  return null;
};

// Password validation with strength requirements
export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Password is required';
  }
  
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  
  if (password.length > 128) {
    return 'Password is too long';
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  
  // Check for at least one number
  if (!/\d/.test(password)) {
    return 'Password must contain at least one number';
  }
  
  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return 'Password must contain at least one special character (!@#$%^&*)';
  }
  
  // Check for common weak passwords
  const weakPasswords = [
    'password', '123456', 'qwerty', 'admin', 'letmein',
    'welcome', 'monkey', 'dragon', 'master', 'hello'
  ];
  
  if (weakPasswords.includes(password.toLowerCase())) {
    return 'Please choose a stronger password';
  }
  
  return null;
};

// Full name validation
export const validateFullName = (name: string): string | null => {
  if (!name) {
    return 'Full name is required';
  }
  
  if (name.length < 2) {
    return 'Full name must be at least 2 characters long';
  }
  
  if (name.length > 50) {
    return 'Full name is too long';
  }
  
  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(name)) {
    return 'Full name can only contain letters, spaces, hyphens, and apostrophes';
  }
  
  // Check for multiple spaces
  if (/\s{2,}/.test(name)) {
    return 'Full name cannot contain multiple consecutive spaces';
  }
  
  // Check for leading/trailing spaces
  if (name !== name.trim()) {
    return 'Full name cannot start or end with spaces';
  }
  
  return null;
};

// Phone number validation for Indian numbers
export const validatePhone = (phone: string): string | null => {
  if (!phone) {
    return 'Phone number is required';
  }
  
  // Remove any non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length !== 10) {
    return 'Phone number must be exactly 10 digits';
  }
  
  // Check if it starts with a valid Indian mobile prefix
  const validPrefixes = ['6', '7', '8', '9'];
  if (!validPrefixes.includes(cleanPhone[0])) {
    return 'Please enter a valid Indian mobile number';
  }
  
  // Check for repeated digits (likely fake numbers)
  if (/(\d)\1{4,}/.test(cleanPhone)) {
    return 'Please enter a valid phone number';
  }
  
  return null;
};

// Confirm password validation
export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  
  return null;
};

// Comprehensive form validation for sign up
export const validateSignUpForm = (formData: {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};
  
  // Validate email
  const emailError = validateEmail(formData.email);
  if (emailError) {
    errors.email = emailError;
  }
  
  // Validate password
  const passwordError = validatePassword(formData.password);
  if (passwordError) {
    errors.password = passwordError;
  }
  
  // Validate confirm password
  const confirmPasswordError = validateConfirmPassword(formData.password, formData.confirmPassword);
  if (confirmPasswordError) {
    errors.confirmPassword = confirmPasswordError;
  }
  
  // Validate full name
  const fullNameError = validateFullName(formData.fullName);
  if (fullNameError) {
    errors.fullName = fullNameError;
  }
  
  // Validate phone
  const phoneError = validatePhone(formData.phone);
  if (phoneError) {
    errors.phone = phoneError;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Form validation for sign in
export const validateSignInForm = (formData: {
  email: string;
  password: string;
}): ValidationResult => {
  const errors: Record<string, string> = {};
  
  // Validate email
  const emailError = validateEmail(formData.email);
  if (emailError) {
    errors.email = emailError;
  }
  
  // Basic password validation for sign in
  if (!formData.password) {
    errors.password = 'Password is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Real-time validation for input fields
export const validateField = (fieldName: string, value: string, formData?: any): string | null => {
  switch (fieldName) {
    case 'email':
      return validateEmail(value);
    case 'password':
      return validatePassword(value);
    case 'confirmPassword':
      return formData ? validateConfirmPassword(formData.password, value) : null;
    case 'fullName':
      return validateFullName(value);
    case 'phone':
      return validatePhone(value);
    default:
      return null;
  }
};

// Password strength indicator
export const getPasswordStrength = (password: string): {
  score: number;
  label: string;
  color: string;
} => {
  if (!password) {
    return { score: 0, label: '', color: 'gray' };
  }
  
  let score = 0;
  
  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Character variety checks
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
  
  // Additional complexity
  if (password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password)) {
    score += 1;
  }
  
  if (score <= 2) {
    return { score, label: 'Weak', color: 'red' };
  } else if (score <= 4) {
    return { score, label: 'Fair', color: 'orange' };
  } else if (score <= 6) {
    return { score, label: 'Good', color: 'yellow' };
  } else {
    return { score, label: 'Strong', color: 'green' };
  }
}; 
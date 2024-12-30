/**
 * Custom type for email validation
 */
export type EmailType = string & { readonly __emailBrand: unique symbol };

/**
 * Custom type for phone number validation
 */
export type PhoneNumberType = string & { readonly __phoneNumberBrand: unique symbol };

/**
 * Custom type for password validation
 */
export type PasswordType = string & { readonly __passwordBrand: unique symbol };

/**
 * Email validator
 */
export function validateEmail(email: string): EmailType {
  const emailRegex = /^(?!.*\.\.)[a-zA-Z0-9](?:[a-zA-Z0-9._%+-]*[a-zA-Z0-9])?@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }
  return email as EmailType;
}

/**
 * Phone number validator
 */
export function validatePhoneNumber(phone: string): PhoneNumberType {
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  if (!phoneRegex.test(phone)) {
    throw new Error('Invalid phone number format');
  }
  return phone as PhoneNumberType;
}

/**
 * Password validator
 * Requires:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export function validatePassword(password: string): PasswordType {
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
    throw new Error('Password must contain uppercase, lowercase, numbers and special characters');
  }

  return password as PasswordType;
}

/**
 * Constants for user roles and validation
 */
export const USER_CONSTANTS = {
  ROLES: {
    CUSTOMER: 'Customer',
    ADMIN: 'Admin'
  } as const,
  
  VALIDATION: {
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 50,
    PASSWORD_MIN_LENGTH: 8
  } as const
} as const;

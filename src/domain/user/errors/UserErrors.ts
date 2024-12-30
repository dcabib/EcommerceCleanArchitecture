/**
 * Custom error for when a user already exists with the given email or username
 */
export class UserAlreadyExistsError extends Error {
  constructor(message: string = 'User with this email or username already exists') {
    super(message);
    this.name = 'UserAlreadyExistsError';
  }
}

/**
 * Custom error for invalid user data
 */
export class InvalidUserDataError extends Error {
  constructor(field: string, message: string) {
    super(`Invalid ${field}: ${message}`);
    this.name = 'InvalidUserDataError';
  }
}

export interface IPasswordHasher {
  /**
   * Hash a plain text password
   * @param password The plain text password to hash
   * @returns Promise resolving to the hashed password
   */
  hash(password: string): Promise<string>;

  /**
   * Compare a plain text password with a hashed password
   * @param password The plain text password to compare
   * @param hashedPassword The hashed password to compare against
   * @returns Promise resolving to true if the passwords match, false otherwise
   */
  compare(password: string, hashedPassword: string): Promise<boolean>;
}

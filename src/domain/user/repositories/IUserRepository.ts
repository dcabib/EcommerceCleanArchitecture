import { User } from '../entities/User';

export interface IUserRepository {
  /**
   * Find a user by their unique identifier
   * @param userId The unique identifier of the user
   * @returns Promise resolving to the user if found, null otherwise
   */
  findById(userId: string): Promise<User | null>;

  /**
   * Find a user by their email address
   * @param email The email address to search for
   * @returns Promise resolving to the user if found, null otherwise
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find a user by their username
   * @param username The username to search for
   * @returns Promise resolving to the user if found, null otherwise
   */
  findByUsername(username: string): Promise<User | null>;

  /**
   * Save a new user or update an existing one
   * @param user The user to save or update
   * @returns Promise resolving to the saved user
   */
  save(user: User): Promise<User>;

  /**
   * Delete a user by their unique identifier
   * @param userId The unique identifier of the user to delete
   * @returns Promise resolving to true if user was deleted, false if user was not found
   */
  delete(userId: string): Promise<boolean>;

  /**
   * Find all users with a specific role
   * @param role The role to search for
   * @returns Promise resolving to an array of users with the specified role
   */
  findByRole(role: string): Promise<User[]>;

  /**
   * Find all users
   * @param page The page number (for pagination)
   * @param limit The number of users per page
   * @returns Promise resolving to an array of users
   */
  findAll(page: number, limit: number): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }>;

  /**
   * Check if a user exists by email or username
   * @param email The email to check
   * @param username The username to check
   * @returns Promise resolving to true if a user exists with either the email or username
   */
  exists(email: string, username: string): Promise<boolean>;

  /**
   * Count total number of users
   * @returns Promise resolving to the total number of users
   */
  count(): Promise<number>;
}

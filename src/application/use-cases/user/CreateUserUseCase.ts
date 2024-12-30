import { User, Address, UserRole } from '../../../domain/user/entities/User';
import { IUserRepository } from '../../../domain/user/repositories/IUserRepository';
import { IPasswordHasher } from '../../interfaces/IPasswordHasher';
import { ICreateUserUseCase, CreateUserDTO, CreateUserResponseDTO } from '../../interfaces/ICreateUserUseCase';
import { UserAlreadyExistsError, InvalidUserDataError } from '../../../domain/user/errors/UserErrors';
import { validateEmail, validatePassword, validatePhoneNumber, USER_CONSTANTS } from '../../../domain/user/types/UserTypes';

/**
 * Use case for creating a new user in the system
 * Implements validation, password hashing, and persistence
 */
export class CreateUserUseCase implements ICreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly idGenerator: { generate(): string }
  ) {}

  /**
   * Creates a new user with the provided data
   * @param dto The user data transfer object containing all required user information
   * @returns A promise that resolves to the created user's data
   * @throws {UserAlreadyExistsError} If a user with the same email or username already exists
   * @throws {InvalidUserDataError} If any of the provided data is invalid
   */
  async execute(dto: CreateUserDTO): Promise<CreateUserResponseDTO> {
    // Validate username
    if (dto.username.length < USER_CONSTANTS.VALIDATION.USERNAME_MIN_LENGTH || 
        dto.username.length > USER_CONSTANTS.VALIDATION.USERNAME_MAX_LENGTH) {
      throw new InvalidUserDataError('username', 
        `Username must be between ${USER_CONSTANTS.VALIDATION.USERNAME_MIN_LENGTH} and ${USER_CONSTANTS.VALIDATION.USERNAME_MAX_LENGTH} characters`);
    }

    // Validate email and phone number
    try {
      validateEmail(dto.email);
      validatePhoneNumber(dto.phoneNumber);
      validatePassword(dto.password);
    } catch (error: any) {
      throw new InvalidUserDataError(
        error.field || 'validation',
        error.message || 'Invalid input data'
      );
    }

    // Validate address
    this.validateAddress(dto.billingAddress);
    dto.shippingAddresses?.forEach(addr => this.validateAddress(addr));

    // Check if user already exists
    const exists = await this.userRepository.exists(dto.email, dto.username);
    if (exists) {
      throw new UserAlreadyExistsError();
    }

    // Hash the password
    const passwordHash = await this.passwordHasher.hash(dto.password);

    // Generate unique ID
    const userId = this.idGenerator.generate();

    // Create user entity
    const user = User.create(
      userId,
      dto.username,
      dto.email,
      passwordHash,
      dto.billingAddress,
      dto.phoneNumber,
      dto.role || USER_CONSTANTS.ROLES.CUSTOMER,
      dto.shippingAddresses
    );

    // Save to repository
    const savedUser = await this.userRepository.save(user);

    // Return DTO
    return {
      userId: savedUser.userId,
      username: savedUser.username,
      email: savedUser.email,
      billingAddress: savedUser.billingAddress,
      phoneNumber: savedUser.phoneNumber,
      role: savedUser.role,
      shippingAddresses: savedUser.shippingAddresses
    };
  }

  /**
   * Validates an address object
   * @param address The address to validate
   * @throws {InvalidUserDataError} If the address is invalid
   */
  private validateAddress(address: Address): void {
    if (!address.street || !address.city || !address.state || 
        !address.postalCode || !address.country) {
      throw new InvalidUserDataError('address', 'All address fields are required');
    }
  }
}

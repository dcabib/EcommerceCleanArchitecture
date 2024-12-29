import { User, Address, UserRole } from '../../../domain/user/entities/User';
import { IUserRepository } from '../../../domain/user/repositories/IUserRepository';
import { IPasswordHasher } from '../../interfaces/IPasswordHasher';

export interface CreateUserDTO {
  username: string;
  email: string;
  password: string;
  billingAddress: Address;
  phoneNumber: string;
  role?: UserRole;
  shippingAddresses?: Address[];
}

export interface CreateUserResponseDTO {
  userId: string;
  username: string;
  email: string;
  billingAddress: Address;
  phoneNumber: string;
  role: UserRole;
  shippingAddresses: Address[];
}

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly idGenerator: { generate(): string }
  ) {}

  async execute(dto: CreateUserDTO): Promise<CreateUserResponseDTO> {
    // Check if user already exists
    const exists = await this.userRepository.exists(dto.email, dto.username);
    if (exists) {
      throw new Error('User with this email or username already exists');
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
      dto.role,
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
}

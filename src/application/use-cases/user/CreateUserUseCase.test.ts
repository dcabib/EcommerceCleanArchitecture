import { CreateUserUseCase } from './CreateUserUseCase';
import { CreateUserDTO } from '../../interfaces/ICreateUserUseCase';
import { UserAlreadyExistsError, InvalidUserDataError } from '../../../domain/user/errors/UserErrors';
import { USER_CONSTANTS } from '../../../domain/user/types/UserTypes';
import { IUserRepository } from '../../../domain/user/repositories/IUserRepository';
import { IPasswordHasher } from '../../interfaces/IPasswordHasher';
import { User, Address } from '../../../domain/user/entities/User';

describe('CreateUserUseCase', () => {
  // Mock implementations
  class MockUserRepository implements IUserRepository {
    private users: User[] = [];

    async findById(userId: string): Promise<User | null> {
      return this.users.find(u => u.userId === userId) || null;
    }

    async findByEmail(email: string): Promise<User | null> {
      return this.users.find(u => u.email === email) || null;
    }

    async findByUsername(username: string): Promise<User | null> {
      return this.users.find(u => u.username === username) || null;
    }

    async save(user: User): Promise<User> {
      const existingUserIndex = this.users.findIndex(u => u.userId === user.userId);
      if (existingUserIndex >= 0) {
        this.users[existingUserIndex] = user;
      } else {
        this.users.push(user);
      }
      return user;
    }

    async delete(userId: string): Promise<boolean> {
      const initialLength = this.users.length;
      this.users = this.users.filter(u => u.userId !== userId);
      return this.users.length !== initialLength;
    }

    async findByRole(role: string): Promise<User[]> {
      return this.users.filter(u => u.role === role);
    }

    async findAll(page: number, limit: number): Promise<{
      users: User[];
      total: number;
      page: number;
      totalPages: number;
    }> {
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedUsers = this.users.slice(start, end);
      return {
        users: paginatedUsers,
        total: this.users.length,
        page,
        totalPages: Math.ceil(this.users.length / limit)
      };
    }

    async exists(email: string, username: string): Promise<boolean> {
      return this.users.some(u => u.email === email || u.username === username);
    }

    async count(): Promise<number> {
      return this.users.length;
    }
  }

  class MockPasswordHasher implements IPasswordHasher {
    async hash(password: string): Promise<string> {
      return `hashed_${password}`;
    }

    async compare(password: string, hashedPassword: string): Promise<boolean> {
      return `hashed_${password}` === hashedPassword;
    }
  }

  const mockIdGenerator = {
    generate: () => 'generated-id'
  };

  let useCase: CreateUserUseCase;
  let userRepository: MockUserRepository;
  let passwordHasher: MockPasswordHasher;

  const validAddress: Address = {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'USA'
  };

  const validCreateUserDTO: CreateUserDTO = {
    username: 'johndoe',
    email: 'john@example.com',
    password: 'Password123!',
    billingAddress: validAddress,
    phoneNumber: '1234567890'
  };

  beforeEach(() => {
    userRepository = new MockUserRepository();
    passwordHasher = new MockPasswordHasher();
    useCase = new CreateUserUseCase(userRepository, passwordHasher, mockIdGenerator);
  });

  it('should create a new user successfully', async () => {
    const result = await useCase.execute(validCreateUserDTO);

    expect(result).toEqual({
      userId: 'generated-id',
      username: validCreateUserDTO.username,
      email: validCreateUserDTO.email,
      billingAddress: validCreateUserDTO.billingAddress,
      phoneNumber: validCreateUserDTO.phoneNumber,
      role: 'Customer',
      shippingAddresses: []
    });

    // Verify user was saved to repository
    const savedUser = await userRepository.findById('generated-id');
    expect(savedUser).not.toBeNull();
    expect(savedUser?.email).toBe(validCreateUserDTO.email);
  });

  it('should throw error if user with email already exists', async () => {
    // First create a user
    await useCase.execute(validCreateUserDTO);

    // Try to create another user with the same email
    await expect(useCase.execute(validCreateUserDTO))
      .rejects
      .toThrow(UserAlreadyExistsError);
  });

  it('should throw error if user with username already exists', async () => {
    // First create a user
    await useCase.execute(validCreateUserDTO);

    // Try to create another user with the same username but different email
    const duplicateUsername = {
      ...validCreateUserDTO,
      email: 'different@example.com'
    };

    await expect(useCase.execute(duplicateUsername))
      .rejects
      .toThrow(UserAlreadyExistsError);
  });

  it('should create user with custom role', async () => {
    const adminDTO = {
      ...validCreateUserDTO,
      role: 'Admin' as const
    };

    const result = await useCase.execute(adminDTO);
    expect(result.role).toBe('Admin');
  });

  it('should create user with shipping addresses', async () => {
    const dtoWithShipping = {
      ...validCreateUserDTO,
      shippingAddresses: [validAddress]
    };

    const result = await useCase.execute(dtoWithShipping);
    expect(result.shippingAddresses).toHaveLength(1);
    expect(result.shippingAddresses[0]).toEqual(validAddress);
  });

  it('should hash the password before saving', async () => {
    const spy = jest.spyOn(passwordHasher, 'hash');
    
    await useCase.execute(validCreateUserDTO);
    
    expect(spy).toHaveBeenCalledWith(validCreateUserDTO.password);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  describe('Validation Tests', () => {
    it('should throw error for invalid email format', async () => {
      const invalidEmail = {
        ...validCreateUserDTO,
        email: 'invalid-email'
      };

      await expect(useCase.execute(invalidEmail))
        .rejects
        .toThrow(InvalidUserDataError);
    });

    it('should throw error for invalid phone number', async () => {
      const invalidPhone = {
        ...validCreateUserDTO,
        phoneNumber: '123'
      };

      await expect(useCase.execute(invalidPhone))
        .rejects
        .toThrow(InvalidUserDataError);
    });

    it('should throw error for weak password', async () => {
      const weakPassword = {
        ...validCreateUserDTO,
        password: 'weak'
      };

      await expect(useCase.execute(weakPassword))
        .rejects
        .toThrow(InvalidUserDataError);
    });

    it('should throw error for username too short', async () => {
      const shortUsername = {
        ...validCreateUserDTO,
        username: 'a'
      };

      await expect(useCase.execute(shortUsername))
        .rejects
        .toThrow(InvalidUserDataError);
    });

    it('should throw error for username too long', async () => {
      const longUsername = {
        ...validCreateUserDTO,
        username: 'a'.repeat(USER_CONSTANTS.VALIDATION.USERNAME_MAX_LENGTH + 1)
      };

      await expect(useCase.execute(longUsername))
        .rejects
        .toThrow(InvalidUserDataError);
    });

    it('should throw error for incomplete billing address', async () => {
      const incompleteAddress = {
        ...validCreateUserDTO,
        billingAddress: {
          ...validAddress,
          street: '' // Missing required field
        }
      };

      await expect(useCase.execute(incompleteAddress))
        .rejects
        .toThrow(InvalidUserDataError);
    });

    it('should throw error for incomplete shipping address', async () => {
      const incompleteShippingAddress = {
        ...validCreateUserDTO,
        shippingAddresses: [{
          ...validAddress,
          city: '' // Missing required field
        }]
      };

      await expect(useCase.execute(incompleteShippingAddress))
        .rejects
        .toThrow(InvalidUserDataError);
    });
  });
});

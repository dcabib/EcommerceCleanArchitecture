import { CreateUserUseCase, CreateUserDTO } from './CreateUserUseCase';
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
    password: 'password123',
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
      .toThrow('User with this email or username already exists');
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
      .toThrow('User with this email or username already exists');
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
});

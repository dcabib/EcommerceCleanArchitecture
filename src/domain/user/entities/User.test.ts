import { User, Address, UserRole } from './User';

describe('User Entity', () => {
  const validAddress: Address = {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'USA'
  };

  const validUserData = {
    userId: '123',
    username: 'johndoe',
    email: 'john@example.com',
    passwordHash: 'hashedpassword123',
    billingAddress: validAddress,
    phoneNumber: '1234567890',
    role: 'Customer' as UserRole,
    shippingAddresses: [] as Address[]
  };

  describe('User Creation', () => {
    it('should create a valid user', () => {
      const user = User.create(
        validUserData.userId,
        validUserData.username,
        validUserData.email,
        validUserData.passwordHash,
        validUserData.billingAddress,
        validUserData.phoneNumber
      );

      expect(user.userId).toBe(validUserData.userId);
      expect(user.username).toBe(validUserData.username);
      expect(user.email).toBe(validUserData.email);
      expect(user.billingAddress).toEqual(validUserData.billingAddress);
      expect(user.phoneNumber).toBe(validUserData.phoneNumber);
      expect(user.role).toBe('Customer'); // Default role
      expect(user.shippingAddresses).toEqual([]); // Default empty array
    });

    it('should throw error for invalid email', () => {
      expect(() => {
        User.create(
          validUserData.userId,
          validUserData.username,
          'invalid-email',
          validUserData.passwordHash,
          validUserData.billingAddress,
          validUserData.phoneNumber
        );
      }).toThrow('Invalid email format');
    });

    it('should throw error for missing required fields', () => {
      // Test each required field
      expect(() => User.create('', validUserData.username, validUserData.email, validUserData.passwordHash, validUserData.billingAddress, validUserData.phoneNumber))
        .toThrow('User ID is required');
      
      expect(() => User.create(validUserData.userId, '', validUserData.email, validUserData.passwordHash, validUserData.billingAddress, validUserData.phoneNumber))
        .toThrow('Username is required');
      
      expect(() => User.create(validUserData.userId, validUserData.username, '', validUserData.passwordHash, validUserData.billingAddress, validUserData.phoneNumber))
        .toThrow('Email is required');
      
      expect(() => User.create(validUserData.userId, validUserData.username, validUserData.email, '', validUserData.billingAddress, validUserData.phoneNumber))
        .toThrow('Password hash is required');
      
      expect(() => User.create(validUserData.userId, validUserData.username, validUserData.email, validUserData.passwordHash, null as any, validUserData.phoneNumber))
        .toThrow('Billing address is required');
      
      expect(() => User.create(validUserData.userId, validUserData.username, validUserData.email, validUserData.passwordHash, validUserData.billingAddress, ''))
        .toThrow('Phone number is required');
    });
  });

  describe('User Updates', () => {
    let user: User;

    beforeEach(() => {
      user = User.create(
        validUserData.userId,
        validUserData.username,
        validUserData.email,
        validUserData.passwordHash,
        validUserData.billingAddress,
        validUserData.phoneNumber
      );
    });

    it('should update username', () => {
      const newUsername = 'janedoe';
      user.updateUsername(newUsername);
      expect(user.username).toBe(newUsername);
    });

    it('should throw error for empty username', () => {
      expect(() => {
        user.updateUsername('');
      }).toThrow('Username cannot be empty');
    });

    it('should update email with valid format', () => {
      const newEmail = 'jane@example.com';
      user.updateEmail(newEmail);
      expect(user.email).toBe(newEmail);
    });

    it('should throw error for invalid email format', () => {
      expect(() => {
        user.updateEmail('invalid-email');
      }).toThrow('Invalid email format');
    });

    it('should throw error for empty email', () => {
      expect(() => {
        user.updateEmail('');
      }).toThrow('Email cannot be empty');
    });

    it('should update password hash', () => {
      const newHash = 'newhash123';
      user.updatePasswordHash(newHash);
      expect(user['_passwordHash']).toBe(newHash);
    });

    it('should throw error for empty password hash', () => {
      expect(() => {
        user.updatePasswordHash('');
      }).toThrow('Password hash cannot be empty');
    });

    it('should update phone number', () => {
      const newPhone = '9876543210';
      user.updatePhoneNumber(newPhone);
      expect(user.phoneNumber).toBe(newPhone);
    });

    it('should throw error for empty phone number', () => {
      expect(() => {
        user.updatePhoneNumber('');
      }).toThrow('Phone number cannot be empty');
    });

    it('should update billing address', () => {
      const newAddress: Address = {
        street: '456 Oak St',
        city: 'Boston',
        state: 'MA',
        postalCode: '02108',
        country: 'USA'
      };
      user.updateBillingAddress(newAddress);
      expect(user.billingAddress).toEqual(newAddress);
    });

    it('should throw error for null billing address', () => {
      expect(() => {
        user.updateBillingAddress(null as any);
      }).toThrow('Billing address cannot be empty');
    });

    it('should update role', () => {
      user.updateRole('Admin');
      expect(user.role).toBe('Admin');
    });
  });

  describe('Shipping Address Management', () => {
    let user: User;

    beforeEach(() => {
      user = User.create(
        validUserData.userId,
        validUserData.username,
        validUserData.email,
        validUserData.passwordHash,
        validUserData.billingAddress,
        validUserData.phoneNumber
      );
    });

    it('should add shipping address', () => {
      const newAddress: Address = {
        street: '789 Pine St',
        city: 'Chicago',
        state: 'IL',
        postalCode: '60601',
        country: 'USA'
      };
      user.addShippingAddress(newAddress);
      expect(user.shippingAddresses).toHaveLength(1);
      expect(user.shippingAddresses[0]).toEqual(newAddress);
    });

    it('should throw error for null shipping address', () => {
      expect(() => {
        user.addShippingAddress(null as any);
      }).toThrow('Shipping address cannot be empty');
    });

    it('should remove shipping address', () => {
      const address1: Address = {
        street: '789 Pine St',
        city: 'Chicago',
        state: 'IL',
        postalCode: '60601',
        country: 'USA'
      };
      const address2: Address = {
        street: '321 Elm St',
        city: 'Miami',
        state: 'FL',
        postalCode: '33101',
        country: 'USA'
      };

      user.addShippingAddress(address1);
      user.addShippingAddress(address2);
      expect(user.shippingAddresses).toHaveLength(2);

      user.removeShippingAddress(0);
      expect(user.shippingAddresses).toHaveLength(1);
      expect(user.shippingAddresses[0]).toEqual(address2);
    });

    it('should throw error when removing invalid shipping address index', () => {
      expect(() => {
        user.removeShippingAddress(0);
      }).toThrow('Invalid shipping address index');

      expect(() => {
        user.removeShippingAddress(-1);
      }).toThrow('Invalid shipping address index');

      const address: Address = {
        street: '789 Pine St',
        city: 'Chicago',
        state: 'IL',
        postalCode: '60601',
        country: 'USA'
      };
      user.addShippingAddress(address);

      expect(() => {
        user.removeShippingAddress(1);
      }).toThrow('Invalid shipping address index');
    });
  });

  describe('Email Validation - valid emails ', () => {
    it('should validate various email formats', () => {
      const validEmails = [
        'test@example.com',
        'test.name@example.com',
        'test+label@example.com',
        'test@subdomain.example.com',
        'test@example.co.uk',
        '123@example.com',
        'test_name@example.com'
      ];

      // Valid emails should not throw errors
      validEmails.forEach(email => {
        expect(() => {
          User.create(
            validUserData.userId,
            validUserData.username,
            email,
            validUserData.passwordHash,
            validUserData.billingAddress,
            validUserData.phoneNumber
          );
        }).not.toThrow();
      });
    });
  });

  describe('Email Validation - invalid emails', () => {
    it('should validate various email formats', () => {

      const invalidEmails = [
        '',
        '@example.com',
        'test@',
        'test@.com',
        'test@example.',
        'test@exam ple.com',
        'test@example..com',
        '.test@example.com',
        'test.@example.com',
        'test..name@example.com'
      ];

      const invalidEmailsWithoutNull = [
        '@example.com',
        'test@',
        'test@.com',
        'test@example.',
        'test@exam ple.com',
        'test@example..com',
        '.test@example.com',
        'test.@example.com',
        'test..name@example.com'
      ];

      // Invalid emails should throw errors
      invalidEmailsWithoutNull.forEach(email => {
        expect(() => {
          User.create(
            validUserData.userId,
            validUserData.username,
            email,
            validUserData.passwordHash,
            validUserData.billingAddress,
            validUserData.phoneNumber
          );
        }).toThrow('Invalid email format');
      });
    });
  });

  describe('Utility Methods', () => {
    let user: User;

    beforeEach(() => {
      user = User.create(
        validUserData.userId,
        validUserData.username,
        validUserData.email,
        validUserData.passwordHash,
        validUserData.billingAddress,
        validUserData.phoneNumber
      );
    });

    it('should compare users correctly', () => {
      const sameUser = User.create(
        validUserData.userId,
        'different',
        'different@example.com',
        'different',
        validUserData.billingAddress,
        'different'
      );
      const differentUser = User.create(
        'different-id',
        validUserData.username,
        validUserData.email,
        validUserData.passwordHash,
        validUserData.billingAddress,
        validUserData.phoneNumber
      );

      expect(user.equals(sameUser)).toBe(true);
      expect(user.equals(differentUser)).toBe(false);
    });

    it('should clone user correctly', () => {
      const clone = user.clone();
      expect(clone).not.toBe(user); // Different instance
      expect(clone.userId).toBe(user.userId);
      expect(clone.username).toBe(user.username);
      expect(clone.email).toBe(user.email);
      expect(clone.billingAddress).toEqual(user.billingAddress);
      expect(clone.phoneNumber).toBe(user.phoneNumber);
      expect(clone.role).toBe(user.role);
      expect(clone.shippingAddresses).toEqual(user.shippingAddresses);

      // Test deep cloning of addresses
      const shippingAddress: Address = {
        street: '789 Pine St',
        city: 'Chicago',
        state: 'IL',
        postalCode: '60601',
        country: 'USA'
      };
      user.addShippingAddress(shippingAddress);
      const cloneWithAddress = user.clone();
      expect(cloneWithAddress.shippingAddresses[0]).toEqual(shippingAddress);
      expect(cloneWithAddress.shippingAddresses[0]).not.toBe(shippingAddress);
    });
  });
});

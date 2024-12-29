export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export type UserRole = 'Customer' | 'Admin';

export class User {
  private constructor(
    private readonly _userId: string,
    private _username: string,
    private _email: string,
    private _passwordHash: string,
    private _billingAddress: Address,
    private _phoneNumber: string,
    private _role: UserRole,
    private _shippingAddresses: Address[]
  ) {}

  // Factory method for creating a new user
  static create(
    userId: string,
    username: string,
    email: string,
    passwordHash: string,
    billingAddress: Address,
    phoneNumber: string,
    role: UserRole = 'Customer',
    shippingAddresses: Address[] = []
  ): User {
    if (!userId) throw new Error('User ID is required');
    if (!username) throw new Error('Username is required');
    if (!email) throw new Error('Email is required');
    if (!this.isValidEmail(email)) throw new Error('Invalid email format');
    if (!passwordHash) throw new Error('Password hash is required');
    if (!billingAddress) throw new Error('Billing address is required');
    if (!phoneNumber) throw new Error('Phone number is required');

    return new User(
      userId,
      username,
      email,
      passwordHash,
      billingAddress,
      phoneNumber,
      role,
      shippingAddresses
    );
  }

  // Getters
  get userId(): string {
    return this._userId;
  }

  get username(): string {
    return this._username;
  }

  get email(): string {
    return this._email;
  }

  get billingAddress(): Address {
    return { ...this._billingAddress };
  }

  get phoneNumber(): string {
    return this._phoneNumber;
  }

  get role(): UserRole {
    return this._role;
  }

  get shippingAddresses(): Address[] {
    return [...this._shippingAddresses];
  }

  // Setters with validation
  updateUsername(username: string): void {
    if (!username) throw new Error('Username cannot be empty');
    this._username = username;
  }

  updateEmail(email: string): void {
    if (!email) throw new Error('Email cannot be empty');
    if (!User.isValidEmail(email)) throw new Error('Invalid email format');
    this._email = email;
  }

  updatePasswordHash(passwordHash: string): void {
    if (!passwordHash) throw new Error('Password hash cannot be empty');
    this._passwordHash = passwordHash;
  }

  updateBillingAddress(address: Address): void {
    if (!address) throw new Error('Billing address cannot be empty');
    this._billingAddress = { ...address };
  }

  updatePhoneNumber(phoneNumber: string): void {
    if (!phoneNumber) throw new Error('Phone number cannot be empty');
    this._phoneNumber = phoneNumber;
  }

  updateRole(role: UserRole): void {
    this._role = role;
  }

  addShippingAddress(address: Address): void {
    if (!address) throw new Error('Shipping address cannot be empty');
    this._shippingAddresses.push({ ...address });
  }

  removeShippingAddress(index: number): void {
    if (index < 0 || index >= this._shippingAddresses.length) {
      throw new Error('Invalid shipping address index');
    }
    this._shippingAddresses.splice(index, 1);
  }

  // Utility methods
  private static isValidEmail(email: string): boolean {
    // More comprehensive email validation
    const emailRegex = /^(?!.*\.\.)[a-zA-Z0-9](?:[a-zA-Z0-9._%+-]*[a-zA-Z0-9])?@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  // For comparing users
  equals(other: User): boolean {
    return this._userId === other.userId;
  }

  // For creating a copy of the user
  clone(): User {
    return new User(
      this._userId,
      this._username,
      this._email,
      this._passwordHash,
      { ...this._billingAddress },
      this._phoneNumber,
      this._role,
      this._shippingAddresses.map(addr => ({ ...addr }))
    );
  }
}

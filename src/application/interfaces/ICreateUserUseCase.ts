import { Address, UserRole } from '../../../domain/user/entities/User';
import { EmailType, PhoneNumberType, PasswordType } from '../../../domain/user/types/UserTypes';

export interface CreateUserDTO {
  username: string;
  email: EmailType;
  password: PasswordType;
  billingAddress: Address;
  phoneNumber: PhoneNumberType;
  role?: UserRole;
  shippingAddresses?: Address[];
}

export interface CreateUserResponseDTO {
  userId: string;
  username: string;
  email: EmailType;
  billingAddress: Address;
  phoneNumber: PhoneNumberType;
  role: UserRole;
  shippingAddresses: Address[];
}

export interface ICreateUserUseCase {
  execute(dto: CreateUserDTO): Promise<CreateUserResponseDTO>;
}

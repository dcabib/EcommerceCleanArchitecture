import { Role } from './Role';

describe('Role Entity', () => {
  const validRoleData = {
    roleId: 'role-123',
    name: 'Admin'
  };

  describe('Role Creation', () => {
    it('should create a valid role', () => {
      const role = Role.create(validRoleData.roleId, validRoleData.name);

      expect(role.roleId).toBe(validRoleData.roleId);
      expect(role.name).toBe(validRoleData.name);
    });

    it('should throw error for missing required fields', () => {
      expect(() => {
        Role.create('', validRoleData.name);
      }).toThrow('Role ID is required');

      expect(() => {
        Role.create(validRoleData.roleId, '');
      }).toThrow('Role name is required');
    });
  });

  describe('Role Updates', () => {
    let role: Role;

    beforeEach(() => {
      role = Role.create(validRoleData.roleId, validRoleData.name);
    });

    it('should update name', () => {
      const newName = 'SuperAdmin';
      role.updateName(newName);
      expect(role.name).toBe(newName);
    });

    it('should throw error for invalid name update', () => {
      expect(() => {
        role.updateName('');
      }).toThrow('Role name cannot be empty');
    });
  });

  describe('Utility Methods', () => {
    let role: Role;

    beforeEach(() => {
      role = Role.create(validRoleData.roleId, validRoleData.name);
    });

    it('should compare roles correctly', () => {
      const sameRole = Role.create(validRoleData.roleId, 'Different Name');
      const differentRole = Role.create('different-id', validRoleData.name);

      expect(role.equals(sameRole)).toBe(true);
      expect(role.equals(differentRole)).toBe(false);
    });

    it('should clone role correctly', () => {
      const clone = role.clone();

      expect(clone).not.toBe(role); // Different instance
      expect(clone.roleId).toBe(role.roleId);
      expect(clone.name).toBe(role.name);
    });
  });
});

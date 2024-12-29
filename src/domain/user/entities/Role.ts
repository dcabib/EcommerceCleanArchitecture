export class Role {
  private constructor(
    private readonly _roleId: string,
    private _name: string
  ) {}

  static create(roleId: string, name: string): Role {
    if (!roleId) throw new Error('Role ID is required');
    if (!name) throw new Error('Role name is required');

    return new Role(roleId, name);
  }

  // Getters
  get roleId(): string {
    return this._roleId;
  }

  get name(): string {
    return this._name;
  }

  // Setters
  updateName(name: string): void {
    if (!name) throw new Error('Role name cannot be empty');
    this._name = name;
  }

  // For comparing roles
  equals(other: Role): boolean {
    return this._roleId === other.roleId;
  }

  // For creating a copy of the role
  clone(): Role {
    return new Role(this._roleId, this._name);
  }
}

export class Category {
  private constructor(
    private readonly _categoryId: string,
    private _name: string,
    private _description: string
  ) {}

  static create(
    categoryId: string,
    name: string,
    description: string
  ): Category {
    if (!categoryId) throw new Error('Category ID is required');
    if (!name) throw new Error('Category name is required');
    if (!description) throw new Error('Category description is required');

    return new Category(categoryId, name, description);
  }

  // Getters
  get categoryId(): string {
    return this._categoryId;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  // Setters
  updateName(name: string): void {
    if (!name) throw new Error('Category name cannot be empty');
    this._name = name;
  }

  updateDescription(description: string): void {
    if (!description) throw new Error('Category description cannot be empty');
    this._description = description;
  }

  // For comparing categories
  equals(other: Category): boolean {
    return this._categoryId === other.categoryId;
  }

  // For creating a copy of the category
  clone(): Category {
    return new Category(
      this._categoryId,
      this._name,
      this._description
    );
  }
}

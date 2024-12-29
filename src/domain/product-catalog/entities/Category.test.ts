import { Category } from './Category';

describe('Category Entity', () => {
  const validCategoryData = {
    categoryId: 'cat-123',
    name: 'Electronics',
    description: 'Electronic devices and accessories'
  };

  describe('Category Creation', () => {
    it('should create a valid category', () => {
      const category = Category.create(
        validCategoryData.categoryId,
        validCategoryData.name,
        validCategoryData.description
      );

      expect(category.categoryId).toBe(validCategoryData.categoryId);
      expect(category.name).toBe(validCategoryData.name);
      expect(category.description).toBe(validCategoryData.description);
    });

    it('should throw error for missing required fields', () => {
      expect(() => {
        Category.create('', validCategoryData.name, validCategoryData.description);
      }).toThrow('Category ID is required');

      expect(() => {
        Category.create(validCategoryData.categoryId, '', validCategoryData.description);
      }).toThrow('Category name is required');

      expect(() => {
        Category.create(validCategoryData.categoryId, validCategoryData.name, '');
      }).toThrow('Category description is required');
    });
  });

  describe('Category Updates', () => {
    let category: Category;

    beforeEach(() => {
      category = Category.create(
        validCategoryData.categoryId,
        validCategoryData.name,
        validCategoryData.description
      );
    });

    it('should update name', () => {
      const newName = 'Digital Electronics';
      category.updateName(newName);
      expect(category.name).toBe(newName);
    });

    it('should update description', () => {
      const newDescription = 'Modern electronic devices and accessories';
      category.updateDescription(newDescription);
      expect(category.description).toBe(newDescription);
    });

    it('should throw error for invalid name update', () => {
      expect(() => {
        category.updateName('');
      }).toThrow('Category name cannot be empty');
    });

    it('should throw error for invalid description update', () => {
      expect(() => {
        category.updateDescription('');
      }).toThrow('Category description cannot be empty');
    });
  });

  describe('Utility Methods', () => {
    let category: Category;

    beforeEach(() => {
      category = Category.create(
        validCategoryData.categoryId,
        validCategoryData.name,
        validCategoryData.description
      );
    });

    it('should compare categories correctly', () => {
      const sameCategory = Category.create(
        validCategoryData.categoryId,
        'Different Name',
        'Different Description'
      );
      const differentCategory = Category.create(
        'different-id',
        validCategoryData.name,
        validCategoryData.description
      );

      expect(category.equals(sameCategory)).toBe(true);
      expect(category.equals(differentCategory)).toBe(false);
    });

    it('should clone category correctly', () => {
      const clone = category.clone();

      expect(clone).not.toBe(category); // Different instance
      expect(clone.categoryId).toBe(category.categoryId);
      expect(clone.name).toBe(category.name);
      expect(clone.description).toBe(category.description);
    });
  });
});

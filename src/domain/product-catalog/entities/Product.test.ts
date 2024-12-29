import { Product, Review } from './Product';

describe('Product Entity', () => {
  const validProductData = {
    productId: 'prod-123',
    name: 'Test Product',
    description: 'Test Description',
    categoryId: 'cat-123',
    currentPrice: 99.99,
    discountIds: [],
    reviews: []
  };

  const validReview: Review = {
    reviewId: 'rev-123',
    userId: 'user-123',
    rating: 4,
    comment: 'Great product!',
    reviewDate: new Date()
  };

  describe('Product Creation', () => {
    it('should create a valid product', () => {
      const product = Product.create(
        validProductData.productId,
        validProductData.name,
        validProductData.description,
        validProductData.categoryId,
        validProductData.currentPrice
      );

      expect(product.productId).toBe(validProductData.productId);
      expect(product.name).toBe(validProductData.name);
      expect(product.description).toBe(validProductData.description);
      expect(product.categoryId).toBe(validProductData.categoryId);
      expect(product.currentPrice).toBe(validProductData.currentPrice);
      expect(product.discountIds).toEqual([]);
      expect(product.reviews).toEqual([]);
      expect(product.averageRating).toBe(0);
    });

    it('should throw error for missing required fields', () => {
      expect(() => {
        Product.create('', validProductData.name, validProductData.description,
          validProductData.categoryId, validProductData.currentPrice);
      }).toThrow('Product ID is required');

      expect(() => {
        Product.create(validProductData.productId, '', validProductData.description,
          validProductData.categoryId, validProductData.currentPrice);
      }).toThrow('Product name is required');
    });

    it('should throw error for negative price', () => {
      expect(() => {
        Product.create(validProductData.productId, validProductData.name,
          validProductData.description, validProductData.categoryId, -10);
      }).toThrow('Price cannot be negative');
    });
  });

  describe('Product Updates', () => {
    let product: Product;

    beforeEach(() => {
      product = Product.create(
        validProductData.productId,
        validProductData.name,
        validProductData.description,
        validProductData.categoryId,
        validProductData.currentPrice
      );
    });

    it('should update name', () => {
      const newName = 'Updated Product';
      product.updateName(newName);
      expect(product.name).toBe(newName);
    });

    it('should throw error for empty name', () => {
      expect(() => {
        product.updateName('');
      }).toThrow('Product name cannot be empty');
    });

    it('should update description', () => {
      const newDescription = 'Updated Description';
      product.updateDescription(newDescription);
      expect(product.description).toBe(newDescription);
    });

    it('should update category', () => {
      const newCategoryId = 'cat-456';
      product.updateCategory(newCategoryId);
      expect(product.categoryId).toBe(newCategoryId);
    });

    it('should update price', () => {
      const newPrice = 149.99;
      product.updatePrice(newPrice);
      expect(product.currentPrice).toBe(newPrice);
    });

    it('should throw error for negative price update', () => {
      expect(() => {
        product.updatePrice(-10);
      }).toThrow('Price cannot be negative');
    });
  });

  describe('Review Management', () => {
    let product: Product;

    beforeEach(() => {
      product = Product.create(
        validProductData.productId,
        validProductData.name,
        validProductData.description,
        validProductData.categoryId,
        validProductData.currentPrice
      );
    });

    it('should add review and update average rating', () => {
      product.addReview(validReview);
      expect(product.reviews).toHaveLength(1);
      expect(product.reviews[0]).toEqual(validReview);
      expect(product.averageRating).toBe(4);

      const secondReview: Review = {
        ...validReview,
        reviewId: 'rev-456',
        rating: 5
      };
      product.addReview(secondReview);
      expect(product.reviews).toHaveLength(2);
      expect(product.averageRating).toBe(4.5);
    });

    it('should throw error for invalid review', () => {
      const invalidReview = {
        ...validReview,
        rating: 6 // Invalid rating
      };

      expect(() => {
        product.addReview(invalidReview);
      }).toThrow('Invalid review');
    });

    it('should remove review and update average rating', () => {
      product.addReview(validReview);
      const secondReview: Review = {
        ...validReview,
        reviewId: 'rev-456',
        rating: 5
      };
      product.addReview(secondReview);
      expect(product.reviews).toHaveLength(2);
      expect(product.averageRating).toBe(4.5);

      product.removeReview(validReview.reviewId);
      expect(product.reviews).toHaveLength(1);
      expect(product.averageRating).toBe(5);
    });
  });

  describe('Discount Management', () => {
    let product: Product;

    beforeEach(() => {
      product = Product.create(
        validProductData.productId,
        validProductData.name,
        validProductData.description,
        validProductData.categoryId,
        validProductData.currentPrice
      );
    });

    it('should add discount', () => {
      const discountId = 'disc-123';
      product.addDiscount(discountId);
      expect(product.discountIds).toContain(discountId);
    });

    it('should not add duplicate discount', () => {
      const discountId = 'disc-123';
      product.addDiscount(discountId);
      product.addDiscount(discountId);
      expect(product.discountIds).toHaveLength(1);
      expect(product.discountIds).toContain(discountId);
    });

    it('should remove discount', () => {
      const discountId = 'disc-123';
      product.addDiscount(discountId);
      expect(product.discountIds).toContain(discountId);

      product.removeDiscount(discountId);
      expect(product.discountIds).not.toContain(discountId);
    });

    it('should handle removing non-existent discount', () => {
      product.removeDiscount('non-existent');
      expect(product.discountIds).toHaveLength(0);
    });
  });

  describe('Utility Methods', () => {
    let product: Product;

    beforeEach(() => {
      product = Product.create(
        validProductData.productId,
        validProductData.name,
        validProductData.description,
        validProductData.categoryId,
        validProductData.currentPrice,
        ['disc-123'],
        [validReview]
      );
    });

    it('should compare products correctly', () => {
      const sameProduct = Product.create(
        validProductData.productId,
        'Different Name',
        'Different Description',
        'different-category',
        199.99
      );
      const differentProduct = Product.create(
        'different-id',
        validProductData.name,
        validProductData.description,
        validProductData.categoryId,
        validProductData.currentPrice
      );

      expect(product.equals(sameProduct)).toBe(true);
      expect(product.equals(differentProduct)).toBe(false);
    });

    it('should clone product correctly', () => {
      const clone = product.clone();
      expect(clone).not.toBe(product); // Different instance
      expect(clone.productId).toBe(product.productId);
      expect(clone.name).toBe(product.name);
      expect(clone.description).toBe(product.description);
      expect(clone.categoryId).toBe(product.categoryId);
      expect(clone.currentPrice).toBe(product.currentPrice);
      expect(clone.discountIds).toEqual(product.discountIds);
      expect(clone.reviews).toEqual(product.reviews);
      expect(clone.averageRating).toBe(product.averageRating);
    });
  });
});

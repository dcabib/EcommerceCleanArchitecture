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

      expect(() => {
        Product.create(validProductData.productId, validProductData.name, '',
          validProductData.categoryId, validProductData.currentPrice);
      }).toThrow('Product description is required');

      expect(() => {
        Product.create(validProductData.productId, validProductData.name,
          validProductData.description, '', validProductData.currentPrice);
      }).toThrow('Category ID is required');
    });

    it('should throw error for negative price', () => {
      expect(() => {
        Product.create(validProductData.productId, validProductData.name,
          validProductData.description, validProductData.categoryId, -10);
      }).toThrow('Price cannot be negative');
    });

    it('should calculate initial average rating correctly', () => {
      // Test with empty reviews
      const productNoReviews = Product.create(
        validProductData.productId,
        validProductData.name,
        validProductData.description,
        validProductData.categoryId,
        validProductData.currentPrice,
        [],
        []
      );
      expect(productNoReviews.averageRating).toBe(0);

      // Test with initial reviews
      const productWithReviews = Product.create(
        validProductData.productId,
        validProductData.name,
        validProductData.description,
        validProductData.categoryId,
        validProductData.currentPrice,
        [],
        [
          { ...validReview, rating: 4 },
          { ...validReview, reviewId: 'rev-456', rating: 5 }
        ]
      );
      expect(productWithReviews.averageRating).toBe(4.5);
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

    it('should throw error for empty description', () => {
      expect(() => {
        product.updateDescription('');
      }).toThrow('Product description cannot be empty');
    });

    it('should update category', () => {
      const newCategoryId = 'cat-456';
      product.updateCategory(newCategoryId);
      expect(product.categoryId).toBe(newCategoryId);
    });

    it('should throw error for empty category', () => {
      expect(() => {
        product.updateCategory('');
      }).toThrow('Category ID cannot be empty');
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

    it('should throw error for invalid review data', () => {
      // Test missing reviewId
      expect(() => {
        product.addReview({ ...validReview, reviewId: '' });
      }).toThrow('Invalid review');

      // Test missing userId
      expect(() => {
        product.addReview({ ...validReview, userId: '' });
      }).toThrow('Invalid review');

      // Test invalid rating type
      expect(() => {
        product.addReview({ ...validReview, rating: '4' as any });
      }).toThrow('Invalid review');

      // Test rating below minimum
      expect(() => {
        product.addReview({ ...validReview, rating: 0 });
      }).toThrow('Invalid review');

      // Test rating above maximum
      expect(() => {
        product.addReview({ ...validReview, rating: 6 });
      }).toThrow('Invalid review');

      // Test missing comment
      expect(() => {
        product.addReview({ ...validReview, comment: '' });
      }).toThrow('Invalid review');

      // Test invalid review date
      expect(() => {
        product.addReview({ ...validReview, reviewDate: 'invalid-date' as any });
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

      // Test removing last review resets average to 0
      product.removeReview(secondReview.reviewId);
      expect(product.reviews).toHaveLength(0);
      expect(product.averageRating).toBe(0);
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

    it('should throw error for empty discount ID', () => {
      expect(() => {
        product.addDiscount('');
      }).toThrow('Discount ID cannot be empty');
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

    it('should clone product correctly with deep copy of arrays', () => {
      // Add multiple reviews and discounts
      const additionalReview: Review = {
        ...validReview,
        reviewId: 'rev-456',
        rating: 5,
        comment: 'Excellent!'
      };
      product.addReview(additionalReview);
      product.addDiscount('disc-456');

      const clone = product.clone();

      // Test instance independence
      expect(clone).not.toBe(product);
      expect(clone.productId).toBe(product.productId);
      expect(clone.name).toBe(product.name);
      expect(clone.description).toBe(product.description);
      expect(clone.categoryId).toBe(product.categoryId);
      expect(clone.currentPrice).toBe(product.currentPrice);
      expect(clone.averageRating).toBe(product.averageRating);

      // Test deep copy of arrays
      expect(clone.discountIds).toEqual(product.discountIds);
      expect(clone.discountIds).not.toBe(product.discountIds);
      expect(clone.reviews).toEqual(product.reviews);
      expect(clone.reviews).not.toBe(product.reviews);

      // Test deep copy of review objects
      clone.reviews.forEach((review, index) => {
        expect(review).not.toBe(product.reviews[index]);
        expect(review.reviewDate).not.toBe(product.reviews[index].reviewDate);
      });

      // Verify modifications don't affect original
      clone.reviews[0].comment = 'Modified comment';
      expect(clone.reviews[0].comment).not.toBe(product.reviews[0].comment);
    });
  });
});

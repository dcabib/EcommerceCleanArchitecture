export interface Review {
  reviewId: string;
  userId: string;
  rating: number;
  comment: string;
  reviewDate: Date;
}

export interface Discount {
  discountId: string;
  code: string;
  type: 'Percentage' | 'FixedAmount';
  value: number;
  startDate: Date;
  endDate: Date;
  maxUses: number;
  usedCount: number;
}

export class Product {
  private constructor(
    private readonly _productId: string,
    private _name: string,
    private _description: string,
    private _categoryId: string,
    private _currentPrice: number,
    private _discountIds: string[],
    private _reviews: Review[],
    private _averageRating: number
  ) {}

  static create(
    productId: string,
    name: string,
    description: string,
    categoryId: string,
    currentPrice: number,
    discountIds: string[] = [],
    reviews: Review[] = []
  ): Product {
    if (!productId) throw new Error('Product ID is required');
    if (!name) throw new Error('Product name is required');
    if (!description) throw new Error('Product description is required');
    if (!categoryId) throw new Error('Category ID is required');
    if (currentPrice < 0) throw new Error('Price cannot be negative');

    const averageRating = Product.calculateAverageRating(reviews);

    return new Product(
      productId,
      name,
      description,
      categoryId,
      currentPrice,
      discountIds,
      reviews,
      averageRating
    );
  }

  // Getters
  get productId(): string {
    return this._productId;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get categoryId(): string {
    return this._categoryId;
  }

  get currentPrice(): number {
    return this._currentPrice;
  }

  get discountIds(): string[] {
    return [...this._discountIds];
  }

  get reviews(): Review[] {
    return [...this._reviews];
  }

  get averageRating(): number {
    return this._averageRating;
  }

  // Setters and methods
  updateName(name: string): void {
    if (!name) throw new Error('Product name cannot be empty');
    this._name = name;
  }

  updateDescription(description: string): void {
    if (!description) throw new Error('Product description cannot be empty');
    this._description = description;
  }

  updateCategory(categoryId: string): void {
    if (!categoryId) throw new Error('Category ID cannot be empty');
    this._categoryId = categoryId;
  }

  updatePrice(price: number): void {
    if (price < 0) throw new Error('Price cannot be negative');
    this._currentPrice = price;
  }

  addDiscount(discountId: string): void {
    if (!discountId) throw new Error('Discount ID cannot be empty');
    if (!this._discountIds.includes(discountId)) {
      this._discountIds.push(discountId);
    }
  }

  removeDiscount(discountId: string): void {
    this._discountIds = this._discountIds.filter(id => id !== discountId);
  }

  addReview(review: Review): void {
    if (!this.isValidReview(review)) {
      throw new Error('Invalid review');
    }
    this._reviews.push({ ...review });
    this._averageRating = Product.calculateAverageRating(this._reviews);
  }

  removeReview(reviewId: string): void {
    this._reviews = this._reviews.filter(review => review.reviewId !== reviewId);
    this._averageRating = Product.calculateAverageRating(this._reviews);
  }

  // Utility methods
  private static calculateAverageRating(reviews: Review[]): number {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Number((sum / reviews.length).toFixed(1));
  }

  private isValidReview(review: Review): boolean {
    return (
      !!review.reviewId &&
      !!review.userId &&
      typeof review.rating === 'number' &&
      review.rating >= 1 &&
      review.rating <= 5 &&
      !!review.comment &&
      review.reviewDate instanceof Date
    );
  }

  // For comparing products
  equals(other: Product): boolean {
    return this._productId === other.productId;
  }

  // For creating a copy of the product
  clone(): Product {
    return new Product(
      this._productId,
      this._name,
      this._description,
      this._categoryId,
      this._currentPrice,
      [...this._discountIds],
      this._reviews.map(review => ({ 
        ...review,
        reviewDate: new Date(review.reviewDate)
      })),
      this._averageRating
    );
  }
}

import { Product } from '../entities/Product';

export interface IProductRepository {
  /**
   * Find a product by its unique identifier
   * @param productId The unique identifier of the product
   * @returns Promise resolving to the product if found, null otherwise
   */
  findById(productId: string): Promise<Product | null>;

  /**
   * Save a new product or update an existing one
   * @param product The product to save or update
   * @returns Promise resolving to the saved product
   */
  save(product: Product): Promise<Product>;

  /**
   * Delete a product by its unique identifier
   * @param productId The unique identifier of the product to delete
   * @returns Promise resolving to true if product was deleted, false if product was not found
   */
  delete(productId: string): Promise<boolean>;

  /**
   * Find all products in a specific category
   * @param categoryId The category ID to search for
   * @param page The page number (for pagination)
   * @param limit The number of products per page
   * @returns Promise resolving to paginated products in the category
   */
  findByCategory(categoryId: string, page: number, limit: number): Promise<{
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
  }>;

  /**
   * Find products by name search term
   * @param searchTerm The term to search for in product names
   * @param page The page number (for pagination)
   * @param limit The number of products per page
   * @returns Promise resolving to paginated search results
   */
  findByName(searchTerm: string, page: number, limit: number): Promise<{
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
  }>;

  /**
   * Find products with active discounts
   * @param page The page number (for pagination)
   * @param limit The number of products per page
   * @returns Promise resolving to paginated products with discounts
   */
  findWithDiscounts(page: number, limit: number): Promise<{
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
  }>;

  /**
   * Find products by price range
   * @param minPrice The minimum price
   * @param maxPrice The maximum price
   * @param page The page number (for pagination)
   * @param limit The number of products per page
   * @returns Promise resolving to paginated products within price range
   */
  findByPriceRange(minPrice: number, maxPrice: number, page: number, limit: number): Promise<{
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
  }>;

  /**
   * Find top rated products
   * @param minRating The minimum average rating to include
   * @param page The page number (for pagination)
   * @param limit The number of products per page
   * @returns Promise resolving to paginated top rated products
   */
  findTopRated(minRating: number, page: number, limit: number): Promise<{
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
  }>;

  /**
   * Find all products
   * @param page The page number (for pagination)
   * @param limit The number of products per page
   * @returns Promise resolving to paginated products
   */
  findAll(page: number, limit: number): Promise<{
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
  }>;

  /**
   * Count total number of products
   * @returns Promise resolving to the total number of products
   */
  count(): Promise<number>;

  /**
   * Count products in a specific category
   * @param categoryId The category ID to count products for
   * @returns Promise resolving to the number of products in the category
   */
  countByCategory(categoryId: string): Promise<number>;
}

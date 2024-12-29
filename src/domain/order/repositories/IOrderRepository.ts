import { Order, OrderStatus } from '../entities/Order';

export interface IOrderRepository {
  /**
   * Find an order by its unique identifier
   * @param orderId The unique identifier of the order
   * @returns Promise resolving to the order if found, null otherwise
   */
  findById(orderId: string): Promise<Order | null>;

  /**
   * Save a new order or update an existing one
   * @param order The order to save or update
   * @returns Promise resolving to the saved order
   */
  save(order: Order): Promise<Order>;

  /**
   * Delete an order by its unique identifier
   * @param orderId The unique identifier of the order to delete
   * @returns Promise resolving to true if order was deleted, false if order was not found
   */
  delete(orderId: string): Promise<boolean>;

  /**
   * Find all orders for a specific user
   * @param userId The user ID to find orders for
   * @param page The page number (for pagination)
   * @param limit The number of orders per page
   * @returns Promise resolving to paginated user orders
   */
  findByUserId(userId: string, page: number, limit: number): Promise<{
    orders: Order[];
    total: number;
    page: number;
    totalPages: number;
  }>;

  /**
   * Find orders by status
   * @param status The order status to search for
   * @param page The page number (for pagination)
   * @param limit The number of orders per page
   * @returns Promise resolving to paginated orders with the specified status
   */
  findByStatus(status: OrderStatus, page: number, limit: number): Promise<{
    orders: Order[];
    total: number;
    page: number;
    totalPages: number;
  }>;

  /**
   * Find orders containing a specific product
   * @param productId The product ID to search for
   * @param page The page number (for pagination)
   * @param limit The number of orders per page
   * @returns Promise resolving to paginated orders containing the product
   */
  findByProductId(productId: string, page: number, limit: number): Promise<{
    orders: Order[];
    total: number;
    page: number;
    totalPages: number;
  }>;

  /**
   * Find orders by date range
   * @param startDate The start date of the range
   * @param endDate The end date of the range
   * @param page The page number (for pagination)
   * @param limit The number of orders per page
   * @returns Promise resolving to paginated orders within the date range
   */
  findByDateRange(startDate: Date, endDate: Date, page: number, limit: number): Promise<{
    orders: Order[];
    total: number;
    page: number;
    totalPages: number;
  }>;

  /**
   * Find orders with total amount in range
   * @param minAmount The minimum total amount
   * @param maxAmount The maximum total amount
   * @param page The page number (for pagination)
   * @param limit The number of orders per page
   * @returns Promise resolving to paginated orders within the amount range
   */
  findByAmountRange(minAmount: number, maxAmount: number, page: number, limit: number): Promise<{
    orders: Order[];
    total: number;
    page: number;
    totalPages: number;
  }>;

  /**
   * Find all orders
   * @param page The page number (for pagination)
   * @param limit The number of orders per page
   * @returns Promise resolving to paginated orders
   */
  findAll(page: number, limit: number): Promise<{
    orders: Order[];
    total: number;
    page: number;
    totalPages: number;
  }>;

  /**
   * Count total number of orders
   * @returns Promise resolving to the total number of orders
   */
  count(): Promise<number>;

  /**
   * Count orders by status
   * @param status The order status to count
   * @returns Promise resolving to the number of orders with the specified status
   */
  countByStatus(status: OrderStatus): Promise<number>;

  /**
   * Count orders by user
   * @param userId The user ID to count orders for
   * @returns Promise resolving to the number of orders for the user
   */
  countByUser(userId: string): Promise<number>;

  /**
   * Get total revenue in a date range
   * @param startDate The start date of the range
   * @param endDate The end date of the range
   * @returns Promise resolving to the total revenue in the date range
   */
  getTotalRevenue(startDate: Date, endDate: Date): Promise<number>;
}

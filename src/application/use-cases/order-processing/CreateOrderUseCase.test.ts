import { CreateOrderUseCase, CreateOrderDTO, OrderItemDTO } from './CreateOrderUseCase';
import { IOrderRepository } from '../../../domain/order-processing/repositories/IOrderRepository';
import { IUserRepository } from '../../../domain/user-management/repositories/IUserRepository';
import { IProductRepository } from '../../../domain/product-catalog/repositories/IProductRepository';
import { Order, OrderStatus } from '../../../domain/order-processing/entities/Order';
import { User } from '../../../domain/user-management/entities/User';
import { Product } from '../../../domain/product-catalog/entities/Product';

describe('CreateOrderUseCase', () => {
  // Mock implementations
  class MockOrderRepository implements IOrderRepository {
    private orders: Order[] = [];

    async findById(orderId: string): Promise<Order | null> {
      return this.orders.find(o => o.orderId === orderId) || null;
    }

    async save(order: Order): Promise<Order> {
      const existingIndex = this.orders.findIndex(o => o.orderId === order.orderId);
      if (existingIndex >= 0) {
        this.orders[existingIndex] = order;
      } else {
        this.orders.push(order);
      }
      return order;
    }

    async delete(orderId: string): Promise<boolean> {
      const initialLength = this.orders.length;
      this.orders = this.orders.filter(o => o.orderId !== orderId);
      return this.orders.length !== initialLength;
    }

    async findByUserId(userId: string, page: number, limit: number): Promise<{
      orders: Order[];
      total: number;
      page: number;
      totalPages: number;
    }> {
      const filtered = this.orders.filter(o => o.userId === userId);
      return this.paginateResults(filtered, page, limit);
    }

    async findByStatus(status: OrderStatus, page: number, limit: number): Promise<{
      orders: Order[];
      total: number;
      page: number;
      totalPages: number;
    }> {
      const filtered = this.orders.filter(o => o.status === status);
      return this.paginateResults(filtered, page, limit);
    }

    async findByProductId(productId: string, page: number, limit: number): Promise<{
      orders: Order[];
      total: number;
      page: number;
      totalPages: number;
    }> {
      const filtered = this.orders.filter(o => 
        o.items.some(item => item.productId === productId)
      );
      return this.paginateResults(filtered, page, limit);
    }

    async findByDateRange(startDate: Date, endDate: Date, page: number, limit: number): Promise<{
      orders: Order[];
      total: number;
      page: number;
      totalPages: number;
    }> {
      const filtered = this.orders.filter(o => 
        o.orderDate >= startDate && o.orderDate <= endDate
      );
      return this.paginateResults(filtered, page, limit);
    }

    async findByAmountRange(minAmount: number, maxAmount: number, page: number, limit: number): Promise<{
      orders: Order[];
      total: number;
      page: number;
      totalPages: number;
    }> {
      const filtered = this.orders.filter(o => 
        o.totalAmount >= minAmount && o.totalAmount <= maxAmount
      );
      return this.paginateResults(filtered, page, limit);
    }

    async findAll(page: number, limit: number): Promise<{
      orders: Order[];
      total: number;
      page: number;
      totalPages: number;
    }> {
      return this.paginateResults(this.orders, page, limit);
    }

    async count(): Promise<number> {
      return this.orders.length;
    }

    async countByStatus(status: OrderStatus): Promise<number> {
      return this.orders.filter(o => o.status === status).length;
    }

    async countByUser(userId: string): Promise<number> {
      return this.orders.filter(o => o.userId === userId).length;
    }

    async getTotalRevenue(startDate: Date, endDate: Date): Promise<number> {
      return this.orders
        .filter(o => o.orderDate >= startDate && o.orderDate <= endDate)
        .reduce((total, order) => total + order.finalAmount, 0);
    }

    private paginateResults(items: Order[], page: number, limit: number) {
      const start = (page - 1) * limit;
      const end = start + limit;
      return {
        orders: items.slice(start, end),
        total: items.length,
        page,
        totalPages: Math.ceil(items.length / limit)
      };
    }
  }

  class MockUserRepository implements IUserRepository {
    private users: User[] = [];

    constructor(initialUsers: User[] = []) {
      this.users = initialUsers;
    }

    async findById(userId: string): Promise<User | null> {
      return this.users.find(u => u.userId === userId) || null;
    }

    async findByEmail(email: string): Promise<User | null> {
      return this.users.find(u => u.email === email) || null;
    }

    async findByUsername(username: string): Promise<User | null> {
      return this.users.find(u => u.username === username) || null;
    }

    async save(user: User): Promise<User> {
      const existingIndex = this.users.findIndex(u => u.userId === user.userId);
      if (existingIndex >= 0) {
        this.users[existingIndex] = user;
      } else {
        this.users.push(user);
      }
      return user;
    }

    async delete(userId: string): Promise<boolean> {
      const initialLength = this.users.length;
      this.users = this.users.filter(u => u.userId !== userId);
      return this.users.length !== initialLength;
    }

    async findByRole(role: string): Promise<User[]> {
      return this.users.filter(u => u.role === role);
    }

    async findAll(page: number, limit: number): Promise<{
      users: User[];
      total: number;
      page: number;
      totalPages: number;
    }> {
      const start = (page - 1) * limit;
      const end = start + limit;
      return {
        users: this.users.slice(start, end),
        total: this.users.length,
        page,
        totalPages: Math.ceil(this.users.length / limit)
      };
    }

    async exists(email: string, username: string): Promise<boolean> {
      return this.users.some(u => u.email === email || u.username === username);
    }

    async count(): Promise<number> {
      return this.users.length;
    }
  }

  class MockProductRepository implements IProductRepository {
    private products: Product[] = [];

    constructor(initialProducts: Product[] = []) {
      this.products = initialProducts;
    }

    async findById(productId: string): Promise<Product | null> {
      return this.products.find(p => p.productId === productId) || null;
    }

    async save(product: Product): Promise<Product> {
      const existingIndex = this.products.findIndex(p => p.productId === product.productId);
      if (existingIndex >= 0) {
        this.products[existingIndex] = product;
      } else {
        this.products.push(product);
      }
      return product;
    }

    async delete(productId: string): Promise<boolean> {
      const initialLength = this.products.length;
      this.products = this.products.filter(p => p.productId !== productId);
      return this.products.length !== initialLength;
    }

    async findByCategory(categoryId: string, page: number, limit: number): Promise<{
      products: Product[];
      total: number;
      page: number;
      totalPages: number;
    }> {
      const filtered = this.products.filter(p => p.categoryId === categoryId);
      return this.paginateResults(filtered, page, limit);
    }

    async findByName(searchTerm: string, page: number, limit: number): Promise<{
      products: Product[];
      total: number;
      page: number;
      totalPages: number;
    }> {
      const filtered = this.products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return this.paginateResults(filtered, page, limit);
    }

    async findWithDiscounts(page: number, limit: number): Promise<{
      products: Product[];
      total: number;
      page: number;
      totalPages: number;
    }> {
      const filtered = this.products.filter(p => p.discountIds.length > 0);
      return this.paginateResults(filtered, page, limit);
    }

    async findByPriceRange(minPrice: number, maxPrice: number, page: number, limit: number): Promise<{
      products: Product[];
      total: number;
      page: number;
      totalPages: number;
    }> {
      const filtered = this.products.filter(p => 
        p.currentPrice >= minPrice && p.currentPrice <= maxPrice
      );
      return this.paginateResults(filtered, page, limit);
    }

    async findTopRated(minRating: number, page: number, limit: number): Promise<{
      products: Product[];
      total: number;
      page: number;
      totalPages: number;
    }> {
      const filtered = this.products.filter(p => p.averageRating >= minRating);
      return this.paginateResults(filtered, page, limit);
    }

    async findAll(page: number, limit: number): Promise<{
      products: Product[];
      total: number;
      page: number;
      totalPages: number;
    }> {
      return this.paginateResults(this.products, page, limit);
    }

    async count(): Promise<number> {
      return this.products.length;
    }

    async countByCategory(categoryId: string): Promise<number> {
      return this.products.filter(p => p.categoryId === categoryId).length;
    }

    private paginateResults(items: Product[], page: number, limit: number) {
      const start = (page - 1) * limit;
      const end = start + limit;
      return {
        products: items.slice(start, end),
        total: items.length,
        page,
        totalPages: Math.ceil(items.length / limit)
      };
    }
  }

  const mockIdGenerator = {
    generate: () => 'generated-id'
  };

  let useCase: CreateOrderUseCase;
  let orderRepository: MockOrderRepository;
  let userRepository: MockUserRepository;
  let productRepository: MockProductRepository;

  const validAddress = {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'USA'
  };

  const mockUser = User.create(
    'user-123',
    'testuser',
    'test@example.com',
    'hashedpassword',
    validAddress,
    '1234567890'
  );

  const mockProduct = Product.create(
    'prod-123',
    'Test Product',
    'Test Description',
    'cat-123',
    99.99,
    ['disc-123']
  );

  const validOrderItemDTO: OrderItemDTO = {
    productId: 'prod-123',
    quantity: 2,
    warehouseId: 'wh-123'
  };

  const validCreateOrderDTO: CreateOrderDTO = {
    userId: 'user-123',
    items: [validOrderItemDTO],
    discountAmount: 10
  };

  beforeEach(() => {
    orderRepository = new MockOrderRepository();
    userRepository = new MockUserRepository([mockUser]);
    productRepository = new MockProductRepository([mockProduct]);
    useCase = new CreateOrderUseCase(
      orderRepository,
      userRepository,
      productRepository,
      mockIdGenerator
    );
  });

  it('should create a valid order', async () => {
    const result = await useCase.execute(validCreateOrderDTO);

    expect(result.orderId).toBe('generated-id');
    expect(result.userId).toBe(validCreateOrderDTO.userId);
    expect(result.items).toHaveLength(1);
    expect(result.status).toBe('Pending');
    expect(result.discountAmount).toBe(validCreateOrderDTO.discountAmount);
    expect(result.orderDate).toBeInstanceOf(Date);

    // Verify order was saved
    const savedOrder = await orderRepository.findById('generated-id');
    expect(savedOrder).not.toBeNull();
  });

  it('should throw error if user not found', async () => {
    const invalidDTO = {
      ...validCreateOrderDTO,
      userId: 'non-existent'
    };

    await expect(useCase.execute(invalidDTO))
      .rejects
      .toThrow('User not found');
  });

  it('should throw error if product not found', async () => {
    const invalidDTO = {
      ...validCreateOrderDTO,
      items: [{
        ...validOrderItemDTO,
        productId: 'non-existent'
      }]
    };

    await expect(useCase.execute(invalidDTO))
      .rejects
      .toThrow('Product not found: non-existent');
  });

  it('should throw error for duplicate products', async () => {
    const invalidDTO = {
      ...validCreateOrderDTO,
      items: [validOrderItemDTO, validOrderItemDTO]
    };

    await expect(useCase.execute(invalidDTO))
      .rejects
      .toThrow('Duplicate product ID: prod-123');
  });

  it('should throw error for invalid quantity', async () => {
    const invalidDTO = {
      ...validCreateOrderDTO,
      items: [{
        ...validOrderItemDTO,
        quantity: 0
      }]
    };

    await expect(useCase.execute(invalidDTO))
      .rejects
      .toThrow('Item quantity must be greater than zero');
  });

  it('should calculate discounts correctly', async () => {
    const result = await useCase.execute(validCreateOrderDTO);

    // Product has a discount, so each item should have 10% off
    // (99.99 * 2) * 0.1 = 20
    const expectedItemDiscount = 20;
    expect(result.items[0].discountAmount).toBe(expectedItemDiscount);
  });

  it('should generate unique IDs', async () => {
    const spy = jest.spyOn(mockIdGenerator, 'generate');
    
    await useCase.execute(validCreateOrderDTO);
    
    // Should be called twice: once for order ID, once for order item ID
    expect(spy).toHaveBeenCalledTimes(2);
  });
});

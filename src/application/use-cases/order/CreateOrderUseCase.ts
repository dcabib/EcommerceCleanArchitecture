import { Order, OrderItem } from '../../../domain/order/entities/Order';
import { IOrderRepository } from '../../../domain/order/repositories/IOrderRepository';
import { IUserRepository } from '../../../domain/user/repositories/IUserRepository';
import { IProductRepository } from '../../../domain/product/repositories/IProductRepository';
import { Product } from '../../../domain/product/entities/Product';

export interface OrderItemDTO {
  productId: string;
  quantity: number;
  warehouseId: string;
}

export interface CreateOrderDTO {
  userId: string;
  items: OrderItemDTO[];
  discountAmount?: number;
}

export interface CreateOrderResponseDTO {
  orderId: string;
  userId: string;
  items: OrderItem[];
  status: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  orderDate: Date;
}

export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly userRepository: IUserRepository,
    private readonly productRepository: IProductRepository,
    private readonly idGenerator: { generate(): string }
  ) {}

  async execute(dto: CreateOrderDTO): Promise<CreateOrderResponseDTO> {
    // Validate user exists
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Validate and prepare order items
    const orderItems: OrderItem[] = await this.prepareOrderItems(dto.items);

    // Generate unique order ID
    const orderId = this.idGenerator.generate();

    // Create order entity
    const order = Order.create(
      orderId,
      dto.userId,
      orderItems,
      dto.discountAmount
    );

    // Save to repository
    const savedOrder = await this.orderRepository.save(order);

    // Return DTO
    return {
      orderId: savedOrder.orderId,
      userId: savedOrder.userId,
      items: savedOrder.items,
      status: savedOrder.status,
      totalAmount: savedOrder.totalAmount,
      discountAmount: savedOrder.discountAmount,
      finalAmount: savedOrder.finalAmount,
      orderDate: savedOrder.orderDate
    };
  }

  private async prepareOrderItems(items: OrderItemDTO[]): Promise<OrderItem[]> {
    if (!items.length) {
      throw new Error('Order must contain at least one item');
    }

    const orderItems: OrderItem[] = [];
    const seenProducts = new Set<string>();

    for (const item of items) {
      // Check for duplicate products
      if (seenProducts.has(item.productId)) {
        throw new Error(`Duplicate product ID: ${item.productId}`);
      }
      seenProducts.add(item.productId);

      // Validate quantity
      if (item.quantity <= 0) {
        throw new Error('Item quantity must be greater than zero');
      }

      // Get product details
      const product = await this.productRepository.findById(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      // Create order item
      const orderItem: OrderItem = {
        orderItemId: this.idGenerator.generate(),
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: product.currentPrice,
        warehouseId: item.warehouseId,
        discountAmount: this.calculateItemDiscount(product, item.quantity)
      };

      orderItems.push(orderItem);
    }

    return orderItems;
  }

  private calculateItemDiscount(product: Product, quantity: number): number {
    // This is a simplified discount calculation
    // In a real application, this would involve more complex business rules
    // considering various types of discounts, promotions, etc.
    let discount = 0;

    if (product.discountIds.length > 0) {
      // For this example, we'll just apply a flat 10% discount
      // if the product has any active discounts
      discount = (product.currentPrice * quantity) * 0.1;
    }

    return Number(discount.toFixed(2));
  }
}

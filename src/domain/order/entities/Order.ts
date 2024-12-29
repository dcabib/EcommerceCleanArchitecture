export interface OrderItem {
  orderItemId: string;
  productId: string;
  quantity: number;
  priceAtPurchase: number;
  warehouseId: string;
  discountAmount: number; // Fixed discount amount for this line item (not per unit)
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export class Order {
  private constructor(
    private readonly _orderId: string,
    private readonly _userId: string,
    private readonly _orderDate: Date,
    private _status: OrderStatus,
    private _items: OrderItem[],
    private _orderDiscount: number
  ) {}

  static create(
    orderId: string,
    userId: string,
    items: OrderItem[],
    discountAmount: number = 0
  ): Order {
    if (!orderId) throw new Error('Order ID is required');
    if (!userId) throw new Error('User ID is required');
    if (!items.length) throw new Error('Order must contain at least one item');

    const roundedDiscountAmount = Order.round(discountAmount);
    
    // Validate discount amount
    if (roundedDiscountAmount < 0) {
      throw new Error('Discount amount cannot be negative');
    }
    
    // Calculate total after item discounts
    const totalAfterItemDiscounts = Order.calculateTotalAfterItemDiscounts(items);
    
    // console.log('Debug - create:', {
    //   roundedDiscountAmount,
    //   totalAfterItemDiscounts,
    //   items: items.map(item => ({
    //     quantity: item.quantity,
    //     price: item.priceAtPurchase,
    //     itemDiscount: item.discountAmount,
    //     subtotal: item.priceAtPurchase * item.quantity
    //   }))
    // });
    
    // Validate order discount against total after item discounts
    if (roundedDiscountAmount > totalAfterItemDiscounts) {
      throw new Error('Discount amount cannot be greater than total amount');
    }

    return new Order(
      orderId,
      userId,
      new Date(),
      'Pending',
      items.map(item => ({ ...item })),
      roundedDiscountAmount
    );
  }

  // Getters
  get orderId(): string {
    return this._orderId;
  }

  get userId(): string {
    return this._userId;
  }

  get orderDate(): Date {
    return new Date(this._orderDate);
  }

  get status(): OrderStatus {
    return this._status;
  }

  get items(): OrderItem[] {
    return [...this._items];
  }

  get subtotal(): number {
    return Order.calculateRawSubtotal(this._items);
  }

  get itemDiscounts(): number {
    return Order.calculateItemDiscountsTotal(this._items);
  }

  get totalAmount(): number {
    return Order.calculateTotalAfterItemDiscounts(this._items);
  }

  get discountAmount(): number {
    return this._orderDiscount;
  }

  get finalAmount(): number {
    return Order.round(this.totalAmount - this._orderDiscount);
  }

  // Status management
  updateStatus(newStatus: OrderStatus): void {
    if (!this.isValidStatusTransition(newStatus)) {
      throw new Error(`Invalid status transition from ${this._status} to ${newStatus}`);
    }
    this._status = newStatus;
  }

  // Item management
  addItem(item: OrderItem): void {
    if (!this.canModifyItems()) {
      throw new Error('Cannot modify items in current order status');
    }
    this._items.push({ ...item });
    this.validateOrderDiscount();
  }

  removeItem(orderItemId: string): void {
    if (!this.canModifyItems()) {
      throw new Error('Cannot modify items in current order status');
    }

    const initialLength = this._items.length;
    const itemToRemove = this._items.find(item => item.orderItemId === orderItemId);
    
    if (!itemToRemove) {
      throw new Error('Item not found in order');
    }
    
    if (initialLength === 1) {
      throw new Error('Cannot remove last item from order');
    }

    // Calculate new total after removing item
    const newItems = this._items.filter(item => item.orderItemId !== orderItemId);
    const newTotal = Order.calculateTotalAfterItemDiscounts(newItems);
    
    // Validate discount against new total before removing item
    if (this._orderDiscount > newTotal) {
      throw new Error('Discount amount cannot be greater than total amount');
    }
    
    // If validation passes, update items
    this._items = newItems;
  }

  updateItemQuantity(orderItemId: string, newQuantity: number): void {
    if (!this.canModifyItems()) {
      throw new Error('Cannot modify items in current order status');
    }
    if (newQuantity <= 0) {
      throw new Error('Quantity must be greater than zero');
    }
    const item = this._items.find(item => item.orderItemId === orderItemId);
    if (!item) {
      throw new Error('Item not found in order');
    }
    item.quantity = newQuantity;
    this.validateOrderDiscount();
  }

  // Discount management
  updateDiscountAmount(amount: number): void {
    const roundedAmount = Order.round(amount);
    
    // Validate discount amount
    if (roundedAmount < 0) {
      throw new Error('Discount amount cannot be negative');
    }
    
    // Calculate total after item discounts
    const totalAfterItemDiscounts = Order.calculateTotalAfterItemDiscounts(this._items);
    
    // console.log('Debug - updateDiscountAmount:', {
    //   roundedAmount,
    //   totalAfterItemDiscounts,
    //   items: this._items.map(item => ({
    //     quantity: item.quantity,
    //     price: item.priceAtPurchase,
    //     itemDiscount: item.discountAmount,
    //     subtotal: item.priceAtPurchase * item.quantity
    //   }))
    // });
    
    // Validate order discount against total after item discounts
    if (roundedAmount > totalAfterItemDiscounts) {
      throw new Error('Discount amount cannot be greater than total amount');
    }
    
    this._orderDiscount = roundedAmount;
  }

  // Utility methods
  private static round(value: number): number {
    // Ensure consistent rounding to 2 decimal places
    return Number((Math.round(value * 100) / 100).toFixed(2));
  }

  private static calculateRawSubtotal(items: OrderItem[]): number {
    let subtotal = 0;
    for (const item of items) {
      const itemSubtotal = item.priceAtPurchase * item.quantity;
      subtotal += itemSubtotal;
    }
    return Order.round(subtotal);
  }

  private static calculateItemDiscountsTotal(items: OrderItem[]): number {
    let total = 0;
    for (const item of items) {
      // Fixed discount amount per line item (not per unit)
      total += item.discountAmount;
    }
    return Order.round(total);
  }

  private static calculateTotalAfterItemDiscounts(items: OrderItem[]): number {
    const subtotal = Order.calculateRawSubtotal(items);
    const itemDiscounts = Order.calculateItemDiscountsTotal(items);
    const total = Order.round(subtotal - itemDiscounts);
    
    // console.log('Debug - calculateTotalAfterItemDiscounts:', {
    //   subtotal,
    //   itemDiscounts,
    //   total,
    //   items: items.map(item => ({
    //     quantity: item.quantity,
    //     price: item.priceAtPurchase,
    //     itemDiscount: item.discountAmount,
    //     subtotal: item.priceAtPurchase * item.quantity
    //   }))
    // });
    
    return total;
  }

  private validateOrderDiscount(): void {
    // Calculate total after item discounts
    const totalAfterItemDiscounts = Order.calculateTotalAfterItemDiscounts(this._items);
    
    // Validate order discount against total after item discounts
    if (this._orderDiscount > totalAfterItemDiscounts) {
      throw new Error('Discount amount cannot be greater than total amount');
    }
  }

  private isValidStatusTransition(newStatus: OrderStatus): boolean {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      'Pending': ['Confirmed', 'Cancelled'],
      'Confirmed': ['Processing', 'Cancelled'],
      'Processing': ['Shipped', 'Cancelled'],
      'Shipped': ['Delivered', 'Cancelled'],
      'Delivered': [],
      'Cancelled': []
    };

    return validTransitions[this._status].includes(newStatus);
  }

  private canModifyItems(): boolean {
    return ['Pending'].includes(this._status);
  }

  // For comparing orders
  equals(other: Order): boolean {
    return this._orderId === other.orderId;
  }

  // For creating a copy of the order
  clone(): Order {
    return new Order(
      this._orderId,
      this._userId,
      new Date(this._orderDate),
      this._status,
      this._items.map(item => ({ ...item })),
      this._orderDiscount
    );
  }
}

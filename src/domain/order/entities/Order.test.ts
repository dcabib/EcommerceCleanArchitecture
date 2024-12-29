import { Order, OrderItem, OrderStatus } from './Order';

describe('Order Entity', () => {
  const validOrderItem: OrderItem = {
    orderItemId: 'item-123',
    productId: 'prod-123',
    quantity: 2,
    priceAtPurchase: 99.99,
    warehouseId: 'wh-123',
    discountAmount: 10
  };

  const validOrderData = {
    orderId: 'order-123',
    userId: 'user-123',
    items: [validOrderItem],
    discountAmount: 5
  };

  describe('Order Creation', () => {
    it('should create a valid order', () => {
      const order = Order.create(
        validOrderData.orderId,
        validOrderData.userId,
        validOrderData.items,
        validOrderData.discountAmount
      );

      expect(order.orderId).toBe(validOrderData.orderId);
      expect(order.userId).toBe(validOrderData.userId);
      expect(order.items).toEqual(validOrderData.items);
      expect(order.status).toBe('Pending');
      expect(order.discountAmount).toBe(validOrderData.discountAmount);
      expect(order.orderDate).toBeInstanceOf(Date);
    });

    it('should calculate total amount correctly', () => {
      const order = Order.create(
        validOrderData.orderId,
        validOrderData.userId,
        validOrderData.items,
        validOrderData.discountAmount
      );

      // (99.99 * 2) - 10 = 189.98
      expect(order.totalAmount).toBe(189.98);
      // 189.98 - 5 = 184.98
      expect(order.finalAmount).toBe(184.98);
    });

    it('should throw error for missing required fields', () => {
      expect(() => {
        Order.create('', validOrderData.userId, validOrderData.items);
      }).toThrow('Order ID is required');

      expect(() => {
        Order.create(validOrderData.orderId, '', validOrderData.items);
      }).toThrow('User ID is required');
    });

    it('should throw error for empty items array', () => {
      expect(() => {
        Order.create(validOrderData.orderId, validOrderData.userId, []);
      }).toThrow('Order must contain at least one item');
    });

    it('should throw error for negative discount amount', () => {
      expect(() => {
        Order.create(
          validOrderData.orderId,
          validOrderData.userId,
          validOrderData.items,
          -10
        );
      }).toThrow('Discount amount cannot be negative');
    });

    it('should throw error if discount amount exceeds total', () => {
      expect(() => {
        Order.create(
          validOrderData.orderId,
          validOrderData.userId,
          validOrderData.items,
          1000 // Greater than total amount
        );
      }).toThrow('Discount amount cannot be greater than total amount');
    });
  });

  describe('Status Management', () => {
    let order: Order;

    beforeEach(() => {
      order = Order.create(
        validOrderData.orderId,
        validOrderData.userId,
        validOrderData.items
      );
    });

    it('should allow valid status transitions', () => {
      order.updateStatus('Confirmed');
      expect(order.status).toBe('Confirmed');

      order.updateStatus('Processing');
      expect(order.status).toBe('Processing');

      order.updateStatus('Shipped');
      expect(order.status).toBe('Shipped');

      order.updateStatus('Delivered');
      expect(order.status).toBe('Delivered');
    });

    it('should allow cancellation from valid states', () => {
      order.updateStatus('Confirmed');
      order.updateStatus('Cancelled');
      expect(order.status).toBe('Cancelled');
    });

    it('should throw error for invalid status transitions', () => {
      expect(() => {
        order.updateStatus('Delivered'); // Cannot go directly to Delivered
      }).toThrow('Invalid status transition from Pending to Delivered');

      order.updateStatus('Confirmed');
      expect(() => {
        order.updateStatus('Pending'); // Cannot go back to Pending
      }).toThrow('Invalid status transition from Confirmed to Pending');
    });

    it('should not allow changes after final states', () => {
      order.updateStatus('Confirmed');
      order.updateStatus('Processing');
      order.updateStatus('Shipped');
      order.updateStatus('Delivered');

      expect(() => {
        order.updateStatus('Cancelled');
      }).toThrow('Invalid status transition from Delivered to Cancelled');
    });

    it('should not allow transitions from Cancelled state', () => {
      order.updateStatus('Cancelled');
      
      expect(() => {
        order.updateStatus('Confirmed');
      }).toThrow('Invalid status transition from Cancelled to Confirmed');
      
      expect(() => {
        order.updateStatus('Processing');
      }).toThrow('Invalid status transition from Cancelled to Processing');
      
      expect(() => {
        order.updateStatus('Delivered');
      }).toThrow('Invalid status transition from Cancelled to Delivered');
    });
  });

  describe('Item Management', () => {
    let order: Order;

    beforeEach(() => {
      order = Order.create(
        validOrderData.orderId,
        validOrderData.userId,
        [validOrderItem]
      );
    });

    it('should add item and recalculate total', () => {
      const newItem: OrderItem = {
        ...validOrderItem,
        orderItemId: 'item-456',
        quantity: 1,
        priceAtPurchase: 49.99,
        discountAmount: 5
      };

      order.addItem(newItem);
      expect(order.items).toHaveLength(2);
      expect(order.items).toContainEqual(newItem);
      // (99.99 * 2 - 10) + (49.99 * 1 - 5) = 189.98 + 44.99 = 234.97
      expect(order.totalAmount).toBe(234.97);
    });

    it('should remove item and recalculate total', () => {
      const secondItem: OrderItem = {
        ...validOrderItem,
        orderItemId: 'item-456'
      };
      order.addItem(secondItem);
      expect(order.items).toHaveLength(2);

      order.removeItem(secondItem.orderItemId);
      expect(order.items).toHaveLength(1);
      expect(order.items[0].orderItemId).toBe(validOrderItem.orderItemId);
      expect(order.totalAmount).toBe(189.98);
    });

    it('should throw error when removing non-existent item', () => {
      expect(() => {
        order.removeItem('non-existent');
      }).toThrow('Item not found in order');
    });

    it('should throw error when removing last item', () => {
      expect(() => {
        order.removeItem(validOrderItem.orderItemId);
      }).toThrow('Cannot remove last item from order');
    });

    it('should throw error when removing item in non-Pending status', () => {
      const secondItem: OrderItem = {
        ...validOrderItem,
        orderItemId: 'item-456'
      };
      order.addItem(secondItem);
      order.updateStatus('Confirmed');

      expect(() => {
        order.removeItem(secondItem.orderItemId);
      }).toThrow('Cannot modify items in current order status');
    });

    it('should update item quantity and recalculate total', () => {
      order.updateItemQuantity(validOrderItem.orderItemId, 3);
      expect(order.items[0].quantity).toBe(3);
      // (99.99 * 3) - 10 = 289.97
      expect(order.totalAmount).toBe(289.97);
    });

    it('should throw error for invalid quantity update', () => {
      expect(() => {
        order.updateItemQuantity(validOrderItem.orderItemId, 0);
      }).toThrow('Quantity must be greater than zero');

      expect(() => {
        order.updateItemQuantity(validOrderItem.orderItemId, -1);
      }).toThrow('Quantity must be greater than zero');
    });

    it('should not allow item modifications after Pending status', () => {
      order.updateStatus('Confirmed');

      expect(() => {
        order.addItem({
          ...validOrderItem,
          orderItemId: 'item-456'
        });
      }).toThrow('Cannot modify items in current order status');

      expect(() => {
        order.updateItemQuantity(validOrderItem.orderItemId, 3);
      }).toThrow('Cannot modify items in current order status');
    });
  });

  describe('Discount Management', () => {
    it('should update discount amount', () => {
      const order = Order.create(
        validOrderData.orderId,
        validOrderData.userId,
        [validOrderItem]
      );

      order.updateDiscountAmount(20);
      
      expect(order.discountAmount).toBe(20);
      expect(order.finalAmount).toBe(169.98); // (99.99 * 2) - 10 - 20 = 169.98
    });

    it('should throw error for negative discount', () => {
      const order = Order.create(
        validOrderData.orderId,
        validOrderData.userId,
        [validOrderItem]
      );
      
      expect(() => {
        order.updateDiscountAmount(-10);
      }).toThrow('Discount amount cannot be negative');
    });

    it('should calculate amounts correctly and validate discount', () => {
      const order = Order.create(
        validOrderData.orderId,
        validOrderData.userId,
        [validOrderItem]
      );

      // Verify raw subtotal: 99.99 * 2 = 199.98
      expect(order.subtotal).toBe(199.98);

      // Verify item discounts: 10
      expect(order.itemDiscounts).toBe(10);

      // Verify total after item discounts: 199.98 - 10 = 189.98
      expect(order.totalAmount).toBe(189.98);

      // Verify final amount with no order discount: 189.98 - 0 = 189.98
      expect(order.finalAmount).toBe(189.98);

      // Verify can set valid discount: 189.98 - 50 = 139.98
      order.updateDiscountAmount(50);
      expect(order.discountAmount).toBe(50);
      expect(order.finalAmount).toBe(139.98);

      // Verify cannot set discount greater than total
      expect(() => {
        order.updateDiscountAmount(200);
      }).toThrow('Discount amount cannot be greater than total amount');
    });
  });

  describe('Utility Methods', () => {
    let order: Order;

    beforeEach(() => {
      order = Order.create(
        validOrderData.orderId,
        validOrderData.userId,
        validOrderData.items,
        validOrderData.discountAmount
      );
    });

    it('should compare orders correctly', () => {
      const sameOrder = Order.create(
        validOrderData.orderId,
        'different-user',
        [{ ...validOrderItem, quantity: 5 }]
      );
      const differentOrder = Order.create(
        'different-order',
        validOrderData.userId,
        validOrderData.items
      );

      expect(order.equals(sameOrder)).toBe(true);
      expect(order.equals(differentOrder)).toBe(false);
    });

    it('should clone order correctly', () => {
      const clone = order.clone();
      expect(clone).not.toBe(order); // Different instance
      expect(clone.orderId).toBe(order.orderId);
      expect(clone.userId).toBe(order.userId);
      expect(clone.status).toBe(order.status);
      expect(clone.items).toEqual(order.items);
      expect(clone.totalAmount).toBe(order.totalAmount);
      expect(clone.discountAmount).toBe(order.discountAmount);
      expect(clone.orderDate.getTime()).toBe(order.orderDate.getTime());
    });
  });
});

import { ProductWarehouseStock } from './ProductWarehouseStock';

describe('ProductWarehouseStock Entity', () => {
  const validStockData = {
    stockId: 'stock-123',
    productId: 'prod-123',
    warehouseId: 'wh-123',
    quantity: 100
  };

  describe('Stock Creation', () => {
    it('should create a valid stock entry', () => {
      const stock = ProductWarehouseStock.create(
        validStockData.stockId,
        validStockData.productId,
        validStockData.warehouseId,
        validStockData.quantity
      );

      expect(stock.stockId).toBe(validStockData.stockId);
      expect(stock.productId).toBe(validStockData.productId);
      expect(stock.warehouseId).toBe(validStockData.warehouseId);
      expect(stock.quantity).toBe(validStockData.quantity);
    });

    it('should throw error for missing required fields', () => {
      expect(() => {
        ProductWarehouseStock.create('', validStockData.productId, validStockData.warehouseId, validStockData.quantity);
      }).toThrow('Stock ID is required');

      expect(() => {
        ProductWarehouseStock.create(validStockData.stockId, '', validStockData.warehouseId, validStockData.quantity);
      }).toThrow('Product ID is required');

      expect(() => {
        ProductWarehouseStock.create(validStockData.stockId, validStockData.productId, '', validStockData.quantity);
      }).toThrow('Warehouse ID is required');
    });

    it('should throw error for negative quantity', () => {
      expect(() => {
        ProductWarehouseStock.create(
          validStockData.stockId,
          validStockData.productId,
          validStockData.warehouseId,
          -1
        );
      }).toThrow('Quantity cannot be negative');
    });
  });

  describe('Stock Management', () => {
    let stock: ProductWarehouseStock;

    beforeEach(() => {
      stock = ProductWarehouseStock.create(
        validStockData.stockId,
        validStockData.productId,
        validStockData.warehouseId,
        validStockData.quantity
      );
    });

    it('should add stock', () => {
      const addAmount = 50;
      const initialQuantity = stock.quantity;
      stock.addStock(addAmount);
      expect(stock.quantity).toBe(initialQuantity + addAmount);
    });

    it('should remove stock', () => {
      const removeAmount = 30;
      const initialQuantity = stock.quantity;
      stock.removeStock(removeAmount);
      expect(stock.quantity).toBe(initialQuantity - removeAmount);
    });

    it('should set quantity', () => {
      const newQuantity = 75;
      stock.setQuantity(newQuantity);
      expect(stock.quantity).toBe(newQuantity);
    });

    it('should check available stock correctly', () => {
      expect(stock.hasAvailableStock(50)).toBe(true);
      expect(stock.hasAvailableStock(150)).toBe(false);
    });

    it('should throw error for invalid stock operations', () => {
      expect(() => {
        stock.addStock(0);
      }).toThrow('Amount must be greater than zero');

      expect(() => {
        stock.addStock(-1);
      }).toThrow('Amount must be greater than zero');

      expect(() => {
        stock.removeStock(0);
      }).toThrow('Amount must be greater than zero');

      expect(() => {
        stock.removeStock(-1);
      }).toThrow('Amount must be greater than zero');

      expect(() => {
        stock.removeStock(150);
      }).toThrow('Insufficient stock');

      expect(() => {
        stock.setQuantity(-1);
      }).toThrow('Quantity cannot be negative');
    });
  });

  describe('Utility Methods', () => {
    let stock: ProductWarehouseStock;

    beforeEach(() => {
      stock = ProductWarehouseStock.create(
        validStockData.stockId,
        validStockData.productId,
        validStockData.warehouseId,
        validStockData.quantity
      );
    });

    it('should compare stock entries correctly', () => {
      const sameStock = ProductWarehouseStock.create(
        validStockData.stockId,
        'different-product',
        'different-warehouse',
        200
      );
      const differentStock = ProductWarehouseStock.create(
        'different-stock',
        validStockData.productId,
        validStockData.warehouseId,
        validStockData.quantity
      );

      expect(stock.equals(sameStock)).toBe(true);
      expect(stock.equals(differentStock)).toBe(false);
    });

    it('should clone stock correctly', () => {
      const clone = stock.clone();

      expect(clone).not.toBe(stock); // Different instance
      expect(clone.stockId).toBe(stock.stockId);
      expect(clone.productId).toBe(stock.productId);
      expect(clone.warehouseId).toBe(stock.warehouseId);
      expect(clone.quantity).toBe(stock.quantity);
    });
  });
});

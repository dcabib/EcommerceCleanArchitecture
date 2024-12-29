export class ProductWarehouseStock {
  private constructor(
    private readonly _stockId: string,
    private readonly _productId: string,
    private readonly _warehouseId: string,
    private _quantity: number
  ) {}

  static create(
    stockId: string,
    productId: string,
    warehouseId: string,
    quantity: number
  ): ProductWarehouseStock {
    if (!stockId) throw new Error('Stock ID is required');
    if (!productId) throw new Error('Product ID is required');
    if (!warehouseId) throw new Error('Warehouse ID is required');
    if (quantity < 0) throw new Error('Quantity cannot be negative');

    return new ProductWarehouseStock(stockId, productId, warehouseId, quantity);
  }

  // Getters
  get stockId(): string {
    return this._stockId;
  }

  get productId(): string {
    return this._productId;
  }

  get warehouseId(): string {
    return this._warehouseId;
  }

  get quantity(): number {
    return this._quantity;
  }

  // Stock management
  addStock(amount: number): void {
    if (amount <= 0) throw new Error('Amount must be greater than zero');
    this._quantity += amount;
  }

  removeStock(amount: number): void {
    if (amount <= 0) throw new Error('Amount must be greater than zero');
    if (amount > this._quantity) {
      throw new Error('Insufficient stock');
    }
    this._quantity -= amount;
  }

  setQuantity(newQuantity: number): void {
    if (newQuantity < 0) throw new Error('Quantity cannot be negative');
    this._quantity = newQuantity;
  }

  hasAvailableStock(amount: number): boolean {
    return this._quantity >= amount;
  }

  // For comparing stock entries
  equals(other: ProductWarehouseStock): boolean {
    return this._stockId === other.stockId;
  }

  // For creating a copy of the stock entry
  clone(): ProductWarehouseStock {
    return new ProductWarehouseStock(
      this._stockId,
      this._productId,
      this._warehouseId,
      this._quantity
    );
  }
}

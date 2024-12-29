export type PaymentMethod = 'CreditCard' | 'PayPal' | 'BankTransfer';

export class Payment {
  private constructor(
    private readonly _paymentId: string,
    private readonly _orderId: string,
    private readonly _amount: number,
    private readonly _paymentDate: Date,
    private readonly _paymentMethod: PaymentMethod,
    private readonly _transactionId: string
  ) {}

  static create(
    paymentId: string,
    orderId: string,
    amount: number,
    paymentMethod: PaymentMethod,
    transactionId: string
  ): Payment {
    if (!paymentId) throw new Error('Payment ID is required');
    if (!orderId) throw new Error('Order ID is required');
    if (amount <= 0) throw new Error('Amount must be greater than zero');
    if (!paymentMethod) throw new Error('Payment method is required');
    if (!transactionId) throw new Error('Transaction ID is required');

    const roundedAmount = Number(amount.toFixed(2));

    return new Payment(
      paymentId,
      orderId,
      roundedAmount,
      new Date(),
      paymentMethod,
      transactionId
    );
  }

  // Getters
  get paymentId(): string {
    return this._paymentId;
  }

  get orderId(): string {
    return this._orderId;
  }

  get amount(): number {
    return this._amount;
  }

  get paymentDate(): Date {
    return new Date(this._paymentDate);
  }

  get paymentMethod(): PaymentMethod {
    return this._paymentMethod;
  }

  get transactionId(): string {
    return this._transactionId;
  }

  // For comparing payments
  equals(other: Payment): boolean {
    return this._paymentId === other.paymentId;
  }

  // For creating a copy of the payment
  clone(): Payment {
    return new Payment(
      this._paymentId,
      this._orderId,
      this._amount,
      new Date(this._paymentDate),
      this._paymentMethod,
      this._transactionId
    );
  }
}

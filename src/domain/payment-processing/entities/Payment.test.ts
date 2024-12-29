import { Payment, PaymentMethod } from './Payment';

describe('Payment Entity', () => {
  const validPaymentData = {
    paymentId: 'pay-123',
    orderId: 'order-123',
    amount: 199.99,
    paymentMethod: 'CreditCard' as PaymentMethod,
    transactionId: 'tx-123'
  };

  describe('Payment Creation', () => {
    it('should create a valid payment', () => {
      const payment = Payment.create(
        validPaymentData.paymentId,
        validPaymentData.orderId,
        validPaymentData.amount,
        validPaymentData.paymentMethod,
        validPaymentData.transactionId
      );

      expect(payment.paymentId).toBe(validPaymentData.paymentId);
      expect(payment.orderId).toBe(validPaymentData.orderId);
      expect(payment.amount).toBe(validPaymentData.amount);
      expect(payment.paymentMethod).toBe(validPaymentData.paymentMethod);
      expect(payment.transactionId).toBe(validPaymentData.transactionId);
      expect(payment.paymentDate).toBeInstanceOf(Date);
    });

    it('should throw error for missing required fields', () => {
      expect(() => {
        Payment.create('', validPaymentData.orderId, validPaymentData.amount, validPaymentData.paymentMethod, validPaymentData.transactionId);
      }).toThrow('Payment ID is required');

      expect(() => {
        Payment.create(validPaymentData.paymentId, '', validPaymentData.amount, validPaymentData.paymentMethod, validPaymentData.transactionId);
      }).toThrow('Order ID is required');

      expect(() => {
        Payment.create(validPaymentData.paymentId, validPaymentData.orderId, validPaymentData.amount, '' as PaymentMethod, validPaymentData.transactionId);
      }).toThrow('Payment method is required');

      expect(() => {
        Payment.create(validPaymentData.paymentId, validPaymentData.orderId, validPaymentData.amount, validPaymentData.paymentMethod, '');
      }).toThrow('Transaction ID is required');
    });

    it('should throw error for invalid amount', () => {
      expect(() => {
        Payment.create(
          validPaymentData.paymentId,
          validPaymentData.orderId,
          0,
          validPaymentData.paymentMethod,
          validPaymentData.transactionId
        );
      }).toThrow('Amount must be greater than zero');

      expect(() => {
        Payment.create(
          validPaymentData.paymentId,
          validPaymentData.orderId,
          -1,
          validPaymentData.paymentMethod,
          validPaymentData.transactionId
        );
      }).toThrow('Amount must be greater than zero');
    });

    it('should round amount to 2 decimal places', () => {
      const payment = Payment.create(
        validPaymentData.paymentId,
        validPaymentData.orderId,
        199.999,
        validPaymentData.paymentMethod,
        validPaymentData.transactionId
      );

      expect(payment.amount).toBe(200.00);
    });
  });

  describe('Utility Methods', () => {
    let payment: Payment;

    beforeEach(() => {
      payment = Payment.create(
        validPaymentData.paymentId,
        validPaymentData.orderId,
        validPaymentData.amount,
        validPaymentData.paymentMethod,
        validPaymentData.transactionId
      );
    });

    it('should compare payments correctly', () => {
      const samePayment = Payment.create(
        validPaymentData.paymentId,
        'different-order',
        300,
        'PayPal',
        'different-tx'
      );
      const differentPayment = Payment.create(
        'different-payment',
        validPaymentData.orderId,
        validPaymentData.amount,
        validPaymentData.paymentMethod,
        validPaymentData.transactionId
      );

      expect(payment.equals(samePayment)).toBe(true);
      expect(payment.equals(differentPayment)).toBe(false);
    });

    it('should clone payment correctly', () => {
      const clone = payment.clone();

      expect(clone).not.toBe(payment); // Different instance
      expect(clone.paymentId).toBe(payment.paymentId);
      expect(clone.orderId).toBe(payment.orderId);
      expect(clone.amount).toBe(payment.amount);
      expect(clone.paymentMethod).toBe(payment.paymentMethod);
      expect(clone.transactionId).toBe(payment.transactionId);
      expect(clone.paymentDate.getTime()).toBe(payment.paymentDate.getTime());
    });
  });
});

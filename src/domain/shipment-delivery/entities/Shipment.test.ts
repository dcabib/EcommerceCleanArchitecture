import { Shipment, DeliveryAddress, Delivery, ShipmentStatus, Carrier } from './Shipment';

describe('Shipment Entity', () => {
  const validDeliveryAddress: DeliveryAddress = {
    street: '123 Delivery St',
    city: 'Delivery City',
    state: 'DC',
    postalCode: '12345',
    country: 'USA'
  };

  const validDelivery: Delivery = {
    deliveryDate: new Date(),
    signature: 'John Doe',
    deliveryAddress: validDeliveryAddress
  };

  const validShipmentData = {
    shipmentId: 'ship-123',
    orderId: 'order-123',
    expectedDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
    trackingNumber: 'track-123',
    carrier: 'UPS' as Carrier
  };

  describe('Shipment Creation', () => {
    it('should create a valid shipment', () => {
      const shipment = Shipment.create(
        validShipmentData.shipmentId,
        validShipmentData.orderId,
        validShipmentData.expectedDeliveryDate,
        validShipmentData.trackingNumber,
        validShipmentData.carrier
      );

      expect(shipment.shipmentId).toBe(validShipmentData.shipmentId);
      expect(shipment.orderId).toBe(validShipmentData.orderId);
      expect(shipment.shipmentDate).toBeInstanceOf(Date);
      expect(shipment.expectedDeliveryDate).toEqual(validShipmentData.expectedDeliveryDate);
      expect(shipment.status).toBe('Pending');
      expect(shipment.trackingNumber).toBe(validShipmentData.trackingNumber);
      expect(shipment.carrier).toBe(validShipmentData.carrier);
      expect(shipment.delivery).toBeNull();
    });

    it('should throw error for missing required fields', () => {
      expect(() => {
        Shipment.create('', validShipmentData.orderId, validShipmentData.expectedDeliveryDate, validShipmentData.trackingNumber, validShipmentData.carrier);
      }).toThrow('Shipment ID is required');

      expect(() => {
        Shipment.create(validShipmentData.shipmentId, '', validShipmentData.expectedDeliveryDate, validShipmentData.trackingNumber, validShipmentData.carrier);
      }).toThrow('Order ID is required');

      expect(() => {
        Shipment.create(validShipmentData.shipmentId, validShipmentData.orderId, null as any, validShipmentData.trackingNumber, validShipmentData.carrier);
      }).toThrow('Expected delivery date is required');

      expect(() => {
        Shipment.create(validShipmentData.shipmentId, validShipmentData.orderId, validShipmentData.expectedDeliveryDate, '', validShipmentData.carrier);
      }).toThrow('Tracking number is required');

      expect(() => {
        Shipment.create(validShipmentData.shipmentId, validShipmentData.orderId, validShipmentData.expectedDeliveryDate, validShipmentData.trackingNumber, '' as Carrier);
      }).toThrow('Carrier is required');
    });

    it('should throw error for past expected delivery date', () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // yesterday
      expect(() => {
        Shipment.create(
          validShipmentData.shipmentId,
          validShipmentData.orderId,
          pastDate,
          validShipmentData.trackingNumber,
          validShipmentData.carrier
        );
      }).toThrow('Expected delivery date must be in the future');
    });
  });

  describe('Status Management', () => {
    let shipment: Shipment;

    beforeEach(() => {
      shipment = Shipment.create(
        validShipmentData.shipmentId,
        validShipmentData.orderId,
        validShipmentData.expectedDeliveryDate,
        validShipmentData.trackingNumber,
        validShipmentData.carrier
      );
    });

    it('should mark as in transit', () => {
      shipment.markAsInTransit();
      expect(shipment.status).toBe('InTransit');
    });

    it('should mark as delivered', () => {
      shipment.markAsInTransit();
      shipment.markAsDelivered(validDelivery);
      expect(shipment.status).toBe('Delivered');
      expect(shipment.delivery).toEqual({
        ...validDelivery,
        deliveryDate: expect.any(Date)
      });
    });

    it('should mark as failed', () => {
      shipment.markAsInTransit();
      shipment.markAsFailed();
      expect(shipment.status).toBe('Failed');
    });

    it('should throw error for invalid status transitions', () => {
      expect(() => {
        shipment.markAsDelivered(validDelivery);
      }).toThrow('Cannot mark as delivered from Pending status');

      shipment.markAsInTransit();
      shipment.markAsDelivered(validDelivery);

      expect(() => {
        shipment.markAsFailed();
      }).toThrow('Cannot mark delivered shipment as failed');
    });

    it('should throw error for invalid delivery data', () => {
      shipment.markAsInTransit();

      expect(() => {
        shipment.markAsDelivered({
          ...validDelivery,
          signature: ''
        });
      }).toThrow('Signature is required');

      expect(() => {
        shipment.markAsDelivered({
          ...validDelivery,
          deliveryAddress: {
            ...validDeliveryAddress,
            street: ''
          }
        });
      }).toThrow('Street is required');
    });
  });

  describe('Utility Methods', () => {
    let shipment: Shipment;

    beforeEach(() => {
      shipment = Shipment.create(
        validShipmentData.shipmentId,
        validShipmentData.orderId,
        validShipmentData.expectedDeliveryDate,
        validShipmentData.trackingNumber,
        validShipmentData.carrier
      );
    });

    it('should compare shipments correctly', () => {
      const sameShipment = Shipment.create(
        validShipmentData.shipmentId,
        'different-order',
        new Date(Date.now() + 48 * 60 * 60 * 1000),
        'different-tracking',
        'FedEx'
      );
      const differentShipment = Shipment.create(
        'different-shipment',
        validShipmentData.orderId,
        validShipmentData.expectedDeliveryDate,
        validShipmentData.trackingNumber,
        validShipmentData.carrier
      );

      expect(shipment.equals(sameShipment)).toBe(true);
      expect(shipment.equals(differentShipment)).toBe(false);
    });

    it('should clone shipment correctly', () => {
      shipment.markAsInTransit();
      shipment.markAsDelivered(validDelivery);

      const clone = shipment.clone();

      expect(clone).not.toBe(shipment); // Different instance
      expect(clone.shipmentId).toBe(shipment.shipmentId);
      expect(clone.orderId).toBe(shipment.orderId);
      expect(clone.shipmentDate.getTime()).toBe(shipment.shipmentDate.getTime());
      expect(clone.expectedDeliveryDate.getTime()).toBe(shipment.expectedDeliveryDate.getTime());
      expect(clone.status).toBe(shipment.status);
      expect(clone.trackingNumber).toBe(shipment.trackingNumber);
      expect(clone.carrier).toBe(shipment.carrier);
      expect(clone.delivery).toEqual(shipment.delivery);
    });
  });
});

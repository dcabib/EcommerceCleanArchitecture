export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Delivery {
  deliveryDate: Date;
  signature: string;
  deliveryAddress: DeliveryAddress;
}

export type ShipmentStatus = 'Pending' | 'InTransit' | 'Delivered' | 'Failed';
export type Carrier = 'UPS' | 'FedEx' | 'DHL';

export class Shipment {
  private constructor(
    private readonly _shipmentId: string,
    private readonly _orderId: string,
    private readonly _shipmentDate: Date,
    private readonly _expectedDeliveryDate: Date,
    private _status: ShipmentStatus,
    private readonly _trackingNumber: string,
    private readonly _carrier: Carrier,
    private _delivery: Delivery | null
  ) {}

  static create(
    shipmentId: string,
    orderId: string,
    expectedDeliveryDate: Date,
    trackingNumber: string,
    carrier: Carrier
  ): Shipment {
    if (!shipmentId) throw new Error('Shipment ID is required');
    if (!orderId) throw new Error('Order ID is required');
    if (!expectedDeliveryDate) throw new Error('Expected delivery date is required');
    if (expectedDeliveryDate <= new Date()) {
      throw new Error('Expected delivery date must be in the future');
    }
    if (!trackingNumber) throw new Error('Tracking number is required');
    if (!carrier) throw new Error('Carrier is required');

    return new Shipment(
      shipmentId,
      orderId,
      new Date(),
      expectedDeliveryDate,
      'Pending',
      trackingNumber,
      carrier,
      null
    );
  }

  // Getters
  get shipmentId(): string {
    return this._shipmentId;
  }

  get orderId(): string {
    return this._orderId;
  }

  get shipmentDate(): Date {
    return new Date(this._shipmentDate);
  }

  get expectedDeliveryDate(): Date {
    return new Date(this._expectedDeliveryDate);
  }

  get status(): ShipmentStatus {
    return this._status;
  }

  get trackingNumber(): string {
    return this._trackingNumber;
  }

  get carrier(): Carrier {
    return this._carrier;
  }

  get delivery(): Delivery | null {
    return this._delivery ? {
      deliveryDate: new Date(this._delivery.deliveryDate),
      signature: this._delivery.signature,
      deliveryAddress: { ...this._delivery.deliveryAddress }
    } : null;
  }

  // Status management
  markAsInTransit(): void {
    if (this._status !== 'Pending') {
      throw new Error(`Cannot mark as in transit from ${this._status} status`);
    }
    this._status = 'InTransit';
  }

  markAsDelivered(delivery: Delivery): void {
    if (this._status !== 'InTransit') {
      throw new Error(`Cannot mark as delivered from ${this._status} status`);
    }
    if (!delivery.deliveryDate) throw new Error('Delivery date is required');
    if (!delivery.signature) throw new Error('Signature is required');
    if (!delivery.deliveryAddress) throw new Error('Delivery address is required');
    if (!delivery.deliveryAddress.street) throw new Error('Street is required');
    if (!delivery.deliveryAddress.city) throw new Error('City is required');
    if (!delivery.deliveryAddress.state) throw new Error('State is required');
    if (!delivery.deliveryAddress.postalCode) throw new Error('Postal code is required');
    if (!delivery.deliveryAddress.country) throw new Error('Country is required');

    this._status = 'Delivered';
    this._delivery = {
      deliveryDate: new Date(delivery.deliveryDate),
      signature: delivery.signature,
      deliveryAddress: { ...delivery.deliveryAddress }
    };
  }

  markAsFailed(): void {
    if (this._status === 'Delivered') {
      throw new Error('Cannot mark delivered shipment as failed');
    }
    this._status = 'Failed';
  }

  // For comparing shipments
  equals(other: Shipment): boolean {
    return this._shipmentId === other.shipmentId;
  }

  // For creating a copy of the shipment
  clone(): Shipment {
    return new Shipment(
      this._shipmentId,
      this._orderId,
      new Date(this._shipmentDate),
      new Date(this._expectedDeliveryDate),
      this._status,
      this._trackingNumber,
      this._carrier,
      this._delivery ? {
        deliveryDate: new Date(this._delivery.deliveryDate),
        signature: this._delivery.signature,
        deliveryAddress: { ...this._delivery.deliveryAddress }
      } : null
    );
  }
}

export interface Location {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export class Warehouse {
  private constructor(
    private readonly _warehouseId: string,
    private _name: string,
    private _location: Location,
    private _capacity: number
  ) {}

  static create(
    warehouseId: string,
    name: string,
    location: Location,
    capacity: number
  ): Warehouse {
    if (!warehouseId) throw new Error('Warehouse ID is required');
    if (!name) throw new Error('Warehouse name is required');
    if (!location) throw new Error('Warehouse location is required');
    if (!location.street) throw new Error('Street is required');
    if (!location.city) throw new Error('City is required');
    if (!location.state) throw new Error('State is required');
    if (!location.postalCode) throw new Error('Postal code is required');
    if (!location.country) throw new Error('Country is required');
    if (capacity <= 0) throw new Error('Capacity must be greater than zero');

    return new Warehouse(warehouseId, name, location, capacity);
  }

  // Getters
  get warehouseId(): string {
    return this._warehouseId;
  }

  get name(): string {
    return this._name;
  }

  get location(): Location {
    return JSON.parse(JSON.stringify(this._location));
  }

  get capacity(): number {
    return this._capacity;
  }

  // Setters
  updateName(name: string): void {
    if (!name) throw new Error('Warehouse name cannot be empty');
    this._name = name;
  }

  updateLocation(location: Location): void {
    if (!location) throw new Error('Location cannot be empty');
    if (!location.street) throw new Error('Street is required');
    if (!location.city) throw new Error('City is required');
    if (!location.state) throw new Error('State is required');
    if (!location.postalCode) throw new Error('Postal code is required');
    if (!location.country) throw new Error('Country is required');
    this._location = { ...location };
  }

  updateCapacity(capacity: number): void {
    if (capacity <= 0) throw new Error('Capacity must be greater than zero');
    this._capacity = capacity;
  }

  // For comparing warehouses
  equals(other: Warehouse): boolean {
    return this._warehouseId === other.warehouseId;
  }

  // For creating a copy of the warehouse
  clone(): Warehouse {
    return new Warehouse(
      this._warehouseId,
      this._name,
      JSON.parse(JSON.stringify(this._location)),
      this._capacity
    );
  }
}

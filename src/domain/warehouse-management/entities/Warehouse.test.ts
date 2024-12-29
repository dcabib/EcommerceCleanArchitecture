import { Warehouse, Location } from './Warehouse';

describe('Warehouse Entity', () => {
  const validLocation: Location = {
    street: '123 Storage St',
    city: 'Warehouse City',
    state: 'WH',
    postalCode: '12345',
    country: 'USA'
  };

  const validWarehouseData = {
    warehouseId: 'wh-123',
    name: 'Main Warehouse',
    location: validLocation,
    capacity: 1000
  };

  describe('Warehouse Creation', () => {
    it('should create a valid warehouse', () => {
      const warehouse = Warehouse.create(
        validWarehouseData.warehouseId,
        validWarehouseData.name,
        validWarehouseData.location,
        validWarehouseData.capacity
      );

      expect(warehouse.warehouseId).toBe(validWarehouseData.warehouseId);
      expect(warehouse.name).toBe(validWarehouseData.name);
      expect(warehouse.location).toEqual(validWarehouseData.location);
      expect(warehouse.capacity).toBe(validWarehouseData.capacity);
    });

    it('should throw error for missing required fields', () => {
      expect(() => {
        Warehouse.create('', validWarehouseData.name, validWarehouseData.location, validWarehouseData.capacity);
      }).toThrow('Warehouse ID is required');

      expect(() => {
        Warehouse.create(validWarehouseData.warehouseId, '', validWarehouseData.location, validWarehouseData.capacity);
      }).toThrow('Warehouse name is required');

      expect(() => {
        Warehouse.create(validWarehouseData.warehouseId, validWarehouseData.name, null as any, validWarehouseData.capacity);
      }).toThrow('Warehouse location is required');

      expect(() => {
        Warehouse.create(validWarehouseData.warehouseId, validWarehouseData.name, validWarehouseData.location, 0);
      }).toThrow('Capacity must be greater than zero');
    });

    it('should throw error for invalid location fields', () => {
      const invalidLocation = { ...validLocation, street: '' };
      expect(() => {
        Warehouse.create(validWarehouseData.warehouseId, validWarehouseData.name, invalidLocation, validWarehouseData.capacity);
      }).toThrow('Street is required');

      const invalidLocation2 = { ...validLocation, city: '' };
      expect(() => {
        Warehouse.create(validWarehouseData.warehouseId, validWarehouseData.name, invalidLocation2, validWarehouseData.capacity);
      }).toThrow('City is required');

      const invalidLocation3 = { ...validLocation, state: '' };
      expect(() => {
        Warehouse.create(validWarehouseData.warehouseId, validWarehouseData.name, invalidLocation3, validWarehouseData.capacity);
      }).toThrow('State is required');

      const invalidLocation4 = { ...validLocation, postalCode: '' };
      expect(() => {
        Warehouse.create(validWarehouseData.warehouseId, validWarehouseData.name, invalidLocation4, validWarehouseData.capacity);
      }).toThrow('Postal code is required');

      const invalidLocation5 = { ...validLocation, country: '' };
      expect(() => {
        Warehouse.create(validWarehouseData.warehouseId, validWarehouseData.name, invalidLocation5, validWarehouseData.capacity);
      }).toThrow('Country is required');
    });
  });

  describe('Warehouse Updates', () => {
    let warehouse: Warehouse;

    beforeEach(() => {
      warehouse = Warehouse.create(
        validWarehouseData.warehouseId,
        validWarehouseData.name,
        validWarehouseData.location,
        validWarehouseData.capacity
      );
    });

    it('should update name', () => {
      const newName = 'Secondary Warehouse';
      warehouse.updateName(newName);
      expect(warehouse.name).toBe(newName);
    });

    it('should update location', () => {
      const newLocation: Location = {
        street: '456 Storage Ave',
        city: 'New City',
        state: 'NS',
        postalCode: '67890',
        country: 'USA'
      };
      warehouse.updateLocation(newLocation);
      expect(warehouse.location).toEqual(newLocation);
    });

    it('should update capacity', () => {
      const newCapacity = 2000;
      warehouse.updateCapacity(newCapacity);
      expect(warehouse.capacity).toBe(newCapacity);
    });

    it('should throw error for invalid updates', () => {
      expect(() => {
        warehouse.updateName('');
      }).toThrow('Warehouse name cannot be empty');

      expect(() => {
        warehouse.updateLocation({ ...validLocation, street: '' });
      }).toThrow('Street is required');

      expect(() => {
        warehouse.updateCapacity(0);
      }).toThrow('Capacity must be greater than zero');
    });
  });

  describe('Utility Methods', () => {
    let warehouse: Warehouse;

    beforeEach(() => {
      warehouse = Warehouse.create(
        validWarehouseData.warehouseId,
        validWarehouseData.name,
        validWarehouseData.location,
        validWarehouseData.capacity
      );
    });

    it('should compare warehouses correctly', () => {
      const sameWarehouse = Warehouse.create(
        validWarehouseData.warehouseId,
        'Different Name',
        { ...validLocation, street: 'Different Street' },
        2000
      );
      const differentWarehouse = Warehouse.create(
        'different-id',
        validWarehouseData.name,
        validWarehouseData.location,
        validWarehouseData.capacity
      );

      expect(warehouse.equals(sameWarehouse)).toBe(true);
      expect(warehouse.equals(differentWarehouse)).toBe(false);
    });

    it('should clone warehouse correctly', () => {
      const clone = warehouse.clone();

      expect(clone).not.toBe(warehouse); // Different instance
      expect(clone.warehouseId).toBe(warehouse.warehouseId);
      expect(clone.name).toBe(warehouse.name);
      expect(clone.location).toEqual(warehouse.location);
      expect(clone.capacity).toBe(warehouse.capacity);
    });
  });
});

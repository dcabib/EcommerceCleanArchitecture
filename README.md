# E-commerce Clean Architecture

A robust e-commerce application built using Clean Architecture principles in TypeScript, emphasizing modularity, testability, and maintainability.

## Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                     Presentation Layer                    │
│                   (Controllers/Views/UI)                  │
├──────────────────────────────────────────────────────────┤
│                    Application Layer                      │
│                       (Use Cases)                         │
├──────────────────────────────────────────────────────────┤
│                      Domain Layer                         │
│                (Entities/Repositories)                    │
├──────────────────────────────────────────────────────────┤
│                  Infrastructure Layer                     │
│              (Frameworks/Databases/External)              │
└──────────────────────────────────────────────────────────┘
```

## Core Domains

### 1. User Management
- **Entities**: User, Role
- **Use Cases**: CreateUserUseCase
- **Repositories**: IUserRepository
- **Key Features**: User authentication, authorization, role management

### 2. Product Catalog
- **Entities**: Product, Category
- **Use Cases**: CreateProductUseCase
- **Repositories**: IProductRepository
- **Key Features**: Product management, categorization

### 3. Order Processing
- **Entities**: Order
- **Use Cases**: CreateOrderUseCase
- **Repositories**: IOrderRepository
- **Key Features**: Order creation, management

### 4. Payment Processing
- **Entities**: Payment
- **Key Features**: Payment handling, transaction management

### 5. Shipment Delivery
- **Entities**: Shipment
- **Key Features**: Shipment tracking, delivery management

### 6. Warehouse Management
- **Entities**: Warehouse, ProductWarehouseStock
- **Key Features**: Inventory management, stock tracking

## Business Rules

### User Management
- Users must have a unique email address
- Passwords must be at least 8 characters long with a mix of letters, numbers, and symbols
- User roles determine access levels and permissions
- Users can have multiple roles
- Admin role has full system access
- Customer role has limited access to order management and profile updates

### Product Catalog
- Products must have a unique SKU
- Product price cannot be negative
- Products must belong to at least one category
- Product stock levels must be non-negative
- Products can be marked as active/inactive
- Categories can have subcategories up to 3 levels deep

### Order Processing
- Orders must be associated with a registered user
- Order total must be calculated from product prices and quantities
- Orders cannot contain out-of-stock products
- Orders must have a valid shipping address
- Order status transitions must follow defined workflow:
  1. Created → Pending Payment
  2. Pending Payment → Paid/Cancelled
  3. Paid → Processing
  4. Processing → Shipped/Cancelled
  5. Shipped → Delivered

### Payment Processing
- Payment amount must match order total
- Payment status must be tracked (Pending, Completed, Failed, Refunded)
- Failed payments must trigger order status update
- Refunds can only be processed for completed payments
- Payment methods must be validated before processing

### Shipment Delivery
- Shipment must be linked to a paid order
- Shipping address must be validated
- Tracking number must be generated for each shipment
- Delivery updates must be logged with timestamps
- Multiple shipments can be created for a single order
- Shipping rates must be calculated based on:
  - Package weight
  - Delivery distance
  - Shipping method

### Warehouse Management
- Each product must be assigned to at least one warehouse
- Stock levels must be updated in real-time
- Low stock alerts must be triggered at defined thresholds
- Stock transfers between warehouses must be tracked
- Stock counts must be reconciled periodically
- FIFO (First In, First Out) principle for perishable items
- Minimum and maximum stock levels must be maintained

## Entity Relationships

```
┌─────────┐     ┌─────────┐     ┌──────────┐
│  User   │────▶│  Order  │────▶│  Payment  │
└─────────┘     └─────────┘     └──────────┘
     │              │                 │
     │              │                 │
     ▼              ▼                 ▼
┌─────────┐     ┌─────────┐     ┌──────────┐
│ Product │────▶│Shipment │────▶│ Warehouse │
└─────────┘     └─────────┘     └──────────┘
     │
     │
     ▼
┌─────────┐
│Category │
└─────────┘
```

## Project Structure

```
src/
├── application/
│   ├── interfaces/
│   │   └── IPasswordHasher.ts
│   └── use-cases/
│       ├── order-processing/
│       ├── product-catalog/
│       └── user-management/
├── domain/
│   ├── order-processing/
│   ├── payment-processing/
│   ├── product-catalog/
│   ├── shipment-delivery/
│   ├── user-management/
│   └── warehouse-management/
└── infrastructure/ (to be implemented)
    ├── database/
    ├── external-services/
    └── web/
```

## Testing

The project uses Jest for testing and maintains high test coverage across all domains.

### Test Structure
- Unit tests for all entities
- Integration tests for use cases
- Repository interface tests
- Coverage reports available in `/coverage`

### Running Tests
```bash
npm test          # Run all tests
npm run test:cov  # Run tests with coverage
```

## Technical Details

### Domain Layer
- Contains business logic and rules
- Pure TypeScript with no external dependencies
- Includes entities, value objects, and repository interfaces
- Implements domain events and aggregates

### Application Layer
- Implements use cases
- Orchestrates domain objects
- Handles business operations
- Manages transactions

### Infrastructure Layer (To Be Implemented)
- Will contain implementations of repositories
- Database access and external service integrations
- Framework-specific code
- API implementations

## Setup and Installation

1. Clone the repository
```bash
git clone [repository-url]
cd ecommerce-clean-architecture
```

2. Install dependencies
```bash
npm install
```

3. Run tests
```bash
npm test
```

## Development Guidelines

1. **Clean Architecture Principles**
   - Dependencies point inward
   - Domain layer has no external dependencies
   - Use interfaces for external services

2. **Testing**
   - Write tests before implementation
   - Maintain high test coverage
   - Use meaningful test descriptions

3. **Code Organization**
   - Follow domain-driven design principles
   - Keep modules focused and cohesive
   - Use clear naming conventions

## Future Enhancements

1. Infrastructure Layer Implementation
   - Database integration
   - External service connections
   - API endpoints

2. Additional Features
   - Shopping cart management
   - Discount system
   - Review system
   - Analytics integration

3. Technical Improvements
   - API documentation
   - Performance monitoring
   - Logging system
   - CI/CD pipeline

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[License Type] - See LICENSE file for details

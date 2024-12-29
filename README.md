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

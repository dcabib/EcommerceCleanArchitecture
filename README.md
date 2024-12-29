# E-commerce Clean Architecture

A TypeScript implementation of an e-commerce system using Clean Architecture principles. This project demonstrates domain-driven design, separation of concerns, and test-driven development.

## Architecture Overview

The project follows Clean Architecture principles, organizing code into concentric layers:

```
┌──────────────────────────────────────┐
│              Interface               │
│  (Controllers, Views, CLI, etc.)     │
├──────────────────────────────────────┤
│            Application              │
│  (Use Cases, DTOs, Interfaces)      │
├──────────────────────────────────────┤
│              Domain                 │
│  (Entities, Value Objects, Rules)    │
├──────────────────────────────────────┤
│           Infrastructure            │
│  (Frameworks, Databases, External)   │
└──────────────────────────────────────┘
```

### Key Principles

- **Independence of Frameworks**: The business logic is independent of external frameworks
- **Testability**: Business rules can be tested without external elements
- **Independence of UI**: The UI can change without changing the business rules
- **Independence of Database**: Business rules are not bound to a specific database
- **Independence of External Agency**: Business rules don't know anything about the outside world

## Domain Entities

### Core Entities and Relationships

```
┌─────────────┐     ┌──────────┐     ┌────────────┐
│    User     │     │  Order   │     │  Product   │
├─────────────┤     ├──────────┤     ├────────────┤
│ - userId    │     │- orderId │     │- productId │
│ - username  │     │- userId  │     │- name      │
│ - email     │     │- items   │     │- price     │
│ - addresses │     │- status  │     │- category  │
└─────────────┘     └──────────┘     └────────────┘
       │                 │                  │
       │                 │                  │
       │          ┌──────────────┐         │
       └──────────│  OrderItem   │─────────┘
                 ├──────────────┤
                 │- orderItemId │
                 │- productId   │
                 │- quantity    │
                 │- warehouseId │
                 └──────────────┘
                        │
                 ┌──────────────┐
                 │  Warehouse   │
                 ├──────────────┤
                 │- warehouseId │
                 │- location    │
                 │- capacity    │
                 └──────────────┘
```

### Entity Details

#### User
- Manages customer and admin accounts
- Handles multiple shipping addresses
- Validates email format
- Supports role-based access (Customer/Admin)

#### Product
- Manages product information and pricing
- Supports product categories
- Handles product reviews and ratings
- Manages product discounts

#### Order
- Processes customer orders
- Manages order status lifecycle
- Handles order-level and item-level discounts
- Validates order modifications
- Calculates order totals

#### Warehouse
- Manages multiple warehouse locations
- Tracks product inventory
- Handles stock allocation

#### ProductWarehouseStock
- Manages product inventory across warehouses
- Tracks stock levels
- Prevents negative inventory

## Business Rules

### Order Management
1. Orders must contain at least one item
2. Order discount cannot exceed total amount
3. Items can only be modified in 'Pending' status
4. Valid order status transitions:
   - Pending → Confirmed/Cancelled
   - Confirmed → Processing/Cancelled
   - Processing → Shipped/Cancelled
   - Shipped → Delivered/Cancelled
   - Delivered/Cancelled → (no further transitions)

### Inventory Management
1. Product stock cannot be negative
2. Each product can have stock in multiple warehouses
3. Stock removal requires sufficient quantity

### User Management
1. Email addresses must be valid
2. Users can have multiple shipping addresses
3. Users must have a billing address
4. Supports Customer and Admin roles

## Project Structure

```
src/
├── application/
│   ├── interfaces/
│   │   └── IPasswordHasher.ts
│   └── use-cases/
│       ├── order/
│       ├── product/
│       └── user/
├── domain/
│   ├── order/
│   │   ├── entities/
│   │   └── repositories/
│   ├── product/
│   │   ├── entities/
│   │   └── repositories/
│   ├── user/
│   │   ├── entities/
│   │   └── repositories/
│   └── warehouse/
│       └── entities/
└── infrastructure/
    ├── persistence/
    └── services/
```

## Testing Approach

The project follows Test-Driven Development (TDD) principles:

1. **Unit Tests**: Testing individual entities and their business rules
2. **Integration Tests**: Testing use cases and their interactions
3. **Repository Tests**: Testing data persistence operations

### Test Examples

- Order entity tests validate:
  - Order creation rules
  - Discount calculations
  - Status transitions
  - Item modifications
  - Total calculations

- User entity tests verify:
  - User creation validation
  - Email format validation
  - Address management
  - Role assignments

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run tests:
   ```bash
   npm test
   ```
4. Build the project:
   ```bash
   npm run build
   ```

## Development Guidelines

1. Follow TDD approach
2. Keep entities pure and framework-independent
3. Use value objects for complex value types
4. Implement repository interfaces for data access
5. Use use cases for business operations
6. Validate business rules at the domain level

## Error Handling

- Domain entities throw errors for business rule violations
- Use cases handle errors and translate to appropriate responses
- Repository implementations handle data access errors
- All errors include meaningful messages for debugging

## Future Enhancements

1. Implement payment processing
2. Add order fulfillment system
3. Implement inventory optimization
4. Add real-time stock updates
5. Implement advanced discount rules
6. Add product recommendation system

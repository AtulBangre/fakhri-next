# Backend Architecture Documentation

## Overview

This document describes the backend architecture for the Fakhri IT Services application, following a layered architecture pattern for clean separation of concerns.

## Directory Structure

```
fakhri-it-services/
├── app/
│   └── api/                    # Next.js API Routes
│       ├── auth/               # Authentication endpoints
│       ├── contact/            # Contact form endpoints
│       ├── health/             # Health check endpoint
│       ├── orders/             # Order management
│       ├── plans/              # Pricing plans
│       ├── pricing/            # Public pricing data
│       ├── products/           # Product management
│       ├── tasks/              # Task management
│       ├── transactions/       # Payment transactions
│       └── users/              # User management
├── controllers/                # Request handlers
├── middleware/                 # Request/Response middleware
├── models/                     # Database schemas (Mongoose)
├── services/                   # Business logic layer
├── utils/                      # Utility functions
└── lib/                        # Library configurations
```

## Architecture Layers

### 1. API Routes (`app/api/`)
- Next.js App Router API endpoints
- Handle HTTP request/response
- Delegate to controllers

### 2. Controllers (`controllers/`)
- Handle request validation
- Authentication/authorization checks
- Delegate to services
- Format responses

### 3. Services (`services/`)
- Core business logic
- Database operations
- Data transformations
- External API calls

### 4. Middleware (`middleware/`)
- Authentication verification
- Request validation
- Rate limiting
- Error handling

### 5. Models (`models/`)
- Mongoose schemas
- Database indices
- Virtual fields
- Pre/post hooks

### 6. Utils (`utils/`)
- Helper functions
- Constants
- Type definitions

## Models

| Model | Description |
|-------|-------------|
| User | User accounts (Super Admin, Admin, Client) |
| Role | Role-based permissions |
| Plan | Subscription plans |
| Product | Services and add-ons |
| Order | Customer orders |
| Transaction | Payment records |
| Task | Client work tasks |
| Invoice | Billing invoices |
| Note | Client notes |
| File | Uploaded documents |
| Notification | In-app alerts |
| Service | Service catalog |
| ContactMessage | Contact form submissions |

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/[...nextauth]` | NextAuth.js handler |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users (Super Admin) |
| POST | `/api/users` | Create user (Super Admin) |
| GET | `/api/users/me` | Get current user |
| PUT | `/api/users/me` | Update current user |
| GET | `/api/users/[id]` | Get user by ID |
| PUT | `/api/users/[id]` | Update user (Super Admin) |
| DELETE | `/api/users/[id]` | Delete user (Super Admin) |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List all orders (Admin) |
| POST | `/api/orders` | Create order |
| GET | `/api/orders/my` | Get my orders |
| GET | `/api/orders/[id]` | Get order by ID |
| PUT | `/api/orders/[id]` | Update order status |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | List transactions (Super Admin) |
| POST | `/api/transactions` | Initialize payment |
| POST | `/api/transactions/verify` | Verify payment |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List all tasks |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/my` | Get my tasks |
| GET | `/api/tasks/[id]` | Get task by ID |
| PUT | `/api/tasks/[id]` | Update task |
| DELETE | `/api/tasks/[id]` | Delete task (Super Admin) |

### Contact
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contact` | List messages (Admin) |
| POST | `/api/contact` | Submit contact form (Public) |
| GET | `/api/contact/[id]` | Get message by ID |
| PUT | `/api/contact/[id]` | Update message status |

### Products & Plans
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (Public) |
| POST | `/api/products` | Create product (Super Admin) |
| GET | `/api/plans` | List plans (Public) |
| POST | `/api/plans` | Create plan (Super Admin) |
| GET | `/api/pricing` | Get pricing data (Public) |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/seed/status` | Database seed status |

## Controllers

### UserController
- Profile management
- User CRUD operations
- Client assignment
- Dashboard statistics

### OrderController
- Order creation
- Status management
- Subscription handling
- Order statistics

### TransactionController
- Payment initialization
- Razorpay verification
- Refund processing
- Transaction statistics

### ContactController
- Form submission (with rate limiting)
- Message management
- Response tracking
- Spam detection

### ProductController
- Product CRUD
- Plan management
- Pricing data

### TaskController
- Task CRUD
- Status updates
- Assignment management
- Task statistics

## Middleware

### Auth Middleware (`middleware/auth.js`)
- `getSession()` - Get current session
- `requireAuth()` - Require authentication
- `requireRole(roles)` - Require specific role(s)
- `requireSuperAdmin()` - Require super admin
- `requireAdmin()` - Require admin or super admin
- `requireClient()` - Require client role
- `getCurrentUser()` - Get current user details

### Validation Middleware (`middleware/validation.js`)
- `validateBody(body, schema)` - Validate request body
- `withValidation(schema)` - Create validation handler
- Common validation schemas for login, register, contact, etc.

### Error Handler (`middleware/errorHandler.js`)
- `ApiError` - Custom error class
- `createError` - Error factory methods
- `handleError()` - Error formatting
- `asyncHandler()` - Async wrapper

### Rate Limiting (`middleware/rateLimit.js`)
- `checkRateLimit()` - Check request limits
- `withRateLimit()` - Rate limit middleware
- Configurable limits per endpoint

## Services

### UserService
- User CRUD operations
- Password hashing/comparison
- Client-manager assignments
- Dashboard statistics

### OrderService
- Order creation/management
- Subscription handling
- Order totals calculation
- Revenue statistics

### TransactionService
- Transaction lifecycle
- Razorpay integration
- Refund processing
- Payment verification

### ContactService
- Message handling
- Spam detection
- Response tracking
- Statistics

### ProductService
- Product management
- Plan management
- Pricing data

### TaskService
- Task lifecycle
- Assignment management
- Progress tracking
- Task statistics

## Utilities

### API Response (`utils/apiResponse.js`)
- `successResponse()` - Success format
- `errorResponse()` - Error format
- `paginatedResponse()` - Paginated data
- `apiSuccess()`, `apiError()`, `apiPaginated()` - NextResponse helpers

### Validation (`utils/validation.js`)
- Email, phone, password validation
- ObjectId validation
- Required fields check
- Input sanitization

### Generators (`utils/generators.js`)
- ID generation (orders, transactions, invoices)
- Random string generation
- Slug generation
- File name generation

### Date/Time (`utils/dateTime.js`)
- Date formatting
- Relative time
- Date arithmetic
- Date bounds

### Currency (`utils/currency.js`)
- Currency formatting
- Tax calculation
- Discount application
- Subscription pricing

## Security Features

1. **Password Hashing** - bcrypt with salt
2. **JWT Sessions** - NextAuth.js
3. **Role-Based Access** - Granular permissions
4. **Rate Limiting** - Protection against abuse
5. **Input Validation** - Schema-based
6. **Error Handling** - No sensitive data leakage

## Best Practices

1. **Consistent Response Format** - All APIs return standardized JSON
2. **Error Handling** - Centralized with asyncHandler
3. **Validation** - Schema-based request validation
4. **Separation of Concerns** - Controllers → Services → Models
5. **Index Optimization** - Database indexes on frequently queried fields
6. **Pagination** - All list endpoints support pagination

## Usage Example

```javascript
// API Route
export async function GET(request) {
    const searchParams = request.nextUrl.searchParams;
    return await UserController.getAll(searchParams);
}

// Controller
getAll: asyncHandler(async (searchParams) => {
    const auth = await requireSuperAdmin();
    if (!auth.authorized) return auth.error;
    
    const result = await UserService.getAll(filters);
    return apiPaginated(result.users, page, limit, total);
})

// Service
static async getAll(filters) {
    await dbConnect();
    const users = await User.find(query).select('-password');
    return { users, pagination };
}
```

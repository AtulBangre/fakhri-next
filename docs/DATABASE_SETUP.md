# Database Setup & Seeding Documentation

## Overview

This document describes the MongoDB database integration and seeding setup for the Fakhri IT Services application.

## Environment Configuration

The database connection is configured via environment variables in `.env.local`:

```
MONGODB_URI=mongodb+srv://...
```

## Database Connection

The database connection utility is located at `lib/mongodb.js`. It implements connection pooling and caching to prevent connection exhaustion during development hot reloads.

## Collections & Models

All Mongoose models are located in the `models/` directory:

| Model | Collection | Description |
|-------|------------|-------------|
| User | users | User accounts (Super Admin, Admin, Client) |
| Plan | plans | Subscription plans (Elite, Premium, Platinum) |
| Product | products | Products and services (Within 2 Hours services) |
| Order | orders | Customer orders for subscriptions and add-ons |
| Transaction | transactions | Payment transactions via Razorpay |
| Task | tasks | Client work tasks and assignments |
| Invoice | invoices | Billing invoices |
| Note | notes | Client communication notes |
| File | files | Uploaded documents and files |
| Notification | notifications | In-app notifications |
| Service | services | Service catalog |

## Schema Structure

### User Schema
- Basic info: name, email, password (hashed), role, phone, avatar
- Client-specific: plan, status, manager, company details
- Admin-specific: assignedClients
- Notification preferences
- OAuth support (Google)

### Plan Schema
- Plan info: planId, name, subtitle, price, description
- Features array with included/value flags
- Display settings

### Order Schema
- Order details: user, type (subscription/one-time/add-on)
- Pricing: subtotal, discount, tax, total
- Status tracking
- Billing address

### Transaction Schema
- Payment gateway integration (Razorpay)
- Payment method details
- Refund tracking

## Seeded Data

### Users (Credentials: email / password)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | kuldeepmaurya4296@gmail.com | 123456 |
| Admin | k6263638053@gmail.com | 123456 |
| Client | 2604atulbangre@gmail.com | 123456 |

Additional sample clients:
- emily@beautybrand.com (Platinum)
- michael@homeessentials.com (Elite)
- lisa@fashion.com (Platinum - pending)
- robert@tech.com (Elite)
- amanda@sports.com (Premium)
- alex@digitalgoods.com (Premium)

Additional admins:
- john.anderson@fakhriit.com
- emma.wilson@fakhriit.com

### Plans
| Plan ID | Name | Price | Period |
|---------|------|-------|--------|
| elite | Elite | ₹15,000 | /month |
| premium | Premium | ₹20,000 | /month |
| platinum | Platinum | ₹30,000 | /month |

### Products (Within 2 Hours Services)
- A+ Content Creation/product - ₹500
- Infographics Creation/product - ₹500
- Listing Cataloging - ₹500
- Product Photography - ₹500
- Brand Store Design - ₹500
- Product Video Creation - ₹500
- SEO Optimization - ₹500
- Competitor Analysis - ₹500
- Product Listing Audit - ₹500

### Services
- Amazon Account Setup & Management
- Product Listing & Optimization
- Amazon FBA Operations
- Amazon Ads Management
- A+ / EBC Content & Infographics
- Reconciliation & Finance
- Growth Strategy & Consultation

## Commands

### Seed Database
```bash
npm run seed
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

## API Endpoints

### Health Check
```
GET /api/health
```
Returns database connection status.

### Seed Status
```
GET /api/seed/status
```
Returns counts of all collections in the database.

### Authentication
```
POST /api/auth/[...nextauth]
```
NextAuth.js authentication endpoints with:
- Credentials provider (email/password)
- Google OAuth provider

## Indexes

All models have appropriate indexes for:
- Primary identifiers (email, *Id fields)
- Foreign key relationships
- Status and type fields
- Date fields for sorting
- Frequently queried fields

## Data Relationships

```
User (Client) ──────┬──── Plan (subscription)
                    ├──── Order (purchases)
                    ├──── Task (assigned work)
                    ├──── Invoice (billing)
                    ├──── File (documents)
                    ├──── Note (communications)
                    └──── Notification (alerts)

User (Admin) ───────┬──── User (assignedClients)
                    └──── Task (assignedTo)

Order ──────────────┬──── Transaction (payment)
                    └──── Invoice (billing)
```

## Security Notes

1. Passwords are hashed using bcrypt with salt rounds of 10
2. Sensitive fields are excluded from queries by default
3. JWT tokens are used for session management
4. Google OAuth is supported for social login
5. Role-based access control (super-admin, admin, client)

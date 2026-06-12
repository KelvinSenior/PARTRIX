# Partrix

Partrix is the operating system for rental businesses. It is a full-stack rental management application built with Next.js, React, Prisma, PostgreSQL, and TypeScript, designed to manage rental inventory, bookings, customer records, logistics, payments, finance tracking, deliveries, damage reports, and user authentication from one centralized platform.

## Overview

Partrix provides a complete workflow for rental businesses, including:
- secure signup, login, logout, and session handling
- user role support for `ADMIN`, `MANAGER`, and `STAFF`
- customer and booking management
- inventory tracking and stock validation
- payments and expense tracking
- finance reporting and export endpoints
- delivery planning and damage reporting

## Technology Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Prisma ORM
- PostgreSQL
- Tailwind CSS v4
- bcryptjs
- jsonwebtoken
- Zod
- React Hook Form
- Recharts
- lucide-react
- react-hot-toast

## Core Features

### Authentication & Security
- user signup and login
- JWT session tokens in HTTP-only cookies
- server-side session validation
- role-based access control
- rate limiting for auth endpoints
- environment-driven secret validation

### Booking & Customer Management
- create and manage event bookings
- create or reuse customers automatically
- booking item reservation and availability checking
- booking fees, deposit, balance due, and status tracking
- booking details and return handling

### Inventory Management
- create/edit/delete inventory items
- track SKU, pricing, stock, rented quantity, damaged quantity
- inventory statuses: `AVAILABLE`, `MAINTENANCE`, `OUT_OF_STOCK`, `RETIRED`
- stock validation during booking creation

### Finance & Payments
- record payments and expenses
- support for multiple payment methods
- finance report generation
- export-ready endpoints for payments and expenses

### Deliveries & Damage Reporting
- schedule and manage delivery records
- track delivery status and details
- record damage reports against inventory and bookings
- manage damage severity and resolution state

## Application Structure

```
app/
  api/                # server API route handlers
  bookings/           # booking UI pages
  customers/          # customer UI pages
  damage/             # damage report UI pages
  deliveries/         # delivery UI pages
  finance/            # finance dashboard pages
  inventory/          # inventory pages
  login/              # login page
  signup/             # signup page
  dashboard/          # dashboard page
  profile/            # user profile page
components/           # shared UI components
lib/                  # auth, cookies, JWT, Prisma, validation, rate limiting
prisma/               # database schema and migrations
services/             # business logic and data access
types/                # TypeScript type definitions
public/               # static assets and uploads
```

## Important Files

- `app/page.tsx` — landing page with login/signup/dashboard links
- `app/layout.tsx` — root application layout and provider wrapper
- `components/AuthProvider.tsx` — auth context provider
- `components/ui/UiProvider.tsx` — UI theme/provider wrapper
- `lib/prisma.ts` — Prisma client instantiation
- `lib/jwt.ts` — JWT signing and verification
- `lib/cookies.ts` — HTTP-only cookie helpers
- `lib/apiAuth.ts` — authenticated user helper for API routes
- `lib/authValidation.ts` — Zod schemas for auth payload validation
- `lib/rateLimiter.ts` — request throttling helper
- `services/*` — business logic for auth, booking, customer, inventory, finance, delivery, damage
- `prisma/schema.prisma` — database model definitions

## Data Model Summary

### Main models
- `User` — app users with email, password hash, role, and status
- `Customer` — rental customers with contact info and notes
- `InventoryItem` — stock items with SKU, pricing, quantity, status, and damage tracking
- `Booking` — event reservations tied to customers and booking items
- `BookingItem` — inventory items reserved for a booking
- `Payment` — payment records tied to bookings
- `Expense` — operating or procurement expenses
- `Delivery` — delivery scheduling and status information
- `DamageReport` — damage cases for inventory items and bookings
- `ActivityLog` — audit-style event logging

### Key enums
- `UserRole`: `ADMIN`, `MANAGER`, `STAFF`
- `BookingStatus`: `PENDING`, `CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `NO_SHOW`
- `PaymentMethod`: `CASH`, `CREDIT_CARD`, `BANK_TRANSFER`, `CHECK`, `MOBILE_WALLET`
- `PaymentStatus`: `PENDING`, `COMPLETED`, `FAILED`, `REFUNDED`
- `InventoryStatus`: `AVAILABLE`, `MAINTENANCE`, `OUT_OF_STOCK`, `RETIRED`
- `DeliveryStatus`: `SCHEDULED`, `IN_TRANSIT`, `DELIVERED`, `COMPLETED`, `CANCELLED`
- `ExpenseCategory`: `OPERATIONS`, `MAINTENANCE`, `PROCUREMENT`, `MARKETING`, `OTHER`
- `DamageSeverity`: `MINOR`, `MODERATE`, `SEVERE`
- `ActivityLevel`: `INFO`, `WARNING`, `ERROR`

## API Routes Overview

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/session`

### Bookings
- `GET /api/bookings`
- `POST /api/bookings`
- `GET /api/bookings/[id]`
- `PATCH /api/bookings/[id]`
- `DELETE /api/bookings/[id]`

### Customers
- `GET /api/customers`
- `POST /api/customers`
- `GET /api/customers/[id]`
- `PATCH /api/customers/[id]`
- `DELETE /api/customers/[id]`
- `GET /api/customers/[id]/details`

### Inventory
- `GET /api/inventory`
- `POST /api/inventory`
- `GET /api/inventory/[id]`
- `PATCH /api/inventory/[id]`
- `DELETE /api/inventory/[id]`
- `POST /api/inventory/upload`

### Damage
- `GET /api/damage`
- `POST /api/damage`
- `GET /api/damage/[id]`
- `PATCH /api/damage/[id]`
- `DELETE /api/damage/[id]`

### Deliveries
- `GET /api/deliveries`
- `POST /api/deliveries`
- `GET /api/deliveries/[id]`
- `PATCH /api/deliveries/[id]`
- `DELETE /api/deliveries/[id]`

### Payments & Finance
- `GET /api/payments`
- `POST /api/payments`
- `GET /api/payments/export`
- `GET /api/finance/reports`
- `GET /api/finance/report-html`
- `GET /api/finance/report-pdf`
- `GET /api/expenses`
- `POST /api/expenses`
- `GET /api/expenses/export`

## Environment Variables

Create a `.env` file with the required values:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/partrix
JWT_SECRET=your-very-secret-string-with-at-least-32-chars
NODE_ENV=development
RATE_LIMIT_WINDOW_SECONDS=60
RATE_LIMIT_MAX_REQUESTS=10
```

### Required
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: JWT signing secret (minimum 32 characters)
- `NODE_ENV`: `development`, `production`, or `test`

### Optional rate limiting
- `RATE_LIMIT_WINDOW_SECONDS`
- `RATE_LIMIT_MAX_REQUESTS`

## Local Setup

Install dependencies:

```bash
npm install
```

Generate Prisma client:

```bash
npx prisma generate
```

Apply database schema:

```bash
npx prisma db push
```
```
# or with migrations
npx prisma migrate dev --name init
```

Start development server:

```bash
npm run dev
```

Build and start production server:

```bash
npm run build
npm run start
```

Lint the repository:

```bash
npm run lint
```

## Development Notes

- Authentication state is derived from a JWT stored in an HTTP-only cookie.
- The `app/api/*` routes use `getAuthenticatedUser()` to protect data operations.
- Bookings enforce item availability by checking overlapping reservations.
- Customer creation is automatic when a booking is made with a new email.
- Inventory and booking flows are linked so stock counts are updated during booking creation.
- Rate limiting uses an in-memory store for auth endpoints.

## Extending the App

Suggested improvements:
- add admin user management and role permissions UI
- implement email or SMS notifications for bookings and deliveries
- add multi-currency support
- connect a real payment gateway
- add audit log filtering and event history mail
- add a dedicated reporting dashboard with export templates

---

Partrix is ready to be used as a rental operations and booking management platform with a modern Next.js + Prisma architecture.
